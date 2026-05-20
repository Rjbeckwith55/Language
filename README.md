# Bangla Learn

Duolingo-style Bengali practice: **alphabet → modifiers → first words → SOV sentences**. Static React app, free on GitHub Pages.

**Live site:** https://rjbeckwith55.github.io/Language/

## Mechanics

- **No hearts** — you never fail out of a lesson.
- **Cyclic queue** — each question is removed when answered correctly. If wrong, an **Incorrect** modal shows the right answer and the same question is appended to the **end** of the queue. The lesson ends only when the queue is empty.
- **Course data** — `data/syllabus.json` lists units → lessons → typed questions (`multiple_choice`, `audio_match` with browser speech, `modifier_equation`, `word_bank`).
- **Progress** — XP (+5 per correct, +15 lesson bonus first completion), streak, `completedLessons` / `completedUnits` in `localStorage` (`bangla-learn-progress-v3`).

## Run locally

```bash
cd app
npm install
npm run dev
```

## Deploy

Push to `main` on `Rjbeckwith55/Language`. Enable **Settings → Pages → GitHub Actions**.

## Optional GCP scripts

`scripts/` can regenerate cloud translations/TTS; not required for the web app.

## License

MIT
