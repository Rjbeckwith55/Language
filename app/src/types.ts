export type UnitItemType = "letter" | "modifier" | "vocab" | "phrase";

export type ExerciseKind =
  | "character_match"
  | "type_name"
  | "equation_puzzle"
  | "vocab_choice"
  | "phrase_word_bank";

export interface LetterItem {
  id: string;
  character: string;
  name: string;
  english_sound: string;
  example_word: string;
}

export interface ModifierItem {
  id: string;
  parent_vowel: string;
  modifier_symbol: string;
  modifier_name: string;
  formula_text: string;
  formula_sound: string;
  example_word: string;
  result_character: string;
}

export interface VocabItem {
  id: string;
  category: string;
  english: string;
  bengali: string;
  transliteration: string;
  literal_meaning: string;
}

export interface PhraseItem {
  id: string;
  difficulty: string;
  english: string;
  bengali: string;
  transliteration: string;
  word_bank_bengali: string[];
  formal?: boolean;
  note?: string;
}

export interface Unit {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  itemType: UnitItemType;
  items: LetterItem[] | ModifierItem[] | VocabItem[] | PhraseItem[];
}

export interface Curriculum {
  version: number;
  units: Unit[];
}

export interface Exercise {
  id: string;
  kind: ExerciseKind;
  unitId: string;
  itemId: string;
  letter?: LetterItem;
  modifier?: ModifierItem;
  vocab?: VocabItem;
  phrase?: PhraseItem;
  /** Multiple-choice options (characters or bengali words) */
  options?: string[];
  /** For equation puzzle: the correct combined character */
  correctAnswer?: string;
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastPracticeDate: string | null;
  completedItems: string[];
  completedUnits: string[];
}
