/** Optional browser speech for audio_match (no cloud TTS). */
export function speakBengali(text: string, dialect = "bn-BD"): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = dialect;
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.toLowerCase().startsWith("bn"));
  if (match) utterance.voice = match;
  window.speechSynthesis.speak(utterance);
}

export function loadVoices(): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.getVoices();
}
