import type {
  Curriculum,
  Exercise,
  ExerciseKind,
  LetterItem,
  ModifierItem,
  PhraseItem,
  Unit,
  VocabItem,
} from "../types";
import { shuffle } from "./text";

const LETTER_ROTATION: ExerciseKind[] = ["character_match", "type_name"];
const MODIFIER_ROTATION: ExerciseKind[] = ["equation_puzzle", "character_match"];

function pickLetterDistractors(correct: LetterItem, pool: LetterItem[], n = 3): string[] {
  return shuffle(pool.filter((l) => l.id !== correct.id))
    .slice(0, n)
    .map((l) => l.character);
}

function pickModifierResultOptions(correct: string, pool: ModifierItem[]): string[] {
  const others = pool.filter((m) => m.result_character !== correct).map((m) => m.result_character);
  return shuffle([correct, ...shuffle(others).slice(0, 3)]);
}

function pickVocabDistractors(correct: VocabItem, pool: VocabItem[], n = 3): string[] {
  return shuffle(pool.filter((v) => v.id !== correct.id))
    .slice(0, n)
    .map((v) => v.bengali);
}

export function buildUnitExercises(unit: Unit, curriculum: Curriculum): Exercise[] {
  const exercises: Exercise[] = [];

  if (unit.itemType === "letter") {
    const items = unit.items as LetterItem[];
    items.forEach((letter, i) => {
      const kind = LETTER_ROTATION[i % LETTER_ROTATION.length];
      const options = pickLetterDistractors(letter, items);
      exercises.push({
        id: `${unit.id}_${letter.id}_${kind}`,
        kind,
        unitId: unit.id,
        itemId: letter.id,
        letter,
        options: shuffle([letter.character, ...options]),
        correctAnswer: letter.character,
      });
    });
    return exercises;
  }

  if (unit.itemType === "modifier") {
    const items = unit.items as ModifierItem[];
    const allLetters = curriculum.units
      .filter((u) => u.itemType === "letter")
      .flatMap((u) => u.items as LetterItem[]);

    items.forEach((mod, i) => {
      const kind = MODIFIER_ROTATION[i % MODIFIER_ROTATION.length];
      if (kind === "equation_puzzle") {
        exercises.push({
          id: `${unit.id}_${mod.id}_eq`,
          kind: "equation_puzzle",
          unitId: unit.id,
          itemId: mod.id,
          modifier: mod,
          options: pickModifierResultOptions(mod.result_character, items),
          correctAnswer: mod.result_character,
        });
      } else {
        const fakeLetters = shuffle(allLetters).slice(0, 3);
        exercises.push({
          id: `${unit.id}_${mod.id}_match`,
          kind: "character_match",
          unitId: unit.id,
          itemId: mod.id,
          modifier: mod,
          options: shuffle([mod.result_character, ...fakeLetters.map((l) => l.character)]),
          correctAnswer: mod.result_character,
        });
      }
    });
    return exercises;
  }

  if (unit.itemType === "vocab") {
    const items = unit.items as VocabItem[];
    const allVocab = curriculum.units
      .filter((u) => u.itemType === "vocab")
      .flatMap((u) => u.items as VocabItem[]);

    items.forEach((vocab) => {
      exercises.push({
        id: `${unit.id}_${vocab.id}_vocab`,
        kind: "vocab_choice",
        unitId: unit.id,
        itemId: vocab.id,
        vocab,
        options: shuffle([vocab.bengali, ...pickVocabDistractors(vocab, allVocab)]),
        correctAnswer: vocab.bengali,
      });
    });
    return exercises;
  }

  if (unit.itemType === "phrase") {
    const items = unit.items as PhraseItem[];
    items.forEach((phrase) => {
      exercises.push({
        id: `${unit.id}_${phrase.id}_phrase`,
        kind: "phrase_word_bank",
        unitId: unit.id,
        itemId: phrase.id,
        phrase,
        correctAnswer: phrase.bengali,
      });
    });
  }

  return exercises;
}

/** Exercises for items not yet completed (allows continuing where you left off). */
export function remainingExercises(
  unit: Unit,
  curriculum: Curriculum,
  completedItemIds: string[],
): Exercise[] {
  return buildUnitExercises(unit, curriculum).filter((e) => !completedItemIds.includes(e.itemId));
}
