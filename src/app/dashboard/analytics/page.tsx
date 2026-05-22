"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Clock, ArrowRight, Play } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getAllSavedInterviews, type SavedInterview } from "@/lib/interviewEngine";

const ROLE_LABELS: Record<string, string> = {
  "software-engineer": "Software Engineer",
  "technical-support": "Technical Support",
  "qa-tester": "QA Tester",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10b981" :
    score >= 65 ? "#3b82f6" :
    score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-sm font-bold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

export default function AnalyticsListPage() {
  const [interviews, setInterviews] = useState<SavedInterview[]>([]);

  useEffect(() => {
    setInterviews(getAllSavedInterviews());
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics History</h1>
          <p className="text-slate-400">All your past interview results in one place.</p>
        </div>
        <Link href="/dashboard/roles">
          <Button className="gap-2">
            <Play size={14} fill="currentColor" /> New Interview
          </Button>
        </Link>
      </div>

      {interviews.length === 0 ? (
        <Card className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No interviews yet</h3>
          <p className="text-slate-500 mb-6">Complete your first interview to see your analytics here.</p>
          <Link href="/dashboard/roles">
            <Button>Start an Interview</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {interviews.map((iv) => (
            <Card key={iv.id} className="hover:border-slate-600 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <Clock className="text-slate-400 w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold text-white">
                      {ROLE_LABELS[iv.role] || iv.role}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 capitalize">
                      {iv.difficulty}
                    </span>
                    <span className="text-xs text-slate-500">{timeAgo(iv.completedAt)}</span>
                  </div>
                  <p className="text-sm text-slate-500">{iv.answersCount} answers given</p>

                  {iv.analytics && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Overall", value: iv.analytics.overall_score },
                        { label: "Technical", value: iv.analytics.technical_knowledge },
                        { label: "Communication", value: iv.analytics.communication },
                        { label: "Confidence", value: iv.analytics.confidence },
                      ].map(m => (
                        <div key={m.label}>
                          <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                          <ScoreBar score={m.value} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link href={`/dashboard/analytics/${iv.id}`} className="flex-shrink-0">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    View Report <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
