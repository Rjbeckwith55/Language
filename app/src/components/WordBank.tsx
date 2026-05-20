import { useMemo, useState } from "react";
import type { Lesson } from "../types";
import { shuffle, splitWords } from "../utils/text";

interface Props {
  lesson: Lesson;
  onCorrect: () => void;
  onWrong: () => void;
}

export function WordBank({ lesson, onCorrect, onWrong }: Props) {
  const target = useMemo(
    () => splitWords(lesson.bengali_transliteration),
    [lesson.bengali_transliteration],
  );
  const [bank] = useState(() => shuffle(target));
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"idle" | "wrong">("idle");

  function tap(word: string) {
    if (feedback !== "idle") return;
    const next = [...selected, word];
    setSelected(next);
    const expected = target[next.length - 1];
    if (word !== expected) {
      setFeedback("wrong");
      onWrong();
      return;
    }
    if (next.length === target.length) onCorrect();
  }

  function reset() {
    setSelected([]);
    setFeedback("idle");
  }

  return (
    <div className="exercise">
      <p className="prompt">Translate and tap words in order:</p>
      <p className="english">{lesson.english_phrase}</p>
      <p className="bengali hint">{lesson.bengali_script}</p>

      <div className="answer-slots">
        {target.map((_, i) => (
          <span key={i} className={`slot ${selected[i] ? "filled" : ""}`}>
            {selected[i] ?? ""}
          </span>
        ))}
      </div>

      <div className="word-bank">
        {bank.map((word, i) => {
          const countBefore = selected.filter((w) => w === word).length;
          const countInTarget = target.filter((w) => w === word).length;
          const disabled = countBefore >= countInTarget;
          return (
            <button
              key={`${word}-${i}`}
              type="button"
              className="chip"
              disabled={disabled || feedback === "wrong"}
              onClick={() => tap(word)}
            >
              {word}
            </button>
          );
        })}
      </div>

      {feedback === "wrong" && (
        <button type="button" className="btn secondary" onClick={reset}>
          Try again
        </button>
      )}
    </div>
  );
}
