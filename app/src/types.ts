export type ExerciseType = "word_bank" | "multiple_choice" | "listening" | "speaking";

export interface Category {
  id: string;
  title: string;
  icon: string;
}

export interface Lesson {
  lesson_id: string;
  category_id: string;
  english_phrase: string;
  bengali_script: string;
  bengali_transliteration: string;
  audio_file: string;
}

export interface LessonsData {
  version: number;
  language: string;
  dialect: string;
  lessons: Lesson[];
  categories: Category[];
}

export interface Exercise {
  type: ExerciseType;
  lesson: Lesson;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastPracticeDate: string | null;
  completedLessons: string[];
}
