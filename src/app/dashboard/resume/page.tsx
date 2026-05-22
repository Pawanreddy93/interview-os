"use client";

import React, { useState } from "react";
import {
  UploadCloud, FileText, RefreshCw, Briefcase,
  CheckCircle, AlertCircle, TrendingUp, Code, Lightbulb,
  ChevronRight, Loader2
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { ResumeAnalysis } from "@/lib/ai/groq";

const ROLES = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "technical-support", label: "Technical Support" },
  { value: "qa-tester", label: "QA Tester" },
  { value: "vlsi-engineer", label: "VLSI Engineer" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "java-developer", label: "Java Developer" },
  { value: "full-stack-java", label: "Full Stack Java" },
];

function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
        }
        resolve(text.trim());
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function ATSGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444";
  const r = 52;
  const circ = Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-20 overflow-hidden">
        <svg className="w-full" viewBox="0 0 120 65">
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <span className="text-3xl font-black text-white">{score}</span>
        </div>
      </div>
      <div
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          background: `${color}20`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {score >= 80 ? "Strong Match" : score >= 60 ? "Good Fit" : score >= 40 ? "Needs Work" : "Poor Match"}
      </div>
    </div>
  );
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRole, setSelectedRole] = useState("software-engineer");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResumeAnalysis | null>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else setError("Please upload a PDF file.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    try {
      const resumeText = await extractTextFromPDF(file);
      if (!resumeText || resumeText.length < 50) {
        throw new Error("Could not extract text from PDF. Please ensure it is a text-based PDF.");
      }
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, role: selectedRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }
      const data: ResumeAnalysis = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChangeResume = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

  const roleLabel = ROLES.find(r => r.value === selectedRole)?.label || selectedRole;

  if (result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Resume Analysis</h1>
            <p className="text-slate-400 text-sm">{file?.name} &middot; {roleLabel}</p>
          </div>
          <Button variant="outline" onClick={handleChangeResume} className="gap-2">
            <RefreshCw size={15} /> Change Resume
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="flex flex-col items-center justify-center text-center py-8 bg-gradient-to-br from-slate-800 to-slate-900 border-t-4 border-blue-500">
            <p className="text-slate-400 font-medium text-sm uppercase tracking-wider mb-4">ATS Score</p>
            <ATSGauge score={result.ats_score} />
            <p className="text-slate-400 text-xs mt-4 max-w-xs">{result.overall_summary}</p>
          </Card>

          <Card className="py-6 px-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={16} className="text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Role Fit: {roleLabel}</h3>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-2 uppercase">Matched Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matched_skills.slice(0, 8).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-2 uppercase">Missing Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.missing_skills.slice(0, 8).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500">Experience Level</span>
              <span className="text-xs font-semibold text-white capitalize px-2 py-0.5 bg-slate-800 rounded-lg">
                {result.experience_level}
              </span>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-t-4 border-emerald-500">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" /> Resume Strengths
            </h3>
            <ul className="space-y-3">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-xl">
                  <TrendingUp size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-t-4 border-amber-500">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" /> To Reach ATS 90+
            </h3>
            <ul className="space-y-3">
              {result.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 p-3 rounded-xl">
                  <ChevronRight size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-300 text-sm leading-relaxed">{imp}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="border-t-4 border-blue-500">
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <Code size={16} className="text-blue-400" /> Recommended Projects for {roleLabel}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {result.recommended_projects.map((proj, i) => (
              <div key={i} className="bg-blue-500/5 border border-blue-500/15 p-4 rounded-xl space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug">{proj.title}</p>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{proj.description}</p>
                <div className="flex flex-wrap gap-1">
                  {proj.skills.map((sk, j) => (
                    <span key={j} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 text-xs rounded">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-t-4 border-purple-500">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb size={16} className="text-purple-400" /> Ready to Practice?
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Your resume analysis is ready. Practice your {roleLabel} interview to complement your profile.
          </p>
          <Button onClick={() => window.location.href = `/dashboard/roles`} className="gap-2">
            Start {roleLabel} Interview <ChevronRight size={16} />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Resume Analysis</h1>
        <p className="text-slate-400">Upload your resume to get an ATS score and role-specific project recommendations.</p>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Analyze for Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  onClick={() => setSelectedRole(r.value)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                    selectedRole === r.value
                      ? "bg-blue-600 text-white border border-blue-500"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-500/5"
                : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
            }`}
          >
            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="text-slate-400 w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Drag and drop your resume</h3>
            <p className="text-slate-500 text-sm mb-5">PDF format only, up to 5MB</p>
            <input
              type="file"
              id="resume-upload"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={() => document.getElementById("resume-upload")?.click()}>
              Browse Files
            </Button>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-400 w-5 h-5" />
                <div>
                  <p className="text-white font-medium text-sm">{file.name}</p>
                  <p className="text-slate-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove</Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleAnalyze}
              disabled={!file || analyzing}
              isLoading={analyzing}
              className="gap-2 px-8"
            >
              {analyzing ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Analyzing Resume...
                </>
              ) : (
                "Analyze Resume"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
