"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Play, Clock, Award, TrendingUp, Zap, BarChart3, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getAllSavedInterviews, type SavedInterview } from "@/lib/interviewEngine";
import { getRemainingInterviews, getMaxDaily } from "@/lib/interviewLimiter";

function ScoreChip({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 65 ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
    : score >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  return (
    <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${color}`}>
      {score}
    </span>
  );
}

const ROLE_LABELS: Record<string, string> = {
  "software-engineer": "Software Engineer",
  "technical-support": "Technical Support",
  "qa-tester": "QA Tester",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<SavedInterview[]>([]);
  const remaining = getRemainingInterviews();
  const maxDaily = getMaxDaily();

  useEffect(() => {
    setInterviews(getAllSavedInterviews());
  }, []);

  const avgScore =
    interviews.length > 0
      ? Math.round(
          interviews
            .filter(i => i.analytics?.overall_score)
            .reduce((sum, i) => sum + (i.analytics?.overall_score ?? 0), 0) /
            Math.max(1, interviews.filter(i => i.analytics?.overall_score).length)
        )
      : null;

  const bestScore = interviews.reduce(
    (best, i) => Math.max(best, i.analytics?.overall_score ?? 0),
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, {user?.displayName || user?.email?.split("@")[0] || "there"}!
        </h1>
        <p className="text-slate-400">Here&apos;s your interview preparation progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Play className="text-blue-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Total Interviews</p>
            <p className="text-2xl font-bold text-white">{interviews.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Award className="text-emerald-400 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Average Score</p>
            {avgScore !== null ? (
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">{avgScore}/100</p>
                {bestScore > 0 && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Best: {bestScore}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No interviews yet</p>
            )}
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">Daily Quota</p>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-lg font-bold text-white">{remaining}/{maxDaily} remaining</p>
            </div>
            <Link href="/dashboard/roles">
              <Button size="sm" className="gap-2" disabled={remaining === 0}>
                <Play size={12} fill="currentColor" />
                {remaining > 0 ? "Start Interview" : "Come back tomorrow"}
              </Button>
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            {Array.from({ length: maxDaily }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${i < (maxDaily - remaining) ? "bg-slate-700" : "bg-blue-500"}`}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Recent Interviews</h2>
            </div>

            {interviews.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">No interviews yet</p>
                  <p className="text-slate-600 text-sm mt-1">Complete your first interview to see results here.</p>
                </div>
                <Link href="/dashboard/roles">
                  <Button size="sm" className="gap-2 mt-2">
                    <Play size={13} fill="currentColor" /> Start First Interview
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 8).map(iv => (
                  <div
                    key={iv.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <Clock className="text-slate-400 w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {ROLE_LABELS[iv.role] || iv.role}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {iv.difficulty} · {iv.answersCount} answers · {timeAgo(iv.completedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {iv.analytics && <ScoreChip score={iv.analytics.overall_score} />}
                      <Link href={`/dashboard/analytics/${iv.id}`}>
                        <Button variant="ghost" size="sm">Review</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-400" /> Quick Tips
            </h2>
            <ul className="space-y-3">
              {[
                "Use the STAR method for behavioral questions.",
                "Speak clearly — take a breath before answering.",
                "Give specific examples with measurable results.",
                "It's okay to pause and think before answering.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/10 to-emerald-600/5 border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-blue-400" />
              <h3 className="font-semibold text-white text-sm">AI-Efficient Design</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              InterviewOS uses only <strong className="text-white">1 AI call per interview</strong> — at the end. 
              Questions are loaded locally, keeping your quota free for 100+ interview sessions.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
