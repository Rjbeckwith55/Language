import { useEffect, useState } from "react";
import type { Syllabus, UserProgress } from "./types";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import { LessonRunner } from "./components/LessonRunner";
import { UnitLessons } from "./components/UnitLessons";
import { loadProgress } from "./utils/progress";
import "./App.css";

const DATA_URL = `${import.meta.env.BASE_URL}data/syllabus.json`;

export default function App() {
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [unitId, setUnitId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load syllabus (${r.status})`);
        return r.json();
      })
      .then(setSyllabus)
      .catch((e: Error) => setError(e.message));
  }, []);

  const unit = unitId ? syllabus?.find((u) => u.unit_id === unitId) : undefined;
  const lesson = unit && lessonId ? unit.lessons.find((l) => l.lesson_id === lessonId) : undefined;

  if (error) {
    return (
      <div className="app error">
        <p>Could not load syllabus: {error}</p>
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="app loading">
        <p>Loading…</p>
      </div>
    );
  }

  function openUnit(id: string) {
    setUnitId(id);
    setLessonId(null);
  }

  return (
    <div className="app">
      <Header progress={progress} />
      {lesson && unit && unitId ? (
        <LessonRunner
          syllabus={syllabus}
          unitId={unitId}
          lesson={lesson}
          onBack={() => setLessonId(null)}
          onProgress={setProgress}
        />
      ) : unit && unitId ? (
        <UnitLessons
          unit={unit}
          syllabus={syllabus}
          progress={progress}
          onBack={() => {
            setUnitId(null);
            setLessonId(null);
          }}
          onSelectLesson={setLessonId}
        />
      ) : (
        <Home syllabus={syllabus} progress={progress} onSelectUnit={openUnit} />
      )}
    </div>
  );
}
