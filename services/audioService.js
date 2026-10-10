// Audio is kept out of the UI. Uses the browser's speech engine on web and
// expo-speech on Android/iOS (run `npx expo install expo-speech`).
// If neither is available we simply return false and the UI shows the pronunciation text.
import { Platform, Image } from 'react-native';

let Speech = null;
try { Speech = require('expo-speech'); } catch (e) { Speech = null; }

let AudioLib = null;
try { AudioLib = require('expo-audio'); } catch (e) { AudioLib = null; }

let enabled = true;
let webClip = null, nativeClip = null;
export const setSoundEnabled = (v) => { enabled = !!v; if (!v) stopSpeaking(); };
export const canSpeak = () => (Platform.OS === 'web' ? typeof window !== 'undefined' && 'speechSynthesis' in window : !!Speech);

// ---------- shared voice state (so every sound has Pause / Play / Stop) ----------
import { useEffect, useState } from 'react';
let voice = { active:false, paused:false, key:null };
let restartText = null, lastOpts = {};                  // Android can't pause speech: we stop and replay on Play
const listeners = new Set();
const setVoice = (patch) => { voice = { ...voice, ...patch }; listeners.forEach(f => f(voice)); };
export const getVoice = () => voice;
export const subscribeVoice = (f) => { listeners.add(f); return () => listeners.delete(f); };
export function useVoice() {
  const [v, setV] = useState(voice);
  useEffect(() => { setV(voice); return subscribeVoice(setV); }, []);
  return v;
}

let token = 0;                                          // ignores "finished" events from sounds that were replaced
export async function speak(text, opts = {}) {
  if (!text || !enabled) return false;
  const rate = opts.rate ?? 0.8, pitch = opts.pitch ?? 1.15, my = ++token;
  const done = () => { if (my === token) setVoice({ active:false, paused:false }); };
  try {
    stopClip();
    lastOpts = opts; restartText = null;
    if (Platform.OS === 'web') {
      if (!canSpeak()) return false;
      window.speechSynthesis.cancel();
      const u = new window.SpeechSynthesisUtterance(text);
      u.rate = rate; u.pitch = pitch; u.lang = 'en-US'; u.onend = done; u.onerror = done;
      window.speechSynthesis.speak(u);
      setVoice({ active:true, paused:false, key:text });
      return true;
    }
    if (Speech && Speech.speak) {
      Speech.stop && Speech.stop();
      Speech.speak(text, { language:'en-US', rate, pitch, onDone:done, onStopped:done, onError:done });
      setVoice({ active:true, paused:false, key:text });
      return true;
    }
  } catch (e) { if (__DEV__) console.log('[audio]', e); }
  return false;
}

export function stopSpeaking() {
  token++;
  try { if (Platform.OS === 'web') window.speechSynthesis && window.speechSynthesis.cancel(); else Speech && Speech.stop && Speech.stop(); } catch (e) {}
}
// ⏸ Pause whatever is playing (speech or an animal sound)
export function pauseVoice() {
  if (!voice.active || voice.paused) return;
  try {
    if (webClip) webClip.pause();
    else if (nativeClip) nativeClip.pause();
    else if (Platform.OS === 'web') window.speechSynthesis.pause();
    else if (Speech && Speech.pause) Speech.pause();
    else if (Speech) { restartText = voice.key; Speech.stop(); }
    setVoice({ paused:true });
  } catch (e) { if (__DEV__) console.log('[pause]', e); }
}
// ▶ Continue from where it stopped
export function resumeVoice() {
  if (!voice.active || !voice.paused) return;
  try {
    if (webClip) webClip.play();
    else if (nativeClip) nativeClip.play();
    else if (Platform.OS === 'web') window.speechSynthesis.resume();
    else if (restartText) { const t = restartText; restartText = null; speak(t, lastOpts); return; }
    else if (Speech && Speech.resume) Speech.resume();
    setVoice({ paused:false });
  } catch (e) { if (__DEV__) console.log('[resume]', e); }
}
export function toggleVoice() { voice.paused ? resumeVoice() : pauseVoice(); }
// ⏹ Stop everything
export function stopVoice() { stopSpeaking(); stopClip(); restartText = null; setVoice({ active:false, paused:false, key:null }); }

// ---------- sound effects (animal sounds etc.) ----------
// `clip` is a require('./file.wav') result, or a URL string. Returns true if a sound started.
const uriOf = (clip) => {
  if (!clip) return null;
  if (typeof clip === 'string') return clip;
  if (clip.uri) return clip.uri;
  try { const r = Image.resolveAssetSource(clip); if (r && r.uri) return r.uri; } catch (e) {}
  try { return require('expo-asset').Asset.fromModule(clip).uri; } catch (e) { return null; }
};
export function stopClip() {
  try { if (webClip) { webClip.onended = null; webClip.pause(); webClip = null; } } catch (e) {}
  try { if (nativeClip) { nativeClip.remove ? nativeClip.remove() : nativeClip.release && nativeClip.release(); nativeClip = null; } } catch (e) {}
}
export async function playClip(clip, key = null) {
  if (!clip || !enabled) return false;
  try {
    stopSpeaking(); stopClip();
    const my = ++token, done = () => { if (my === token) setVoice({ active:false, paused:false }); };
    if (Platform.OS === 'web') {
      const uri = uriOf(clip); if (!uri || typeof window === 'undefined' || !window.Audio) return false;
      webClip = new window.Audio(uri); webClip.onended = done; webClip.onerror = done; await webClip.play();
      setVoice({ active:true, paused:false, key }); return true;
    }
    if (AudioLib && AudioLib.createAudioPlayer) {
      nativeClip = AudioLib.createAudioPlayer(clip);
      try { nativeClip.addListener('playbackStatusUpdate', (st) => { if (st && st.didJustFinish) done(); }); } catch (e) {}
      nativeClip.play(); setVoice({ active:true, paused:false, key }); return true;
    }
  } catch (e) { if (__DEV__) console.log('[clip]', e); }
  return false;
}
