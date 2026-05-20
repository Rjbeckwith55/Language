import { useEffect, useMemo, useState } from "react";
import type { Question, Syllabus, SyllabusLesson, UserProgress } from "../types";
import { awardXp, completeLesson, loadProgress } from "../utils/progress";
import { IncorrectModal } from "./IncorrectModal";
import { QuestionCard } from "./QuestionCard";

interface Props {
  syllabus: Syllabus;
  unitId: string;
  lesson: SyllabusLesson;
  onBack: () => void;
  onProgress: (p: UserProgress) => void;
}

export function LessonRunner({ syllabus, unitId, lesson, onBack, onProgress }: Props) {
  const total = lesson.questions.length;
  const [queue, setQueue] = useState<Question[]>(() => [...lesson.questions]);
  const [completed, setCompleted] = useState<Question[]>([]);
  const [incorrect, setIncorrect] = useState<{ question: Question; answer: string } | null>(null);
  const [lessonComplete, setLessonComplete] = useState(false);

  useEffect(() => {
    setQueue([...lesson.questions]);
    setCompleted([]);
    setLessonComplete(false);
    setIncorrect(null);
  }, [lesson.lesson_id]);

  const current = queue[0];
  const queueSig = useMemo(() => queue.map((q) => q.id).join("|"), [queue]);
  const progressPct = total > 0 ? Math.round((completed.length / total) * 100) : 100;

  function handleCorrect() {
    if (!current) return;
    const [first, ...rest] = queue;
    setCompleted((c) => [...c, first]);
    setQueue(rest);
    let p = awardXp(5);
    if (rest.length === 0) {
      p = completeLesson(lesson.lesson_id, unitId, syllabus);
      setLessonComplete(true);
    }
    onProgress(p);
  }

  function handleWrong(displayAnswer: string) {
    if (!current) return;
    setIncorrect({ question: current, answer: displayAnswer });
    setQueue((q) => {
      const [head, ...rest] = q;
      return [...rest, head];
    });
  }

  if (lessonComplete) {
    const p = loadProgress();
    return (
      <div className="panel center celebrate">
        <h2>Lesson complete</h2>
        <p className="bengali hero-noline">{lesson.title}</p>
        <p>Total XP: {p.xp} · Streak: {p.streak} days</p>
        <button type="button" className="btn primary" onClick={onBack}>
          Back to unit
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
        <div className="queue-meta" title="Questions left in cyclic queue">
          {queue.length} left
        </div>
      </div>

      <p className="unit-label">{lesson.title}</p>
      <p className="focus-line">
        Focus:{" "}
        {lesson.focus.map((f) => (
          <span key={f} className="focus-chip bengali">
            {f}
          </span>
        ))}
      </p>
      {lesson.note && <p className="hint">{lesson.note}</p>}

      {current && (
        <QuestionCard
          key={`${current.id}-${queueSig}`}
          question={current}
          shuffleKey={queueSig}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
        />
      )}

      <p className="exercise-counter">
        Mastered {completed.length} / {total} · Queue will repeat mistakes until you get them right
      </p>

      {incorrect && (
        <IncorrectModal
          question={incorrect.question}
          correctAnswer={incorrect.answer}
          onDismiss={() => setIncorrect(null)}
        />
      )}
    </div>
  );
}
