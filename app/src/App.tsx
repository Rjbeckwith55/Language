import { useEffect, useState } from "react";
import type { LessonsData, UserProgress } from "./types";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { LessonRunner } from "./components/LessonRunner";
import { loadProgress } from "./utils/progress";
import "./App.css";

const DATA_URL = `${import.meta.env.BASE_URL}data/lessons.json`;

export default function App() {
  const [data, setData] = useState<LessonsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load lessons (${r.status})`);
        return r.json();
      })
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="app error">
        <p>Could not load lessons: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app loading">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header progress={progress} />
      {categoryId ? (
        <LessonRunner
          data={data}
          categoryId={categoryId}
          onBack={() => setCategoryId(null)}
          onProgress={setProgress}
        />
      ) : (
        <Home data={data} progress={progress} onSelectCategory={setCategoryId} />
      )}
    </div>
  );
}
