#!/usr/bin/env python3
"""
Pre-generate Bangla Learn syllabus using Google Cloud APIs.

Steps:
  1. Translate English phrases (Cloud Translation API v3)
  2. Add rough Romanized transliteration (for beginners)
  3. Synthesize Bengali audio (Cloud Text-to-Speech)
  4. Write data/lessons.json and app/public/audio/*.mp3

Usage:
  pip install -r scripts/requirements.txt
  set GOOGLE_APPLICATION_CREDENTIALS=path\\to\\key.json
  set GCP_PROJECT_ID=your-project
  python scripts/seed_pipeline.py

Optional upload to GCS:
  set GCS_BUCKET=my-bucket
  python scripts/seed_pipeline.py --upload
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "phrases-source.json"
LESSONS_OUT = ROOT / "data" / "lessons.json"
AUDIO_OUT = ROOT / "app" / "public" / "audio"

# Bengali block → rough romanization map (seed helper; refine with LLM if desired)
BN_TO_ROMAN = {
    "া": "a", "ি": "i", "ী": "i", "ু": "u", "ূ": "u", "ে": "e", "ৈ": "oi", "ো": "o", "ৌ": "ou",
    "ং": "ng", "ঃ": "h", "ঁ": "n",
    "ক": "k", "খ": "kh", "গ": "g", "ঘ": "gh", "ঙ": "ng",
    "চ": "ch", "ছ": "chh", "জ": "j", "ঝ": "jh", "ঞ": "n",
    "ট": "t", "ঠ": "th", "ড": "d", "ঢ": "dh", "ণ": "n",
    "ত": "t", "থ": "th", "দ": "d", "ধ": "dh", "ন": "n",
    "প": "p", "ফ": "ph", "ব": "b", "ভ": "bh", "ম": "m",
    "য": "j", "র": "r", "ল": "l", "শ": "sh", "ষ": "sh", "স": "s", "হ": "h",
    "ড়": "r", "ঢ়": "rh", "য়": "y", "ৎ": "t",
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4", "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
    "।": ".", " ": " ",
}


def rough_transliterate(bengali: str) -> str:
    """Simple character map transliteration for beginners (not linguistic IPA)."""
    out: list[str] = []
    for ch in bengali:
        if ch in BN_TO_ROMAN:
            out.append(BN_TO_ROMAN[ch])
        elif re.match(r"[A-Za-z0-9.,!?'\-]", ch):
            out.append(ch)
    text = "".join(out)
    text = re.sub(r"\s+", " ", text).strip()
    if text:
        text = text[0].upper() + text[1:]
    return text


def load_source() -> dict:
    with SOURCE.open(encoding="utf-8") as f:
        return json.load(f)


def translate_phrases(project_id: str, phrases: list[str], target: str) -> list[str]:
    from google.cloud import translate_v3 as translate

    client = translate.TranslationServiceClient()
    parent = f"projects/{project_id}/locations/global"
    response = client.translate_text(
        request={
            "parent": parent,
            "contents": phrases,
            "mime_type": "text/plain",
            "source_language_code": "en",
            "target_language_code": target,
        }
    )
    return [t.translated_text for t in response.translations]


def synthesize_audio(text: str, out_path: Path, language_code: str, voice_name: str) -> None:
    from google.cloud import texttospeech

    client = texttospeech.TextToSpeechClient()
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(language_code=language_code, name=voice_name)
    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(response.audio_content)


def upload_audio(bucket_name: str, local_path: Path, blob_name: str) -> str:
    from google.cloud import storage

    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(f"audio/{blob_name}")
    blob.upload_from_filename(str(local_path), content_type="audio/mpeg")
    return f"https://storage.googleapis.com/{bucket_name}/audio/{blob_name}"


def build_lessons(
    project_id: str,
    target_lang: str,
    tts_lang: str,
    tts_voice: str,
    skip_translate: bool,
    skip_audio: bool,
    upload: bool,
) -> dict:
    source = load_source()
    categories_meta = [
        {"id": c["id"], "title": c["title"], "icon": c["icon"]} for c in source["categories"]
    ]
    lessons: list[dict] = []

    for cat in source["categories"]:
        phrases = cat["phrases"]
        if skip_translate:
            raise SystemExit("--skip-translate requires existing data/lessons.json; run full pipeline first.")

        print(f"Translating {cat['title']} ({len(phrases)} phrases)...")
        bengali_list = translate_phrases(project_id, phrases, target_lang)

        for i, (english, bengali) in enumerate(zip(phrases, bengali_list), start=1):
            lesson_id = f"{cat['id']}_{i}"
            audio_file = f"{lesson_id}.mp3"
            translit = rough_transliterate(bengali)

            if not skip_audio:
                out_mp3 = AUDIO_OUT / audio_file
                print(f"  TTS {lesson_id}...")
                synthesize_audio(bengali, out_mp3, tts_lang, tts_voice)

            audio_url = None
            bucket = os.environ.get("GCS_BUCKET")
            if upload and bucket and not skip_audio:
                audio_url = upload_audio(bucket, AUDIO_OUT / audio_file, audio_file)

            entry = {
                "lesson_id": lesson_id,
                "category_id": cat["id"],
                "english_phrase": english,
                "bengali_script": bengali,
                "bengali_transliteration": translit,
                "audio_file": audio_file,
            }
            if audio_url:
                entry["audio_url"] = audio_url
            lessons.append(entry)

    return {
        "version": 1,
        "language": target_lang,
        "dialect": tts_lang,
        "lessons": lessons,
        "categories": categories_meta,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Bangla Learn from Google Cloud APIs")
    parser.add_argument("--skip-audio", action="store_true", help="Only translate, no TTS")
    parser.add_argument("--skip-translate", action="store_true", help="Not supported alone")
    parser.add_argument("--upload", action="store_true", help="Upload MP3s to GCS_BUCKET")
    args = parser.parse_args()

    project_id = os.environ.get("GCP_PROJECT_ID")
    if not project_id:
        print("Set GCP_PROJECT_ID to your Google Cloud project.", file=sys.stderr)
        sys.exit(1)

    target = os.environ.get("TRANSLATE_TARGET", "bn")
    tts_lang = os.environ.get("TTS_LANGUAGE_CODE", "bn-IN")
    tts_voice = os.environ.get("TTS_VOICE_NAME", "bn-IN-Wavenet-A")

    payload = build_lessons(
        project_id=project_id,
        target_lang=target,
        tts_lang=tts_lang,
        tts_voice=tts_voice,
        skip_translate=args.skip_translate,
        skip_audio=args.skip_audio,
        upload=args.upload,
    )

    LESSONS_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    public_data = ROOT / "app" / "public" / "data" / "lessons.json"
    public_data.parent.mkdir(parents=True, exist_ok=True)
    public_data.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nWrote {len(payload['lessons'])} lessons to {LESSONS_OUT}")
    if not args.skip_audio:
        print(f"Audio files in {AUDIO_OUT}")


if __name__ == "__main__":
    main()
