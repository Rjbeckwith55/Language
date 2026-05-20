import type { UserProgress } from "../types";

interface Props {
  progress: UserProgress;
}

export function Header({ progress }: Props) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-icon">ব</span>
        <span>Bangla Learn</span>
      </div>
      <div className="stats">
        <div className="stat" title="Experience points">
          <span className="stat-icon">⚡</span>
          <span>{progress.xp}</span>
        </div>
        <div className="stat" title="Day streak">
          <span className="stat-icon">🔥</span>
          <span>{progress.streak}</span>
        </div>
      </div>
    </header>
  );
}
