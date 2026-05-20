import { useEffect, useState } from "react";
import type { Curriculum, UserProgress } from "./types";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { UnitRunner } from "./components/UnitRunner";
import { loadProgress } from "./utils/progress";
import "./App.css";

const DATA_URL = `${import.meta.env.BASE_URL}data/curriculum.json`;

export default function App() {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load curriculum (${r.status})`);
        return r.json();
      })
      .then(setCurriculum)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="app error">
        <p>Could not load curriculum: {error}</p>
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="app loading">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header progress={progress} />
      {unitId ? (
        <UnitRunner
          curriculum={curriculum}
          unitId={unitId}
          progress={progress}
          onBack={() => setUnitId(null)}
          onProgress={setProgress}
        />
      ) : (
        <Home curriculum={curriculum} progress={progress} onSelectUnit={setUnitId} />
      )}
    </div>
  );
}
