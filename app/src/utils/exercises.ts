import type { Exercise, ExerciseType, Lesson } from "../types";
import { shuffle } from "./text";

const ROTATION: ExerciseType[] = [
  "word_bank",
  "multiple_choice",
  "listening",
  "speaking",
];

export function buildExerciseQueue(lessons: Lesson[]): Exercise[] {
  return lessons.flatMap((lesson, index) => [
    {
      type: ROTATION[index % ROTATION.length],
      lesson,
    },
  ]);
}

export function pickDistractors(
  correct: Lesson,
  pool: Lesson[],
  count = 3,
): Lesson[] {
  const others = pool.filter((l) => l.lesson_id !== correct.lesson_id);
  return shuffle(others).slice(0, count);
}
