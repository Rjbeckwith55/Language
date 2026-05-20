import type { Curriculum, UserProgress } from "../types";

const STORAGE_KEY = "bangla-learn-progress-v2";

const defaultProgress: UserProgress = {
  xp: 0,
  streak: 0,
  lastPracticeDate: null,
  completedItems: [],
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
      completedItems: parsed.completedItems ?? [],
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

export function isUnitUnlocked(unitId: string, curriculum: Curriculum, progress: UserProgress): boolean {
  const units = [...curriculum.units].sort((a, b) => a.order - b.order);
  const index = units.findIndex((u) => u.id === unitId);
  if (index <= 0) return true;
  return progress.completedUnits.includes(units[index - 1].id);
}

export function unitProgress(unitId: string, curriculum: Curriculum, progress: UserProgress): {
  done: number;
  total: number;
} {
  const unit = curriculum.units.find((u) => u.id === unitId);
  if (!unit) return { done: 0, total: 0 };
  const total = unit.items.length;
  const done = unit.items.filter((i) => progress.completedItems.includes(i.id)).length;
  return { done, total };
}

export function completeExercise(
  itemId: string,
  unitId: string,
  curriculum: Curriculum,
  xpGain = 10,
): UserProgress {
  const p = loadProgress();
  const today = todayISO();

  if (p.lastPracticeDate !== today) {
    if (p.lastPracticeDate === yesterdayISO()) p.streak += 1;
    else p.streak = 1;
    p.lastPracticeDate = today;
  }

  if (!p.completedItems.includes(itemId)) {
    p.completedItems.push(itemId);
    p.xp += xpGain;
  }

  const unit = curriculum.units.find((u) => u.id === unitId);
  if (unit && !p.completedUnits.includes(unitId)) {
    const allDone = unit.items.every((i) => p.completedItems.includes(i.id));
    if (allDone) p.completedUnits.push(unitId);
  }

  saveProgress(p);
  return p;
}

export function nextPlayableUnit(curriculum: Curriculum, progress: UserProgress): string | null {
  const units = [...curriculum.units].sort((a, b) => a.order - b.order);
  for (const unit of units) {
    if (!isUnitUnlocked(unit.id, curriculum, progress)) continue;
    const { done, total } = unitProgress(unit.id, curriculum, progress);
    if (done < total) return unit.id;
  }
  return units[units.length - 1]?.id ?? null;
}
