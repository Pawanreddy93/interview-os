"use client";

import React from "react";

interface ProgressBarProps {
  current: number;
  total: number;
  isFollowUp?: boolean;
}

export default function ProgressBar({ current, total, isFollowUp }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-400 font-medium">
          Question {Math.min(current + 1, total)} of {total}
          {isFollowUp && (
            <span className="ml-2 text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Follow-up
            </span>
          )}
        </span>
        <span className="text-slate-500 font-mono text-xs">{pct}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-1 mt-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i < current
                ? "bg-emerald-500"
                : i === current
                ? "bg-blue-400"
                : "bg-slate-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
