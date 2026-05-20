#!/usr/bin/env python3
"""
Validate a spoken recording against expected Bengali using Cloud Speech-to-Text.

Example:
  python scripts/validate_speech.py --audio sample.wav --expected "ছেলেটি ভাত খায়।"

Requires: pip install google-cloud-speech
"""

from __future__ import annotations

import argparse
import re
import sys


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def similarity(a: str, b: str) -> float:
    a, b = normalize(a), normalize(b)
    if a == b:
        return 1.0
    if not a or not b:
        return 0.0
    la, lb = len(a), len(b)
    matrix = [[0] * (lb + 1) for _ in range(la + 1)]
    for i in range(la + 1):
        matrix[i][0] = i
    for j in range(lb + 1):
        matrix[0][j] = j
    for i in range(1, la + 1):
        for j in range(1, lb + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            matrix[i][j] = min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
    dist = matrix[la][lb]
    return 1 - dist / max(la, lb)


def transcribe(path: str, language_code: str) -> str:
    from google.cloud import speech

    client = speech.SpeechClient()
    with open(path, "rb") as f:
        content = f.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        language_code=language_code,
        enable_automatic_punctuation=True,
    )
    response = client.recognize(config=config, audio=audio)
    if not response.results:
        return ""
    return response.results[0].alternatives[0].transcript


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audio", required=True, help="Path to WAV (LINEAR16)")
    parser.add_argument("--expected", required=True, help="Expected Bengali sentence")
    parser.add_argument("--lang", default="bn-BD", help="bn-BD or bn-IN")
    parser.add_argument("--threshold", type=float, default=0.9)
    args = parser.parse_args()

    text = transcribe(args.audio, args.lang)
    score = similarity(text, args.expected)
    print(f"Transcript: {text}")
    print(f"Expected:   {args.expected}")
    print(f"Match:      {score:.0%}")
    sys.exit(0 if score >= args.threshold else 1)


if __name__ == "__main__":
    main()
