# Bangla Learn

Learn Bengali from zero: **alphabet first** (vowels → consonants → vowel markers), then vocabulary and phrases. No audio required — fully static and free on GitHub Pages.

**Live site:** https://rjbeckwith55.github.io/Language/

## Learning path

1. **Vowels** (স্বরবর্ণ) — 11 independent vowels  
2. **Consonants I** (ক–ঙ) — first consonant row  
3. **Vowel markers** (কার) — how vowels attach to consonants  
4. **Vocabulary** — Basics, Food, Family  
5. **Phrases** — sentence builder (SOV word order)

Each unit unlocks when the previous one is complete. Progress (XP, streak, completed items) is saved in your browser.

## Exercise types

| Type | Used for |
|------|-----------|
| Character match | Pick the right letter or syllable |
| Type name | Roman input for letter name / sound |
| Equation puzzle | ক + া = ? style kar practice |
| Vocab choice | English → Bengali multiple choice |
| Phrase word bank | Tap words in SOV order |

## Local development

```bash
cd app
npm install
npm run dev
```

## Deploy

Push to `main` on `Rjbeckwith55/Language`. GitHub Actions builds and deploys to Pages. Enable **Settings → Pages → GitHub Actions** once.

## Optional: GCP seed scripts

The `scripts/` folder can regenerate translations/audio via Google Cloud (optional). The app does **not** need audio to run.

## License

MIT
