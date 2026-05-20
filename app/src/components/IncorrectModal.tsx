import type { Question } from "../types";

interface Props {
  question: Question;
  correctAnswer: string;
  onDismiss: () => void;
}

export function IncorrectModal({ question, correctAnswer, onDismiss }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="incorrect-title">
      <div className="modal-panel">
        <h2 id="incorrect-title" className="modal-title">
          Not quite
        </h2>
        <p className="modal-prompt">
          {question.type === "audio_match" ? (
            <>
              Sound to match: <span className="bengali">{question.audio_text}</span>
            </>
          ) : (
            question.prompt
          )}
        </p>
        <p className="modal-answer-label">Correct answer</p>
        <p className="modal-answer bengali">{correctAnswer}</p>
        {question.type === "word_bank" && (
          <p className="hint">Full sentence: <span className="bengali">{question.target_sentence}</span></p>
        )}
        <button type="button" className="btn primary" onClick={onDismiss}>
          Continue
        </button>
        <p className="modal-note">This question will come back again later in the lesson.</p>
      </div>
    </div>
  );
}
