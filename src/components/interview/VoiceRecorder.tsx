"use client";

import React, { useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({
  onTranscript,
  disabled,
}: Props) {
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
      });

      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm;codecs=opus",
        });

        const formData = new FormData();
        formData.append("audio", blob);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.transcript) {
          onTranscript(data.transcript.trim());
        }
      };

      recorder.start(100);

      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  return (
    <button
      onClick={toggleRecording}
      disabled={disabled}
      className={`w-16 h-16 rounded-full flex items-center justify-center ${
        isRecording
          ? "bg-red-500 text-white"
          : "bg-slate-700 text-white"
      }`}
    >
      {isRecording ? <MicOff /> : <Mic />}
    </button>
  );
}
