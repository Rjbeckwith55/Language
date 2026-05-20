export type QuestionType = "multiple_choice" | "audio_match" | "modifier_equation" | "word_bank";

export interface QuestionBase {
  id: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple_choice";
  prompt: string;
  target: string;
  options: string[];
}

export interface AudioMatchQuestion extends QuestionBase {
  type: "audio_match";
  audio_text: string;
  target: string;
  options: string[];
}

export interface ModifierEquationQuestion extends QuestionBase {
  type: "modifier_equation";
  prompt: string;
  target: string;
  options: string[];
}

export interface WordBankQuestion extends QuestionBase {
  type: "word_bank";
  prompt: string;
  target_sentence: string;
  scrambled_words: string[];
}

export type Question =
  | MultipleChoiceQuestion
  | AudioMatchQuestion
  | ModifierEquationQuestion
  | WordBankQuestion;

export interface SyllabusLesson {
  lesson_id: string;
  title: string;
  focus: string[];
  note?: string;
  questions: Question[];
}

export interface SyllabusUnit {
  unit_id: string;
  unit_title: string;
  lessons: SyllabusLesson[];
}

export type Syllabus = SyllabusUnit[];

export interface UserProgress {
  xp: number;
  streak: number;
  lastPracticeDate: string | null;
  /** lesson_id values finished (queue emptied) */
  completedLessons: string[];
  /** unit_id values where every lesson is complete */
  completedUnits: string[];
}
