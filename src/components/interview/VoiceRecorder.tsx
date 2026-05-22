"use client";

import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef("");
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      setSupported(true);
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onresult = (event: any) => {
        let transcript = "";

        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        console.log("VOICE:", transcript);

        if (transcript.trim()) {
          onTranscript(transcript.trim());
        }
      };

      rec.onerror = (e: any) => {
        console.log("Speech Error:", e);
        stopRecording();
      };
      rec.onend = () => {
        setIsRecording(false);
        stopAmplitude();
      };

      recognitionRef.current = rec;
    }

    return () => {
      recognitionRef.current?.stop();
      stopAmplitude();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  async function startAmplitude() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      function tick() {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAmplitude(Math.min(100, avg * 2));
        animFrameRef.current = requestAnimationFrame(tick);
      }
      tick();
    } catch {
      // mic permission denied — still allow text input
    }
  }

  function stopAmplitude() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setAmplitude(0);
  }

  function startRecording() {
    if (disabled || !recognitionRef.current) return;
    transcriptRef.current = "";
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      startAmplitude();
    } catch {
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    setIsRecording(false);
    stopAmplitude();
    if (transcriptRef.current.trim()) {
      onTranscript(transcriptRef.current.trim());
      transcriptRef.current = "";
    }
  }

  function toggle() {
    if (isRecording) stopRecording();
    else startRecording();
  }

  if (!supported) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={toggle}
        disabled={disabled}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
          isRecording
            ? "bg-red-500/20 border-2 border-red-500 text-red-400 focus:ring-red-500 hover:bg-red-500/30"
            : "bg-slate-800 border-2 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400 focus:ring-blue-500"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording && (
          <span
            className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-60"
            style={{ transform: `scale(${1 + amplitude / 200})` }}
          />
        )}
        {isRecording ? (
          <MicOff className="w-6 h-6 relative z-10" />
        ) : (
          <Mic className="w-6 h-6 relative z-10" />
        )}
      </button>

      {isRecording && (
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full transition-all duration-100"
              style={{
                height: `${8 + (amplitude / 100) * 20 * Math.abs(Math.sin(i * 1.2 + Date.now() / 300))}px`,
                opacity: 0.6 + (amplitude / 200),
              }}
            />
          ))}
          <Loader2 className="w-3 h-3 text-red-400 animate-spin ml-1" />
          <span className="text-xs text-red-400 font-medium">Recording...</span>
        </div>
      )}
    </div>
  );
}
