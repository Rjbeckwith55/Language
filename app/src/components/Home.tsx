import type { Syllabus, UserProgress } from "../types";
import { isUnitUnlocked, nextPlayableLesson, unitLessonProgress } from "../utils/progress";

interface Props {
  syllabus: Syllabus;
  progress: UserProgress;
  onSelectUnit: (unitId: string) => void;
}

export function Home({ syllabus, progress, onSelectUnit }: Props) {
  const next = nextPlayableLesson(syllabus, progress);

  return (
    <main className="home">
      <section className="hero">
        <h1>Learn Bengali from zero</h1>
        <p className="subtitle">
          Cyclic practice: mistakes come back until you master them — no hearts, no failing out. Start
          with script foundations, then your first words and sentences.
        </p>
        {next && (
          <button
            type="button"
            className="btn primary continue-btn"
            onClick={() => onSelectUnit(next.unitId)}
          >
            Continue learning
          </button>
        )}
      </section>

      <section className="paths">
        <h2>Course units</h2>
        <ol className="unit-path">
          {syllabus.map((unit, order) => {
            const unlocked = isUnitUnlocked(unit.unit_id, syllabus, progress);
            const { done, total } = unitLessonProgress(unit.unit_id, syllabus, progress);
            const complete = progress.completedUnits.includes(unit.unit_id);

            return (
              <li
                key={unit.unit_id}
                className={`unit-step ${unlocked ? "" : "locked"} ${complete ? "done" : ""}`}
              >
                <button
                  type="button"
                  className="unit-card"
                  disabled={!unlocked}
                  onClick={() => onSelectUnit(unit.unit_id)}
                >
                  <span className="unit-order">{order + 1}</span>
                  <span className="unit-text">
                    <span className="unit-title">{unit.unit_title}</span>
                    <span className="unit-sub">{unit.lessons.length} lessons</span>
                    {unlocked && (
                      <span className="unit-progress-bar">
                        <span
                          className="unit-progress-fill"
                          style={{ width: `${total ? (done / total) * 100 : 0}%` }}
                        />
                      </span>
                    )}
                    <span className="path-progress">
                      {!unlocked ? "Locked" : complete ? "Complete" : `${done}/${total} lessons`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
