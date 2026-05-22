"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Bell, Shield, Trash2, Save, CheckCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [defaultDifficulty, setDefaultDifficulty] = useState("mixed");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [interviewsToday, setInterviewsToday] = useState(0);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || user?.email?.split("@")[0] || "");

    const savedDiff = localStorage.getItem("pref_difficulty") || "mixed";
    const savedVoice = localStorage.getItem("pref_voice");
    setDefaultDifficulty(savedDiff);
    setVoiceEnabled(savedVoice !== "false");

    const today = new Date().toISOString().split("T")[0];
    const raw = localStorage.getItem("interviewCount");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.date === today) setInterviewsToday(parsed.count || 0);
      } catch {}
    }

    try {
      const saved = JSON.parse(localStorage.getItem("savedInterviews") || "[]");
      setTotalInterviews(saved.length);
    } catch {}
  }, [user]);

  function handleSave() {
    localStorage.setItem("pref_difficulty", defaultDifficulty);
    localStorage.setItem("pref_voice", String(voiceEnabled));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleClearHistory() {
    const keys = Object.keys(localStorage).filter(
      k => k.startsWith("session_") || k.startsWith("analytics_") || k === "savedInterviews"
    );
    keys.forEach(k => localStorage.removeItem(k));
    setTotalInterviews(0);
    setShowClearConfirm(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400">Manage your profile and interview preferences.</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <User size={16} className="text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">Email cannot be changed here.</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Bell size={16} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Interview Preferences</h2>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Default Difficulty
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["easy", "medium", "hard", "mixed"].map(d => (
                <button
                  key={d}
                  onClick={() => setDefaultDifficulty(d)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium capitalize transition-all ${
                    defaultDifficulty === d
                      ? "bg-blue-600 text-white border border-blue-500"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-200">Voice Readout</p>
              <p className="text-xs text-slate-500 mt-0.5">Have the AI read questions aloud during interviews</p>
            </div>
            <button
              onClick={() => setVoiceEnabled(v => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                voiceEnabled ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  voiceEnabled ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Shield size={16} className="text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Usage & Limits</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-200">Interviews Today</p>
              <p className="text-xs text-slate-500 mt-0.5">Daily limit resets at midnight</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{interviewsToday}</span>
              <span className="text-slate-500 text-sm"> / 4</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-200">Total Interviews Completed</p>
              <p className="text-xs text-slate-500 mt-0.5">Stored in your browser</p>
            </div>
            <span className="text-2xl font-bold text-white">{totalInterviews}</span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <Trash2 size={16} className="text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Data Management</h2>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-200">Clear Interview History</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently deletes all {totalInterviews} saved sessions and analytics
            </p>
          </div>
          {!showClearConfirm ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowClearConfirm(true)}
              disabled={totalInterviews === 0}
            >
              Clear All
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Are you sure?</span>
              <Button variant="danger" size="sm" onClick={handleClearHistory}>
                Confirm
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} className="gap-2 px-8">
          {saved ? (
            <>
              <CheckCircle size={16} />
              Saved
            </>
          ) : (
            <>
              <Save size={16} />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
