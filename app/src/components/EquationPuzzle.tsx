import { useState } from "react";
import type { ModifierItem } from "../types";

interface Props {
  modifier: ModifierItem;
  options: string[];
  correctAnswer: string;
  onCorrect: () => void;
  onWrong: () => void;
}

export function EquationPuzzle({ modifier, options, correctAnswer, onCorrect, onWrong }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const equation = modifier.formula_text.replace(/=.*$/, "= ?");

  function choose(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === correctAnswer) onCorrect();
    else onWrong();
  }

  return (
    <div className="exercise">
      <p className="prompt">Complete the equation:</p>
      <p className="equation bengali">{equation}</p>
      <p className="hint">Sounds like: {modifier.formula_sound}</p>

      <div className="char-grid">
        {options.map((opt) => {
          let cls = "char-btn bengali";
          if (picked) {
            if (opt === correctAnswer) cls += " correct";
            else if (opt === picked) cls += " wrong";
          }
          return (
            <button key={opt} type="button" className={cls} disabled={!!picked} onClick={() => choose(opt)}>
              {opt}
            </button>
          );
        })}
      </div>

      <p className="hint">Example word: {modifier.example_word}</p>
    </div>
  );
}
