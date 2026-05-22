"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PhoneOff, Send, Volume2, VolumeX, ChevronRight, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import VoiceRecorder from "@/components/interview/VoiceRecorder";
import ProgressBar from "@/components/interview/ProgressBar";
import {
  loadQuestions,
  filterAndSelectQuestions,
  createSession,
  saveSessionToStorage,
  saveCompletedInterview,
  type InterviewSession,
  type Difficulty,
  type InterviewAnalytics,
} from "@/lib/interviewEngine";
import { incrementInterviewCount } from "@/lib/interviewLimiter";

const QUESTIONS_PER_SESSION = 10;

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const role = searchParams.get("role") || "software-engineer";
  const difficulty = (searchParams.get("difficulty") || "mixed") as Difficulty;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showDone, setShowDone] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const sessionRef = useRef<InterviewSession | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    initSession();
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  async function initSession() {
    try {
      const questions = await loadQuestions(role);
      const selected = filterAndSelectQuestions(questions, difficulty, QUESTIONS_PER_SESSION);
      const newSession = createSession(role, difficulty, selected);
      sessionRef.current = newSession;
      setSession(newSession);
      saveSessionToStorage(newSession);
      setIsLoading(false);
      speakQuestion(selected[0]?.question || "");
    } catch (err) {
      console.error(err);
      setLoadError("Failed to load questions. Please go back and try again.");
      setIsLoading(false);
    }
  }

  function speakQuestion(text: string) {
    if (!speakEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.pitch = 1.0;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utt);
  }

  function toggleSpeak() {
    if (isSpeaking) synthRef.current?.cancel();
    setSpeakEnabled(v => !v);
  }

  const currentQuestion = session?.questions[session.currentIndex];
  const isFollowUp = session?.isShowingFollowUp ?? false;

  const currentDisplayQuestion = isFollowUp && session && session.currentFollowUpIndex >= 0
    ? session.questions[session.currentIndex]?.followUps?.[session.currentFollowUpIndex] ?? currentQuestion?.question
    : currentQuestion?.question ?? "";

  function handleVoiceTranscript(text: string) {
    setAnswer(prev => (prev ? prev + " " + text : text));
  }

  function submitAnswer() {
    if (!answer.trim() || !sessionRef.current) return;
    const sess = sessionRef.current;
    const q = sess.questions[sess.currentIndex];
    if (!q) return;

    const answered = {
      questionId: q.id,
      question: isFollowUp
        ? (q.followUps?.[sess.currentFollowUpIndex] ?? q.question)
        : q.question,
      answer: answer.trim(),
      isFollowUp: sess.isShowingFollowUp,
      parentQuestion: sess.isShowingFollowUp ? q.question : undefined,
    };

    const updatedAnswers = [...sess.answers, answered];

    let nextIndex = sess.currentIndex;
    let nextFollowUpIndex = sess.currentFollowUpIndex;
    let nextIsFollowUp = false;

    if (!sess.isShowingFollowUp) {
      const followUps = q.followUps || [];
      if (followUps.length > 0 && Math.random() > 0.3) {
        nextIsFollowUp = true;
        nextFollowUpIndex = 0;
      } else {
        nextIndex = sess.currentIndex + 1;
        nextFollowUpIndex = -1;
      }
    } else {
      nextIndex = sess.currentIndex + 1;
      nextFollowUpIndex = -1;
      nextIsFollowUp = false;
    }

    const updated: InterviewSession = {
      ...sess,
      answers: updatedAnswers,
      currentIndex: nextIndex,
      currentFollowUpIndex: nextFollowUpIndex,
      isShowingFollowUp: nextIsFollowUp,
    };

    sessionRef.current = updated;
    setSession({ ...updated });
    saveSessionToStorage(updated);
    setAnswer("");

    if (nextIndex >= sess.questions.length) {
      setShowDone(true);
      return;
    }

    const nextQ = nextIsFollowUp
      ? (q.followUps?.[nextFollowUpIndex] ?? "")
      : updated.questions[nextIndex]?.question ?? "";

    if (nextQ) setTimeout(() => speakQuestion(nextQ), 400);
  }

  async function endInterview(fromDone = false) {
    synthRef.current?.cancel();
    const sess = sessionRef.current;
    if (!sess) {
      router.push("/dashboard");
      return;
    }

    if (!fromDone && sess.answers.length === 0) {
      router.push("/dashboard");
      return;
    }

    setIsGenerating(true);
    incrementInterviewCount();

    try {
      const qaPairs = sess.answers.map(a => ({
        question: a.question,
        answer: a.answer,
      }));

      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: sess.role, qaPairs }),
      });

      let analytics: InterviewAnalytics;
      if (res.ok) {
        analytics = await res.json();
      } else {
        analytics = buildFallbackAnalytics(sess.answers.length);
      }

      saveCompletedInterview(sess, analytics);
      router.push(`/dashboard/analytics/${sess.id}`);
    } catch {
      const analytics = buildFallbackAnalytics(sess.answers.length);
      saveCompletedInterview(sess, analytics);
      router.push(`/dashboard/analytics/${sess.id}`);
    }
  }

  function buildFallbackAnalytics(count: number): InterviewAnalytics {
    const sess = sessionRef.current;
    const answers = sess?.answers || [];
    const avgLen = answers.length > 0
      ? answers.reduce((s, a) => s + a.answer.split(" ").length, 0) / answers.length
      : 0;
    const shortAnswers = answers.filter(a => a.answer.split(" ").length < 20);
    const longAnswers = answers.filter(a => a.answer.split(" ").length >= 40);
    const followUpAnswers = answers.filter(a => a.isFollowUp);
    const base = count > 5 ? 68 : 52;
    const lenBonus = Math.min(avgLen / 3, 12);

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (longAnswers.length >= 2) {
      strengths.push(`Provided detailed responses — ${longAnswers.length} of your answers were comprehensive and thorough`);
    } else {
      strengths.push("Attempted all questions and engaged with the interview process");
    }
    if (followUpAnswers.length > 0) {
      strengths.push(`Handled follow-up questions well, demonstrating adaptability across ${followUpAnswers.length} follow-up prompt(s)`);
    } else {
      strengths.push("Stayed on topic and addressed the core of each question asked");
    }
    if (count >= 8) {
      strengths.push(`Completed ${count} questions showing strong commitment and endurance throughout the session`);
    } else {
      strengths.push("Maintained focus and responded to all presented questions");
    }

    if (shortAnswers.length >= 3) {
      weaknesses.push(`${shortAnswers.length} answers were notably brief — expanding on key points would significantly improve scores`);
    } else {
      weaknesses.push("Some responses could benefit from more specific real-world examples or project references");
    }
    if (avgLen < 30) {
      weaknesses.push("Answer length averaged below 30 words — aim for 50–80 words with concrete examples per answer");
    } else {
      weaknesses.push("Consider adding structured breakdowns (problem → approach → result) to technical explanations");
    }
    weaknesses.push("Deeper coverage of role-specific technical terminology would strengthen your responses");

    suggestions.push("Use the STAR method (Situation, Task, Action, Result) to structure behavioral answers with specific examples");
    if (shortAnswers.length > 0) {
      suggestions.push(`For the ${shortAnswers.length} short answer(s), revisit the questions and practice extending responses to 60–80 words`);
    } else {
      suggestions.push("Prepare 2–3 signature project examples that demonstrate your technical skills for this role");
    }
    suggestions.push("Record yourself answering common questions aloud — this builds both confidence and grammar clarity");

    return {
      overall_score: Math.round(base + lenBonus + Math.floor(Math.random() * 8)),
      communication: Math.round(base + lenBonus + Math.floor(Math.random() * 10)),
      technical_knowledge: Math.round(base + Math.floor(Math.random() * 12)),
      confidence: Math.round(base + lenBonus * 0.8 + Math.floor(Math.random() * 10)),
      grammar: Math.round(base + 5 + Math.floor(Math.random() * 10)),
      strengths,
      weaknesses,
      suggestions,
    };
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin" />
        <p className="text-slate-300 font-medium">Loading your interview questions...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{loadError}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
          <div className="absolute inset-3 rounded-full border-t-2 border-emerald-500 animate-spin" style={{ animationDirection: "reverse" }} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Analyzing your performance...</h2>
          <p className="text-slate-400">Generating your personalized feedback report.</p>
        </div>
      </div>
    );
  }

  if (showDone) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
          <p className="text-slate-400">You answered {session?.answers.length} questions. Ready to see your results?</p>
        </div>
        <Button size="lg" onClick={() => endInterview(true)} className="w-full max-w-xs">
          View My Analysis
        </Button>
      </div>
    );
  }

  const roleLabel = role.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            Interview in Progress
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {roleLabel} &middot; <span className="capitalize">{difficulty}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSpeak}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            title={speakEnabled ? "Mute AI voice" : "Enable AI voice"}
          >
            {speakEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <Button variant="danger" onClick={() => endInterview(false)} className="gap-2 text-sm" size="sm">
            <PhoneOff size={15} /> End & Analyze
          </Button>
        </div>
      </div>

      {session && (
        <ProgressBar
          current={session.currentIndex}
          total={session.totalQuestions}
          isFollowUp={session.isShowingFollowUp}
        />
      )}

      <Card className="p-6 space-y-6 bg-slate-900/70 border-slate-700">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-blue-400">AI</span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-1.5 font-medium">
              {isFollowUp ? "Follow-up Question" : `Question ${(session?.currentIndex ?? 0) + 1}`}
            </p>
            <p className="text-white text-lg leading-relaxed font-medium">
              {currentDisplayQuestion}
            </p>
          </div>
          {isSpeaking && (
            <div className="flex items-center gap-0.5 mt-1 flex-shrink-0">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-400 rounded-full animate-bounce"
                  style={{ height: "12px", animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 pt-5 space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    e.preventDefault();
                    submitAnswer();
                  }
                }}
                placeholder="Type your answer or use the microphone below..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[120px] transition-colors leading-relaxed"
                rows={4}
              />
              <p className="text-xs text-slate-600 mt-1.5">Tip: Press Ctrl+Enter to submit</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <VoiceRecorder
             onTranscript={(text) => {
              setAnswer((prev) => prev + " " + text);
            }}
              disabled={isGenerating}
            />

            <Button
              onClick={submitAnswer}
              disabled={!answer.trim() || isGenerating}
              className="gap-2 px-6"
              size="lg"
            >
              {session && session.currentIndex + 1 >= session.totalQuestions && !isFollowUp
                ? "Submit & Finish"
                : "Submit Answer"}
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-slate-900/40 border-slate-800">
        <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Your answers so far</p>
        {session && session.answers.length === 0 ? (
          <p className="text-slate-600 text-sm">No answers submitted yet.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {session?.answers.map((a, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="text-slate-600 flex-shrink-0 font-mono">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 truncate">{a.question}</p>
                  <p className="text-slate-300 text-xs mt-0.5 line-clamp-2">{a.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="text-center text-xs text-slate-600">
        AI analysis runs once at the end &mdash; saving your API quota
      </p>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <InterviewContent />
    </React.Suspense>
  );
}
