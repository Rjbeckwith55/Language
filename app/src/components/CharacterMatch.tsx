import { useState } from "react";
import type { Exercise } from "../types";

interface Props {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
}

export function CharacterMatch({ exercise, onCorrect, onWrong }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = exercise.correctAnswer ?? "";
  const options = exercise.options ?? [];

  const prompt = exercise.modifier
    ? `Which character is "${exercise.modifier.formula_sound}" (${exercise.modifier.modifier_name})?`
    : exercise.letter
      ? `Which letter is "${exercise.letter.name}" (${exercise.letter.english_sound})?`
      : "Pick the correct character";

  function choose(char: string) {
    if (picked) return;
    setPicked(char);
    if (char === correct) onCorrect();
    else onWrong();
  }

  return (
    <div className="exercise">
      <p className="prompt">{prompt}</p>
      {exercise.letter?.example_word && (
        <p className="hint">Example: {exercise.letter.example_word}</p>
      )}
      {exercise.modifier?.formula_text && (
        <p className="hint bengali">{exercise.modifier.formula_text}</p>
      )}

      <div className="char-grid">
        {options.map((char) => {
          let cls = "char-btn bengali";
          if (picked) {
            if (char === correct) cls += " correct";
            else if (char === picked) cls += " wrong";
          }
          return (
            <button key={char} type="button" className={cls} disabled={!!picked} onClick={() => choose(char)}>
              {char}
            </button>
          );
        })}
      </div>
    </div>
  );
}
