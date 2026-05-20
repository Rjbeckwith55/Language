# Bangla Learn

A gamified Bengali language learning web app (Duolingo-style), built around **pre-cached** Google Cloud content so gameplay stays fast and cheap.

Live site (after you enable GitHub Pages): `https://rbeckwith.github.io/Language/`

## Features

- **Four paths**: Basics, Food, Travel, Family (32 phrases)
- **Four exercise types** (rotating): word bank, multiple choice, listening, speaking
- **XP & streak** stored in the browser (`localStorage`)
- **Hybrid data pipeline**: translations and TTS audio generated offline via GCP, not on every click

## Architecture

| Role | Google API | In this repo |
|------|------------|--------------|
| Translator | Cloud Translation API v3 | `scripts/seed_pipeline.py` |
| Voice (TTS) | Cloud Text-to-Speech | `scripts/seed_pipeline.py` → `app/public/audio/` |
| Ear (STT) | Cloud Speech-to-Text | `scripts/validate_speech.py` (batch/dev); browser Web Speech API in the app |

GitHub Pages hosts the static React app for **free**. API keys never ship to the browser.

## Quick start (local)

```bash
cd app
npm install
npm run dev
```

Open http://localhost:5173 — lessons load from `public/data/lessons.json`. Missing MP3 files fall back to browser text-to-speech for Bengali.

## Regenerate content with Google Cloud

### 1. GCP setup (one time)

1. Create a project at [Google Cloud Console](https://console.cloud.google.com/).
2. Enable APIs:
   - Cloud Translation API
   - Cloud Text-to-Speech API
   - Cloud Speech-to-Text API (optional, for `validate_speech.py`)
   - Cloud Storage (optional, for `--upload`)
3. Create a service account with roles: **Cloud Translation User**, **Cloud Text-to-Speech User**, **Storage Object Admin** (if uploading).
4. Download JSON key → save as `service-account.json` in the repo root (gitignored).

### 2. Run the seed pipeline

```bash
cd scripts
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt

set GOOGLE_APPLICATION_CREDENTIALS=..\service-account.json
set GCP_PROJECT_ID=YOUR_PROJECT_ID
set TTS_LANGUAGE_CODE=bn-IN
set TTS_VOICE_NAME=bn-IN-Wavenet-A

python seed_pipeline.py
```

This writes `data/lessons.json`, copies to `app/public/data/`, and generates `app/public/audio/*.mp3`.

Optional GCS upload:

```bash
set GCS_BUCKET=your-bucket-name
python seed_pipeline.py --upload
```

Commit the new JSON and MP3 files, then push — GitHub Actions redeploys the site.

### 3. GitHub Pages

1. Push this repo to `github.com/rbeckwith/Language` (or rename; update `VITE_BASE_PATH` in the workflow if the repo name differs).
2. In the repo: **Settings → Pages → Build and deployment → GitHub Actions**.
3. Push to `main` — workflow `.github/workflows/deploy-pages.yml` builds and deploys.

## Project layout

```
Language/
├── app/                 # Vite + React frontend
├── data/
│   ├── phrases-source.json   # English seed phrases
│   └── lessons.json          # Generated / curated lesson DB
├── scripts/
│   ├── seed_pipeline.py      # Translation + TTS batch job
│   └── validate_speech.py    # STT pronunciation check (dev)
└── .github/workflows/        # GitHub Pages deploy
```

## What I need from you (GCP & GitHub)

To run the pipeline on **your** GCP account and publish to **rbeckwith**:

1. **GCP project ID**
2. **Service account JSON** path (or paste that you’ve set `GOOGLE_APPLICATION_CREDENTIALS`)
3. Confirm **repo name** on GitHub (`Language` assumed for URL `/Language/`)
4. **GitHub**: install [GitHub CLI](https://cli.github.com/) or create the empty repo manually; provide a [Personal Access Token](https://github.com/settings/tokens) with `repo` scope if you want me to push from this machine (git is installed; `gh` is not)

`gcloud` and `npm` were not available in the Cursor shell on your PC — CI builds on GitHub; run `npm install` locally from a full Node.js install for dev.

## License

MIT — use and modify freely.
