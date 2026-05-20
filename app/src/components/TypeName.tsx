import { useState } from "react";
import type { LetterItem } from "../types";
import { normalizeText } from "../utils/text";

interface Props {
  letter: LetterItem;
  onCorrect: () => void;
  onWrong: () => void;
}

export function TypeName({ letter, onCorrect, onWrong }: Props) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);

  function check() {
    const n = normalizeText(answer);
    const ok =
      n === normalizeText(letter.name) ||
      n === normalizeText(letter.english_sound) ||
      n === normalizeText(letter.name.replace(/-/g, " "));
    setChecked(true);
    if (ok) onCorrect();
    else onWrong();
  }

  return (
    <div className="exercise">
      <p className="prompt">Type this letter&apos;s name or sound (Roman letters):</p>
      <p className="hero-char bengali">{letter.character}</p>
      <p className="hint">{letter.example_word}</p>

      <input
        className="text-input"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="e.g. Shor-o or o"
        disabled={checked}
        onKeyDown={(e) => e.key === "Enter" && !checked && answer.trim() && check()}
      />

      {!checked ? (
        <button type="button" className="btn primary" onClick={check} disabled={!answer.trim()}>
          Check
        </button>
      ) : (
        <p className="hint">
          Answer: <strong>{letter.name}</strong> · sound <strong>{letter.english_sound}</strong>
        </p>
      )}
    </div>
  );
}
