import type { Syllabus, SyllabusUnit, UserProgress } from "../types";

const STORAGE_KEY = "bangla-learn-progress-v3";

const defaultProgress: UserProgress = {
  xp: 0,
  streak: 0,
  lastPracticeDate: null,
  completedLessons: [],
  completedUnits: [],
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      ...defaultProgress,
      ...parsed,
      completedLessons: parsed.completedLessons ?? [],
      completedUnits: parsed.completedUnits ?? [],
    };
  } catch {
    return { ...defaultProgress };
  }
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function touchStreak(): void {
  const p = loadProgress();
  const today = todayISO();
  if (p.lastPracticeDate !== today) {
    if (p.lastPracticeDate === yesterdayISO()) p.streak += 1;
    else p.streak = 1;
    p.lastPracticeDate = today;
  }
  saveProgress(p);
}

export function awardXp(amount: number): UserProgress {
  touchStreak();
  const fresh = loadProgress();
  fresh.xp += amount;
  saveProgress(fresh);
  return fresh;
}

export function completeLesson(lessonId: string, unitId: string, syllabus: Syllabus, bonusXp = 15): UserProgress {
  touchStreak();
  const fresh = loadProgress();
  if (!fresh.completedLessons.includes(lessonId)) {
    fresh.completedLessons.push(lessonId);
    fresh.xp += bonusXp;
  }

  const unit = syllabus.find((u) => u.unit_id === unitId);
  if (unit && !fresh.completedUnits.includes(unitId)) {
    const allLessonsDone =
      unit.lessons.length > 0 && unit.lessons.every((l) => fresh.completedLessons.includes(l.lesson_id));
    if (allLessonsDone) fresh.completedUnits.push(unitId);
  }

  saveProgress(fresh);
  return fresh;
}

export function isUnitUnlocked(unitId: string, syllabus: Syllabus, progress: UserProgress): boolean {
  const index = syllabus.findIndex((u) => u.unit_id === unitId);
  if (index <= 0) return true;
  return progress.completedUnits.includes(syllabus[index - 1].unit_id);
}

export function isLessonUnlocked(lessonId: string, unit: SyllabusUnit, progress: UserProgress): boolean {
  const idx = unit.lessons.findIndex((l) => l.lesson_id === lessonId);
  if (idx <= 0) return true;
  return progress.completedLessons.includes(unit.lessons[idx - 1].lesson_id);
}

export function unitLessonProgress(
  unitId: string,
  syllabus: Syllabus,
  progress: UserProgress,
): { done: number; total: number } {
  const unit = syllabus.find((u) => u.unit_id === unitId);
  if (!unit) return { done: 0, total: 0 };
  const total = unit.lessons.length;
  const done = unit.lessons.filter((l) => progress.completedLessons.includes(l.lesson_id)).length;
  return { done, total };
}

export function nextPlayableLesson(
  syllabus: Syllabus,
  progress: UserProgress,
): { unitId: string; lessonId: string } | null {
  for (const unit of syllabus) {
    if (!isUnitUnlocked(unit.unit_id, syllabus, progress)) continue;
    for (const lesson of unit.lessons) {
      if (!isLessonUnlocked(lesson.lesson_id, unit, progress)) continue;
      if (!progress.completedLessons.includes(lesson.lesson_id)) {
        return { unitId: unit.unit_id, lessonId: lesson.lesson_id };
      }
    }
  }
  const last = syllabus[syllabus.length - 1];
  const lastLesson = last?.lessons[last.lessons.length - 1];
  if (last && lastLesson) return { unitId: last.unit_id, lessonId: lastLesson.lesson_id };
  return null;
}
