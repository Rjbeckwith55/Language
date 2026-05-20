import { useMemo, useState } from "react";
import type { Lesson } from "../types";
import { pickDistractors } from "../utils/exercises";
import { shuffle } from "../utils/text";

interface Props {
  lesson: Lesson;
  allLessons: Lesson[];
  onCorrect: () => void;
  onWrong: () => void;
}

export function MultipleChoice({ lesson, allLessons, onCorrect, onWrong }: Props) {
  const options = useMemo(() => {
    const wrong = pickDistractors(lesson, allLessons, 3).map((l) => l.bengali_script);
    return shuffle([lesson.bengali_script, ...wrong]);
  }, [lesson, allLessons]);

  const [picked, setPicked] = useState<string | null>(null);

  function choose(option: string) {
    if (picked) return;
    setPicked(option);
    if (option === lesson.bengali_script) onCorrect();
    else onWrong();
  }

  return (
    <div className="exercise">
      <p className="prompt">Pick the correct Bengali translation:</p>
      <p className="english">{lesson.english_phrase}</p>
      <p className="translit-hint">{lesson.bengali_transliteration}</p>

      <div className="choices">
        {options.map((opt) => {
          let cls = "choice";
          if (picked) {
            if (opt === lesson.bengali_script) cls += " correct";
            else if (opt === picked) cls += " wrong";
          }
          return (
            <button
              key={opt}
              type="button"
              className={cls}
              disabled={!!picked}
              onClick={() => choose(opt)}
            >
              <span className="bengali">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
