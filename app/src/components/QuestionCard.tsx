import { useEffect, useMemo, useState } from "react";
import type { Question } from "../types";
import { shuffle } from "../utils/text";
import { loadVoices, speakBengali } from "../utils/speech";

interface Props {
  question: Question;
  /** Changes when queue changes so mounts reset (new picks) */
  shuffleKey: string;
  onCorrect: () => void;
  onWrong: (correctDisplay: string) => void;
}

export function QuestionCard({ question, shuffleKey, onCorrect, onWrong }: Props) {
  useEffect(() => {
    loadVoices();
    const onVoices = () => loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
  }, []);

  if (question.type === "word_bank") {
    return (
      <WordBankBlock question={question} onCorrect={onCorrect} onWrong={onWrong} />
    );
  }

  const opts = useMemo(
    () => shuffle([...question.options]),
    [question.id, shuffleKey],
  );

  if (question.type === "audio_match") {
    return (
      <div className="exercise">
        <p className="prompt">Listen, then pick the matching character or syllable.</p>
        <button
          type="button"
          className="btn play"
          onClick={() => speakBengali(question.audio_text)}
        >
          Play sound
        </button>
        <p className="hint">Uses your browser voice (Bengali if available).</p>
        <OptionGrid
          options={opts}
          target={question.target}
          onCorrect={onCorrect}
          onWrong={() => onWrong(question.target)}
        />
      </div>
    );
  }

  return (
    <div className="exercise">
      <p className="prompt">{question.prompt}</p>
      <OptionGrid
        options={opts}
        target={question.target}
        onCorrect={onCorrect}
        onWrong={() => onWrong(question.target)}
      />
    </div>
  );
}

function OptionGrid({
  options,
  target,
  onCorrect,
  onWrong,
}: {
  options: string[];
  target: string;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  function choose(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === target) onCorrect();
    else onWrong();
  }

  return (
    <div className="char-grid">
      {options.map((opt) => {
        let cls = "char-btn bengali";
        if (picked) {
          if (opt === target) cls += " correct";
          else if (opt === picked) cls += " wrong";
        }
        return (
          <button key={opt} type="button" className={cls} disabled={!!picked} onClick={() => choose(opt)}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function WordBankBlock({
  question,
  onCorrect,
  onWrong,
}: {
  question: Extract<Question, { type: "word_bank" }>;
  onCorrect: () => void;
  onWrong: (correctDisplay: string) => void;
}) {
  const targetWords = useMemo(
    () => question.target_sentence.trim().split(/\s+/),
    [question.target_sentence],
  );
  const [bank] = useState(() => shuffle([...question.scrambled_words]));
  const [selected, setSelected] = useState<string[]>([]);

  function tap(word: string) {
    const next = [...selected, word];
    const expected = targetWords[next.length - 1];
    if (word !== expected) {
      onWrong(question.target_sentence);
      setSelected([]);
      return;
    }
    setSelected(next);
    if (next.length === targetWords.length) {
      onCorrect();
    }
  }

  const usage = new Map<string, number>();
  selected.forEach((w) => usage.set(w, (usage.get(w) ?? 0) + 1));

  return (
    <div className="exercise">
      <p className="prompt">{question.prompt}</p>
      <p className="hint">Build the sentence in Bengali word order.</p>

      <div className="answer-slots bengali">
        {targetWords.map((_, i) => (
          <span key={i} className={`slot ${selected[i] ? "filled" : ""}`}>
            {selected[i] ?? ""}
          </span>
        ))}
      </div>

      <div className="word-bank">
        {bank.map((word, i) => {
          const usedCount = usage.get(word) ?? 0;
          const maxCount = targetWords.filter((w) => w === word).length;
          return (
            <button
              key={`${word}-${i}`}
              type="button"
              className="chip bengali"
              disabled={usedCount >= maxCount}
              onClick={() => tap(word)}
            >
              {word}
            </button>
          );
        })}
      </div>

      <button type="button" className="btn secondary" onClick={() => setSelected([])}>
        Clear line
      </button>
    </div>
  );
}
