import { useState } from "react";
import type { VocabItem } from "../types";

interface Props {
  vocab: VocabItem;
  options: string[];
  correctAnswer: string;
  onCorrect: () => void;
  onWrong: () => void;
}

export function VocabChoice({ vocab, options, correctAnswer, onCorrect, onWrong }: Props) {
  const [picked, setPicked] = useState<string | null>(null);

  function choose(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === correctAnswer) onCorrect();
    else onWrong();
  }

  return (
    <div className="exercise">
      <p className="prompt">Pick the correct Bengali word:</p>
      <p className="english">{vocab.english}</p>
      <p className="hint">{vocab.literal_meaning}</p>

      <div className="choices">
        {options.map((opt) => {
          let cls = "choice";
          if (picked) {
            if (opt === correctAnswer) cls += " correct";
            else if (opt === picked) cls += " wrong";
          }
          return (
            <button key={opt} type="button" className={cls} disabled={!!picked} onClick={() => choose(opt)}>
              <span className="bengali">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
