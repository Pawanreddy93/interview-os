"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Terminal, Headphones, Bug, ArrowRight, AlertTriangle, Zap,
  BarChart3, Trophy, Cpu, LineChart, Coffee, Layers
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { canStartInterview, getRemainingInterviews, getMaxDaily } from "@/lib/interviewLimiter";

type Difficulty = "easy" | "medium" | "hard" | "mixed";

const roles = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    icon: Terminal,
    accent: "#3b82f6",
    description: "Algorithms, system design, OOP, APIs, databases, and architecture.",
    topics: ["OOP & Design Patterns", "APIs & Databases", "System Design", "CI/CD & DevOps"],
    count: 60,
  },
  {
    id: "technical-support",
    title: "Technical Support",
    icon: Headphones,
    accent: "#10b981",
    description: "Networking, OS troubleshooting, customer handling, and ITIL processes.",
    topics: ["Network Troubleshooting", "ITIL & ITSM", "Customer Handling", "Security & Malware"],
    count: 60,
  },
  {
    id: "qa-tester",
    title: "QA Tester",
    icon: Bug,
    accent: "#8b5cf6",
    description: "Test cases, automation, bug reporting, and testing methodologies.",
    topics: ["Test Case Design", "Automation Frameworks", "API Testing", "Security Testing"],
    count: 60,
  },
  {
    id: "vlsi-engineer",
    title: "VLSI Engineer",
    icon: Cpu,
    accent: "#f97316",
    description: "RTL design, timing analysis, DFT, physical design, and semiconductor concepts.",
    topics: ["RTL & Verilog", "STA & Timing", "DFT & ATPG", "Physical Design"],
    count: 60,
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    icon: LineChart,
    accent: "#06b6d4",
    description: "SQL, Python, data visualization, statistics, and BI tools.",
    topics: ["SQL & Databases", "Python & Pandas", "Power BI / Tableau", "Statistics & A/B Testing"],
    count: 60,
  },
  {
    id: "java-developer",
    title: "Java Developer",
    icon: Coffee,
    accent: "#ef4444",
    description: "Core Java, OOP, Spring Boot, Hibernate, REST APIs, and design patterns.",
    topics: ["Core Java & OOP", "Spring Boot", "Hibernate & JPA", "Design Patterns"],
    count: 60,
  },
  {
    id: "full-stack-java",
    title: "Full Stack Java",
    icon: Layers,
    accent: "#6366f1",
    description: "React frontend, Spring Boot backend, databases, microservices, and DevOps.",
    topics: ["React & JavaScript", "Spring Boot APIs", "MySQL & MongoDB", "Docker & CI/CD"],
    count: 60,
  },
];

const difficulties: { id: Difficulty; label: string; desc: string; color: string }[] = [
  { id: "easy", label: "Easy", desc: "Fundamentals & concepts", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  { id: "medium", label: "Medium", desc: "Applied knowledge", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  { id: "hard", label: "Hard", desc: "Advanced & architecture", color: "text-red-400 border-red-500/30 bg-red-500/10" },
  { id: "mixed", label: "Mixed", desc: "All levels", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
];

export default function RolesPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("mixed");

  const remaining = getRemainingInterviews();
  const canStart = canStartInterview();
  const maxDaily = getMaxDaily();

  function handleStart() {
    if (!selectedRole || !canStart) return;
    router.push(`/dashboard/interview?role=${selectedRole}&difficulty=${selectedDifficulty}`);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Start an Interview</h1>
        <p className="text-slate-400">Select your role and difficulty level to begin.</p>
      </div>

      {!canStart && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Daily limit reached</p>
            <p className="text-sm text-amber-500/80 mt-0.5">
              You&apos;ve used all {maxDaily} free interviews for today. Come back tomorrow to practice again.
            </p>
          </div>
        </div>
      )}

      {canStart && remaining < maxDaily && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Zap size={14} className="text-blue-400" />
          <span>{remaining} interview{remaining !== 1 ? "s" : ""} remaining today</span>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Choose Your Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {roles.map(role => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`rounded-2xl p-5 cursor-pointer transition-all duration-200 border-2 ${
                  isSelected
                    ? "bg-slate-800/80 shadow-[0_0_25px_rgba(0,0,0,0.3)]"
                    : "bg-slate-900 border-slate-800 hover:border-slate-600"
                }`}
                style={isSelected ? { borderColor: role.accent, boxShadow: `0 0 20px ${role.accent}20` } : {}}
              >
                <div
                  className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center border"
                  style={isSelected
                    ? { background: `${role.accent}20`, borderColor: `${role.accent}40` }
                    : { background: "#1e293b", borderColor: "#334155" }}
                >
                  <Icon size={20} style={{ color: isSelected ? role.accent : "#94a3b8" }} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{role.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {role.topics.map(t => (
                    <span
                      key={t}
                      className="text-xs px-1.5 py-0.5 rounded border"
                      style={isSelected
                        ? { background: `${role.accent}15`, color: role.accent, borderColor: `${role.accent}30` }
                        : { background: "#0f172a", color: "#64748b", borderColor: "#1e293b" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5 text-slate-500 text-xs">
                  <BarChart3 size={11} />
                  <span>{role.count} questions</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedRole && (
        <Card className="animate-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" /> Select Difficulty
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {difficulties.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedDifficulty === d.id
                    ? d.color + " border-current"
                    : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600"
                }`}
              >
                <p className="font-semibold text-sm">{d.label}</p>
                <p className="text-xs mt-0.5 opacity-80">{d.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              10 questions · ~10 min · AI analysis at the end
            </p>
            <Button
              size="lg"
              onClick={handleStart}
              disabled={!canStart}
              className="gap-2 group"
            >
              Start Interview
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
