import type { Category, LessonsData, UserProgress } from "../types";

interface Props {
  data: LessonsData;
  progress: UserProgress;
  onSelectCategory: (id: string) => void;
}

export function Home({ data, progress, onSelectCategory }: Props) {
  function countDone(categoryId: string) {
    const ids = data.lessons.filter((l) => l.category_id === categoryId).map((l) => l.lesson_id);
    return ids.filter((id) => progress.completedLessons.includes(id)).length;
  }

  return (
    <main className="home">
      <section className="hero">
        <h1>Learn Bengali</h1>
        <p className="subtitle">
          Gamified lessons with word banks, listening, and speaking — powered by pre-cached Google
          Cloud translations &amp; audio.
        </p>
      </section>

      <section className="paths">
        <h2>Choose a path</h2>
        <div className="path-grid">
          {data.categories.map((cat: Category) => {
            const total = data.lessons.filter((l) => l.category_id === cat.id).length;
            const done = countDone(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                className="path-card"
                onClick={() => onSelectCategory(cat.id)}
              >
                <span className="path-icon">{cat.icon}</span>
                <span className="path-title">{cat.title}</span>
                <span className="path-progress">
                  {done}/{total} phrases
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="about">
        <h3>How it works</h3>
        <ul>
          <li>Translations &amp; TTS audio are pre-generated on GCP (not live per click).</li>
          <li>Four exercise types rotate: word bank, multiple choice, listening, speaking.</li>
          <li>Speaking uses browser recognition; run the Python pipeline for Google STT batch tests.</li>
        </ul>
      </section>
    </main>
  );
}
