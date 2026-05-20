import { useCallback, useEffect, useRef, useState } from "react";
import type { Lesson } from "../types";
import { playLessonAudio } from "../utils/audio";
import { similarity } from "../utils/text";

interface Props {
  lesson: Lesson;
  dialect: string;
  onCorrect: () => void;
  onWrong: () => void;
}

const MATCH_THRESHOLD = 0.9;

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getRecognition(): SpeechRecognition | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function SpeakingChallenge({ lesson, dialect, onCorrect, onWrong }: Props) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const rec = getRecognition();
    if (!rec) {
      setSupported(false);
      return;
    }
    recognitionRef.current = rec;
    rec.lang = dialect;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      setTranscript(text);
      const scriptScore = similarity(text, lesson.bengali_script);
      const translitScore = similarity(text, lesson.bengali_transliteration);
      const best = Math.max(scriptScore, translitScore);
      if (best >= MATCH_THRESHOLD) onCorrect();
      else onWrong();
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    return () => {
      rec.abort();
    };
  }, [lesson, dialect, onCorrect, onWrong]);

  const start = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    setTranscript("");
    setListening(true);
    rec.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  if (!supported) {
    return (
      <div className="exercise">
        <p className="prompt">Speak this sentence:</p>
        <p className="bengali">{lesson.bengali_script}</p>
        <p className="warn">
          Speech recognition is not supported in this browser. Use Chrome or Edge, or run the
          GCP Speech-to-Text pipeline for server-side checks.
        </p>
      </div>
    );
  }

  return (
    <div className="exercise">
      <p className="prompt">Speak this sentence aloud:</p>
      <p className="english">{lesson.english_phrase}</p>
      <p className="bengali target">{lesson.bengali_script}</p>
      <p className="translit-hint">{lesson.bengali_transliteration}</p>

      <button type="button" className="btn play" onClick={() => playLessonAudio(lesson.audio_file, lesson.bengali_script, dialect)}>
        🔊 Hear model
      </button>

      <button
        type="button"
        className={`btn mic ${listening ? "active" : ""}`}
        onClick={listening ? stop : start}
      >
        {listening ? "⏹ Stop" : "🎤 Hold to speak"}
      </button>

      {transcript && (
        <p className="transcript">
          Heard: <span className="bengali">{transcript}</span>
        </p>
      )}
      <p className="note">
        Uses browser speech recognition (same idea as Google STT). For production-grade Bengali
        scoring, use the <code>scripts/seed_pipeline.py</code> STT validator on GCP.
      </p>
    </div>
  );
}
