"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, CheckCircle, Target, Lightbulb,
  MessageSquare, Brain, Shield, BookOpen, TrendingUp, Play,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getAnalyticsById, loadSessionFromStorage, type InterviewAnalytics } from "@/lib/interviewEngine";

interface ScoreRingProps {
  score: number;
  label: string;
  color: string;
  icon: React.ReactNode;
}

function ScoreRing({ score, label, color, icon }: ScoreRingProps) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{score}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-slate-400 text-xs">
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="text-slate-400 font-mono">{value}/100</span>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<InterviewAnalytics | null>(null);
  const [role, setRole] = useState("Interview");
  const [error, setError] = useState("");

  useEffect(() => {
    const data = getAnalyticsById(id);
    if (data) {
      setAnalytics(data);
      const sess = loadSessionFromStorage(id);
      if (sess) {
        setRole(sess.role.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
      }
    } else {
      setError("Analytics not found. The session may have expired.");
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
          <Loader2 className="absolute inset-0 m-auto w-7 h-7 text-blue-400 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white">Loading your analysis...</h2>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-400">{error || "Analytics not found."}</p>
        <Button onClick={() => router.push("/dashboard/roles")}>Start a New Interview</Button>
      </div>
    );
  }

  const scoreColor = (s: number) =>
    s >= 80 ? "#10b981" : s >= 60 ? "#3b82f6" : s >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{role} Analysis</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your AI-generated performance report</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center text-center py-10 bg-gradient-to-br from-slate-800 to-slate-900 border-t-4 border-blue-500">
          <p className="text-slate-400 font-medium mb-3 text-sm uppercase tracking-wider">Overall Score</p>
          <div
            className="text-8xl font-black mb-3"
            style={{ color: scoreColor(analytics.overall_score) }}
          >
            {analytics.overall_score}
          </div>
          <p className="text-slate-500 text-sm">out of 100</p>
          <div className="mt-4 px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              background: `${scoreColor(analytics.overall_score)}20`,
              color: scoreColor(analytics.overall_score),
              border: `1px solid ${scoreColor(analytics.overall_score)}40`,
            }}>
            {analytics.overall_score >= 80 ? "Excellent" :
              analytics.overall_score >= 65 ? "Good" :
                analytics.overall_score >= 50 ? "Fair" : "Needs Work"}
          </div>
        </Card>

        <Card className="py-6 px-8 flex flex-col justify-center gap-6">
          <h3 className="text-lg font-bold text-white">Category Scores</h3>
          <ScoreBar label="Technical Knowledge" value={analytics.technical_knowledge} color="#3b82f6" />
          <ScoreBar label="Communication" value={analytics.communication} color="#8b5cf6" />
          <ScoreBar label="Confidence" value={analytics.confidence} color="#10b981" />
          <ScoreBar label="Grammar & Clarity" value={analytics.grammar} color="#f59e0b" />
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center py-5 bg-slate-900/50">
          <ScoreRing
            score={analytics.technical_knowledge}
            label="Technical"
            color="#3b82f6"
            icon={<Brain size={12} />}
          />
        </Card>
        <Card className="flex flex-col items-center py-5 bg-slate-900/50">
          <ScoreRing
            score={analytics.communication}
            label="Communication"
            color="#8b5cf6"
            icon={<MessageSquare size={12} />}
          />
        </Card>
        <Card className="flex flex-col items-center py-5 bg-slate-900/50">
          <ScoreRing
            score={analytics.confidence}
            label="Confidence"
            color="#10b981"
            icon={<Shield size={12} />}
          />
        </Card>
        <Card className="flex flex-col items-center py-5 bg-slate-900/50">
          <ScoreRing
            score={analytics.grammar}
            label="Grammar"
            color="#f59e0b"
            icon={<BookOpen size={12} />}
          />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-emerald-500">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <CheckCircle className="text-emerald-500" size={20} /> Key Strengths
          </h3>
          <ul className="space-y-3">
            {analytics.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-xl">
                <TrendingUp size={15} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 text-sm leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-t-4 border-amber-500">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Target className="text-amber-500" size={20} /> Areas to Improve
          </h3>
          <ul className="space-y-3">
            {analytics.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 p-3.5 rounded-xl">
                <Target size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 text-sm leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="border-t-4 border-blue-500">
        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <Lightbulb className="text-blue-400" size={20} /> Improvement Suggestions
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {analytics.suggestions.map((s, i) => (
            <div key={i} className="bg-blue-500/5 border border-blue-500/15 p-4 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 mb-3">
                {i + 1}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button size="lg" onClick={() => router.push("/dashboard/roles")} className="gap-2">
          <Play size={16} fill="currentColor" /> Practice Again
        </Button>
        <Button size="lg" variant="secondary" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
