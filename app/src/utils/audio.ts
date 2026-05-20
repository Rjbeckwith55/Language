const BASE = import.meta.env.BASE_URL;

export function audioUrl(fileName: string): string {
  return `${BASE}audio/${fileName}`;
}

/** Browser TTS fallback when pre-generated MP3 is missing. */
export function speakBengali(text: string, dialect = "bn-BD"): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = dialect;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.startsWith("bn"));
  if (match) utterance.voice = match;
  window.speechSynthesis.speak(utterance);
}

export function playLessonAudio(
  fileName: string,
  bengaliScript: string,
  dialect = "bn-BD",
): void {
  const url = audioUrl(fileName);
  const audio = new Audio(url);
  audio.onerror = () => speakBengali(bengaliScript, dialect);
  void audio.play().catch(() => speakBengali(bengaliScript, dialect));
}
