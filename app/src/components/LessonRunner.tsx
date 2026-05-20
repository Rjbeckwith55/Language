import { useMemo, useState } from "react";
import type { LessonsData, UserProgress } from "../types";
import { buildExerciseQueue } from "../utils/exercises";
import { awardXp, loadProgress } from "../utils/progress";
import { ListeningChallenge } from "./ListeningChallenge";
import { MultipleChoice } from "./MultipleChoice";
import { SpeakingChallenge } from "./SpeakingChallenge";
import { WordBank } from "./WordBank";

interface Props {
  data: LessonsData;
  categoryId: string;
  onBack: () => void;
  onProgress: (p: UserProgress) => void;
}

export function LessonRunner({ data, categoryId, onBack, onProgress }: Props) {
  const lessons = useMemo(
    () => data.lessons.filter((l) => l.category_id === categoryId),
    [data.lessons, categoryId],
  );

  const exercises = useMemo(() => buildExerciseQueue(lessons), [lessons]);
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [complete, setComplete] = useState(false);
  const [toast, setToast] = useState(false);

  const current = exercises[index];
  const category = data.categories.find((c) => c.id === categoryId);
  const progressPct = complete
    ? 100
    : Math.round((index / Math.max(exercises.length, 1)) * 100);

  function advance(success: boolean) {
    if (!success) {
      setHearts((h) => Math.max(0, h - 1));
      return;
    }
    const updated = awardXp(current.lesson.lesson_id);
    onProgress(updated);
    setToast(true);
    window.setTimeout(() => setToast(false), 600);

    if (index + 1 >= exercises.length) {
      setComplete(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (!current && !complete) {
    return (
      <div className="panel">
        <p>No lessons in this category.</p>
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
        <p>Take a break and try again.</p>
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            setHearts(3);
            setIndex(0);
            setComplete(false);
          }}
        >
          Restart lesson
        </button>
        <button type="button" className="btn secondary" onClick={onBack}>
          Home
        </button>
      </div>
    );
  }

  if (complete) {
    const p = loadProgress();
    return (
      <div className="panel center celebrate">
        <h2>Lesson complete!</h2>
        <p>
          {category?.icon} {category?.title} — {exercises.length} exercises
        </p>
        <p>Total XP: {p.xp} · Streak: {p.streak} days</p>
        <button type="button" className="btn primary" onClick={onBack}>
          Choose another path
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

      {toast && <div className="toast">+10 XP</div>}

      {current.type === "word_bank" && (
        <WordBank lesson={current.lesson} onCorrect={() => advance(true)} onWrong={() => advance(false)} />
      )}
      {current.type === "multiple_choice" && (
        <MultipleChoice
          lesson={current.lesson}
          allLessons={data.lessons}
          onCorrect={() => advance(true)}
          onWrong={() => advance(false)}
        />
      )}
      {current.type === "listening" && (
        <ListeningChallenge
          lesson={current.lesson}
          dialect={data.dialect}
          onCorrect={() => advance(true)}
          onWrong={() => advance(false)}
        />
      )}
      {current.type === "speaking" && (
        <SpeakingChallenge
          lesson={current.lesson}
          dialect={data.dialect}
          onCorrect={() => advance(true)}
          onWrong={() => advance(false)}
        />
      )}

      <p className="exercise-counter">
        Exercise {index + 1} / {exercises.length}
      </p>
    </div>
  );
}
