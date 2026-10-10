// Voice questions (speech-to-text). Works in the web version via the browser's speech recognition.
// On phones this needs a development build with a speech-recognition module, so we report "not supported" and the UI says so kindly.
import { Platform } from 'react-native';

const SR = () => (Platform.OS === 'web' && typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null);
export const isVoiceSupported = () => !!SR();

export function listen({ onResult, onEnd, onError }) {
  const Rec = SR(); if (!Rec) { onError && onError('unsupported'); return () => {}; }
  const rec = new Rec(); rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
  rec.onresult = (e) => onResult && onResult(e.results[0][0].transcript);
  rec.onerror = (e) => onError && onError(e.error);
  rec.onend = () => onEnd && onEnd();
  try { rec.start(); } catch (e) { onError && onError('start'); }
  return () => { try { rec.stop(); } catch (e) {} };
}
