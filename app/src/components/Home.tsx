import type { Curriculum, UserProgress } from "../types";
import { isUnitUnlocked, nextPlayableUnit, unitProgress } from "../utils/progress";

interface Props {
  curriculum: Curriculum;
  progress: UserProgress;
  onSelectUnit: (id: string) => void;
}

export function Home({ curriculum, progress, onSelectUnit }: Props) {
  const units = [...curriculum.units].sort((a, b) => a.order - b.order);
  const continueUnit = nextPlayableUnit(curriculum, progress);

  return (
    <main className="home">
      <section className="hero">
        <h1>Learn Bengali from zero</h1>
        <p className="subtitle">
          Start with the alphabet — vowels, consonants, and vowel markers — then vocabulary and
          sentences. Complete each unit to unlock the next.
        </p>
        {continueUnit && (
          <button type="button" className="btn primary continue-btn" onClick={() => onSelectUnit(continueUnit)}>
            Continue learning
          </button>
        )}
      </section>

      <section className="paths">
        <h2>Your path</h2>
        <ol className="unit-path">
          {units.map((unit) => {
            const unlocked = isUnitUnlocked(unit.id, curriculum, progress);
            const { done, total } = unitProgress(unit.id, curriculum, progress);
            const complete = progress.completedUnits.includes(unit.id);

            return (
              <li key={unit.id} className={`unit-step ${unlocked ? "" : "locked"} ${complete ? "done" : ""}`}>
                <button
                  type="button"
                  className="unit-card"
                  disabled={!unlocked}
                  onClick={() => onSelectUnit(unit.id)}
                >
                  <span className="unit-order">{unit.order + 1}</span>
                  <span className="unit-icon bengali">{unit.icon}</span>
                  <span className="unit-text">
                    <span className="unit-title">{unit.title}</span>
                    <span className="unit-sub">{unit.subtitle}</span>
                    <span className="unit-desc">{unit.description}</span>
                    {unlocked && (
                      <span className="unit-progress-bar">
                        <span className="unit-progress-fill" style={{ width: `${(done / total) * 100}%` }} />
                      </span>
                    )}
                    <span className="path-progress">
                      {!unlocked ? "Locked" : complete ? "Complete" : `${done}/${total} items`}
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
