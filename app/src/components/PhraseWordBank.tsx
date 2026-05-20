import { useState } from "react";
import type { PhraseItem } from "../types";
import { normalizeText, shuffle } from "../utils/text";

interface Props {
  phrase: PhraseItem;
  onCorrect: () => void;
  onWrong: () => void;
}

export function PhraseWordBank({ phrase, onCorrect, onWrong }: Props) {
  const target = phrase.word_bank_bengali;
  const [bank] = useState(() => shuffle(target));
  const [selected, setSelected] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);

  function tap(word: string) {
    if (failed) return;
    const next = [...selected, word];
    setSelected(next);
    if (word !== target[next.length - 1]) {
      setFailed(true);
      onWrong();
      return;
    }
    if (next.length === target.length) {
      const built = next.join(" ");
      const ok =
        built === target.join(" ") ||
        normalizeText(built) === normalizeText(phrase.bengali);
      if (ok) onCorrect();
      else onWrong();
    }
  }

  function reset() {
    setSelected([]);
    setFailed(false);
  }

  const usage = new Map<string, number>();
  selected.forEach((w) => usage.set(w, (usage.get(w) ?? 0) + 1));

  return (
    <div className="exercise">
      <p className="prompt">Build the Bengali sentence (SOV order):</p>
      <p className="english">{phrase.english}</p>
      <p className="translit-hint">{phrase.transliteration}</p>
      {phrase.note && <p className="hint">{phrase.note}</p>}

      <div className="answer-slots bengali">
        {target.map((_, i) => (
          <span key={i} className={`slot ${selected[i] ? "filled" : ""}`}>
            {selected[i] ?? ""}
          </span>
        ))}
      </div>

      <div className="word-bank">
        {bank.map((word, i) => {
          const usedCount = usage.get(word) ?? 0;
          const maxCount = target.filter((w) => w === word).length;
          return (
            <button
              key={`${word}-${i}`}
              type="button"
              className="chip bengali"
              disabled={usedCount >= maxCount || failed}
              onClick={() => tap(word)}
            >
              {word}
            </button>
          );
        })}
      </div>

      {failed && (
        <button type="button" className="btn secondary" onClick={reset}>
          Try again
        </button>
      )}
    </div>
  );
}
