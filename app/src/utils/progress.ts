import type { UserProgress } from "../types";

const STORAGE_KEY = "bangla-learn-progress";

const defaultProgress: UserProgress = {
  xp: 0,
  streak: 0,
  lastPracticeDate: null,
  completedLessons: [],
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    return { ...defaultProgress, ...JSON.parse(raw) };
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

export function awardXp(lessonId: string, xpGain = 10): UserProgress {
  const p = loadProgress();
  const today = todayISO();

  if (p.lastPracticeDate === today) {
    // same day, streak unchanged
  } else if (p.lastPracticeDate === yesterdayISO()) {
    p.streak += 1;
  } else {
    p.streak = 1;
  }

  p.lastPracticeDate = today;
  p.xp += xpGain;
  if (!p.completedLessons.includes(lessonId)) {
    p.completedLessons.push(lessonId);
  }
  saveProgress(p);
  return p;
}
