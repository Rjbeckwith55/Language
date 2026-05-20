import { useState } from "react";
import type { Lesson } from "../types";
import { playLessonAudio } from "../utils/audio";
import { normalizeText, similarity } from "../utils/text";

interface Props {
  lesson: Lesson;
  dialect: string;
  onCorrect: () => void;
  onWrong: () => void;
}

const MATCH_THRESHOLD = 0.85;

export function ListeningChallenge({ lesson, dialect, onCorrect, onWrong }: Props) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  function play() {
    playLessonAudio(lesson.audio_file, lesson.bengali_script, dialect);
  }

  function check() {
    const scriptScore = similarity(answer, lesson.bengali_script);
    const translitScore = similarity(answer, lesson.bengali_transliteration);
    const best = Math.max(scriptScore, translitScore);
    setScore(best);
    setChecked(true);
    if (best >= MATCH_THRESHOLD) onCorrect();
    else onWrong();
  }

  return (
    <div className="exercise">
      <p className="prompt">Listen and type what you hear:</p>
      <button type="button" className="btn play" onClick={play}>
        🔊 Play audio
      </button>

      <input
        className="text-input bengali"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type Bengali or transliteration…"
        disabled={checked}
      />

      {!checked ? (
        <button type="button" className="btn primary" onClick={check} disabled={!answer.trim()}>
          Check
        </button>
      ) : (
        <div className={`result ${score >= MATCH_THRESHOLD ? "ok" : "bad"}`}>
          <p>
            Match: {Math.round(score * 100)}% — Answer:{" "}
            <span className="bengali">{lesson.bengali_script}</span>
          </p>
          <p className="translit-hint">{lesson.bengali_transliteration}</p>
        </div>
      )}
    </div>
  );
}
