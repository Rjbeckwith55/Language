import { useMemo, useState } from "react";
import type { Curriculum, Exercise, UserProgress } from "../types";
import { remainingExercises } from "../utils/exercises";
import { completeExercise, loadProgress } from "../utils/progress";
import { CharacterMatch } from "./CharacterMatch";
import { EquationPuzzle } from "./EquationPuzzle";
import { PhraseWordBank } from "./PhraseWordBank";
import { TypeName } from "./TypeName";
import { VocabChoice } from "./VocabChoice";

interface Props {
  curriculum: Curriculum;
  unitId: string;
  progress: UserProgress;
  onBack: () => void;
  onProgress: (p: UserProgress) => void;
}

function ExerciseView({
  exercise,
  onCorrect,
  onWrong,
}: {
  exercise: Exercise;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  switch (exercise.kind) {
    case "character_match":
      return <CharacterMatch exercise={exercise} onCorrect={onCorrect} onWrong={onWrong} />;
    case "type_name":
      return exercise.letter ? (
        <TypeName letter={exercise.letter} onCorrect={onCorrect} onWrong={onWrong} />
      ) : null;
    case "equation_puzzle":
      return exercise.modifier && exercise.options && exercise.correctAnswer ? (
        <EquationPuzzle
          modifier={exercise.modifier}
          options={exercise.options}
          correctAnswer={exercise.correctAnswer}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      ) : null;
    case "vocab_choice":
      return exercise.vocab && exercise.options && exercise.correctAnswer ? (
        <VocabChoice
          vocab={exercise.vocab}
          options={exercise.options}
          correctAnswer={exercise.correctAnswer}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      ) : null;
    case "phrase_word_bank":
      return exercise.phrase ? (
        <PhraseWordBank phrase={exercise.phrase} onCorrect={onCorrect} onWrong={onWrong} />
      ) : null;
    default:
      return null;
  }
}

export function UnitRunner({ curriculum, unitId, progress, onBack, onProgress }: Props) {
  const unit = curriculum.units.find((u) => u.id === unitId);
  const exercises = useMemo(
    () => (unit ? remainingExercises(unit, curriculum, progress.completedItems) : []),
    [unit, curriculum, progress.completedItems],
  );

  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [toast, setToast] = useState(false);
  const [unitDone, setUnitDone] = useState(() => exercises.length === 0);

  const current = exercises[index];
  const totalInUnit = unit?.items.length ?? 0;
  const doneBefore = totalInUnit - exercises.length;
  const progressPct = unitDone
    ? 100
    : Math.round(((doneBefore + index) / Math.max(totalInUnit, 1)) * 100);

  function advance(success: boolean) {
    if (!current) return;
    if (!success) {
      setHearts((h) => Math.max(0, h - 1));
      return;
    }

    const updated = completeExercise(current.itemId, unitId, curriculum);
    onProgress(updated);
    setToast(true);
    window.setTimeout(() => setToast(false), 600);

    if (index + 1 >= exercises.length) {
      setUnitDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (!unit) {
    return (
      <div className="panel center">
        <p>Unit not found.</p>
        <button type="button" className="btn secondary" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  if (hearts === 0) {
    return (
      <div className="panel center">
        <h2>Out of hearts</h2>
        <p>Review the chart and try again.</p>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            setHearts(3);
            setIndex(0);
            setUnitDone(false);
          }}
        >
          Restart unit
        </button>
        <button type="button" className="btn secondary" onClick={onBack}>
          Path
        </button>
      </div>
    );
  }

  if (unitDone) {
    const p = loadProgress();
    const unlockedNext = curriculum.units
      .sort((a, b) => a.order - b.order)
      .find((u) => u.order === unit.order + 1);

    return (
      <div className="panel center celebrate">
        <h2>Unit complete!</h2>
        <p>
          {unit.icon} {unit.title} — {unit.subtitle}
        </p>
        <p>Total XP: {p.xp} · Streak: {p.streak} days</p>
        {unlockedNext ? (
          <p className="unlock-msg">Unlocked: {unlockedNext.icon} {unlockedNext.title}</p>
        ) : (
          <p className="unlock-msg">You finished the current path!</p>
        )}
        <button type="button" className="btn primary" onClick={onBack}>
          Back to path
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-runner">
      <div className="lesson-top">
        <button type="button" className="btn icon" onClick={onBack} aria-label="Back">
          ✕
        </button>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="hearts">{"❤️".repeat(hearts)}</div>
      </div>

      <p className="unit-label">
        {unit.icon} {unit.title}
      </p>

      {toast && <div className="toast">+10 XP</div>}

      <ExerciseView exercise={current} onCorrect={() => advance(true)} onWrong={() => advance(false)} />

      <p className="exercise-counter">
        {doneBefore + index + 1} / {totalInUnit} in this unit
      </p>
    </div>
  );
}
