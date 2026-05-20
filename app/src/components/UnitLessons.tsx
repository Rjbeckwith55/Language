import type { Syllabus, SyllabusUnit, UserProgress } from "../types";
import { isLessonUnlocked, isUnitUnlocked, unitLessonProgress } from "../utils/progress";

interface Props {
  unit: SyllabusUnit;
  syllabus: Syllabus;
  progress: UserProgress;
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export function UnitLessons({ unit, syllabus, progress, onBack, onSelectLesson }: Props) {
  const unlocked = isUnitUnlocked(unit.unit_id, syllabus, progress);
  const { done, total } = unitLessonProgress(unit.unit_id, syllabus, progress);

  return (
    <div className="unit-lessons">
      <div className="lesson-top">
        <button type="button" className="btn icon" onClick={onBack} aria-label="Back">
          ✕
        </button>
        <h2 className="unit-lessons-title">{unit.unit_title}</h2>
      </div>

      {!unlocked ? (
        <p className="hint">Complete the previous unit to unlock this path.</p>
      ) : (
        <>
          <p className="unit-lessons-sub">
            {done}/{total} lessons complete
          </p>
          <ol className="lesson-list">
            {unit.lessons.map((lesson) => {
              const open = isLessonUnlocked(lesson.lesson_id, unit, progress);
              const finished = progress.completedLessons.includes(lesson.lesson_id);
              return (
                <li key={lesson.lesson_id}>
                  <button
                    type="button"
                    className={`lesson-row ${finished ? "done" : ""} ${!open ? "locked" : ""}`}
                    disabled={!open}
                    onClick={() => onSelectLesson(lesson.lesson_id)}
                  >
                    <span className="lesson-row-title">{lesson.title}</span>
                    <span className="lesson-row-meta">
                      {finished ? "Done" : open ? "Start" : "Locked"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
