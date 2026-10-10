import { lookup, formatEntry } from './dictionaryService';
// LearnNova AI service layer.   AIScreen → askAI() → (mock answers today) → real API later.
// To connect a real model: run server/server.js (it keeps the API key on the server) and set AI_CONFIG.url.
// NEVER put an API key in this file.
import { Platform } from 'react-native';
// Static access so Expo can inline it:  EXPO_PUBLIC_AI_URL in .env  (e.g. http://192.168.1.20:3000 for a real phone)
const ENV_URL = process.env.EXPO_PUBLIC_AI_URL || '';
// Browser on localhost -> your local server (npm run ai). Browser on a real website (Vercel) -> same site /api.
const onWebsite = Platform.OS === 'web' && typeof window !== 'undefined' && !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
const BASE = (ENV_URL || (onWebsite ? window.location.origin : Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')).replace(/\/+$/, '');
export const AI_CONFIG = { url:`${BASE}/api/chat`, health:`${BASE}/api/health` };

const fetchT = async (url, opt = {}, ms = 30000) => {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, t = setTimeout(() => ctl && ctl.abort(), ms);
  try { return await fetch(url, { ...opt, signal:ctl ? ctl.signal : undefined }); } finally { clearTimeout(t); }
};
// 'claude' = server running with a key, 'nokey' = server running but no key, 'offline' = server not reachable
export async function aiStatus() {
  try { const d = await (await fetchT(AI_CONFIG.health, {}, 3500)).json(); return d.hasKey ? 'claude' : 'nokey'; } catch (e) { return 'offline'; }
}
// Chat answers are plain text for children: remove any markdown symbols the model might still use.
export const plain = (t) => String(t || '').replace(/```[a-z]*\n?/g, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1').replace(/^#{1,6}\s*/gm, '').replace(/^\s*[*]\s+/gm, '• ').replace(/`([^`]+)`/g, '$1').trim();
export const OFFLINE_MSG = '🔌 My big brain (the AI server) is not connected yet, so I can only answer simple questions right now.\n\nAsk a grown-up to start it: run  npm run ai  (see README → Real AI answers).';

export const SUGGESTIONS = ['Why does rain happen?', 'What is 25 × 4?', 'What is a noun?', 'Why do plants need sunlight?'];
export const UNCLEAR = 'Could you explain your question\na little more? 😊';
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const has = (q, ...w) => w.some(x => new RegExp(`\\b${x}\\b`).test(q));
const wb = (q, w) => new RegExp(`\\b${w.trim()}s?\\b`).test(q);

const KB = [
  { k:['photosynthesis', 'plants need sunlight', 'plant need sun', 'sunlight'], a:'🌱 Photosynthesis\n\nPhotosynthesis is how green plants make their own food.\n\nPlants use:\n☀️ Sunlight\n💧 Water\n🌿 Carbon dioxide\n\nThey make:\n🍃 Food\n💨 Oxygen\n\nEasy idea:\nSunlight + Water + Carbon Dioxide\n              ↓\n        Food + Oxygen\n\nSo plants need sunlight like we need lunch! 🌞' },
  { k:['rain'], a:'🌧️ Why does rain happen?\n\nStep 1: ☀️ The Sun heats water in rivers and seas.\nStep 2: 💨 The water turns into invisible vapour and rises.\nStep 3: ☁️ High up it cools and becomes tiny drops that make clouds.\nStep 4: 🌧️ When the drops get heavy, they fall as rain!\n\nThis is called the water cycle. 💧' },
  { k:['noun'], a:'🏷️ What is a noun?\n\nA noun is a naming word. It names a person, place, animal or thing.\n\nExamples:\n👧 girl  •  🏫 school  •  🐶 dog  •  ⚽ ball\n\nTry it: is "teacher" a noun? Yes! 🎉' },
  { k:['verb'], a:'🏃 What is a verb?\n\nA verb is an action word. It tells what someone does.\n\nExamples: run, jump, eat, sing.\n\nIn "The bird sings", the verb is "sings". 🐦' },
  { k:['adjective'], a:'🌈 What is an adjective?\n\nAn adjective describes a noun.\n\nbig dog • red ball • soft pillow\n\nIt tells us what something is like! ✨' },
  { k:['pronoun'], a:'👤 What is a pronoun?\n\nA pronoun takes the place of a noun.\n\nMina is kind. She is kind.\n\nHe, she, it, we and they are pronouns. 🌟' },
  { k:['fraction'], a:'🍕 What is a fraction?\n\nA fraction is a part of a whole.\n\nIf a pizza is cut into 4 equal slices and you eat 1, you ate 1/4 (one quarter).\n\nTop number = parts you have.\nBottom number = total equal parts. 🍕' },
  { k:['solar system', 'planet'], a:'🪐 The Solar System\n\nThe Sun is a star in the middle. 8 planets go around it:\nMercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.\n\nWe live on Earth 🌍 — the only planet we know with living things!' },
  { k:['moon'], a:'🌙 The Moon\n\nThe Moon goes around Earth. It does not make its own light — it shines because it reflects sunlight! ☀️➡️🌙' },
  { k:['sun '], a:'☀️ The Sun is a star. It gives us light and heat. Without it, plants could not grow and Earth would be freezing cold!' },
  { k:['gravity'], a:'🍎 Gravity\n\nGravity is an invisible force that pulls things toward Earth. That is why a ball you throw up comes back down!' },
  { k:['capital of india', 'india capital'], a:'🇮🇳 The capital of India is New Delhi.' },
  { k:['water cycle'], a:'💧 The Water Cycle\n\n☀️ Evaporation → ☁️ Condensation → 🌧️ Rain → 🏞️ Collection → and again!' },
];
const MATH_RE = /(-?\d+(?:\.\d+)?)\s*([x×*+\-−/÷])\s*(-?\d+(?:\.\d+)?)/;
function solveMath(q) {
  const m = q.match(MATH_RE); if (!m) return null;
  const a = +m[1], b = +m[3], op = m[2], fmt = (n) => (Number.isInteger(n) ? String(n) : (+n.toFixed(3)).toString());
  if ('x×*'.includes(op)) return `✖️ ${a} × ${b}\n\nStep 1: Think of ${a} groups of ${b}.\nStep 2: Add ${b} again and again, ${a} times (or use your tables).\n\nAnswer: ${a} × ${b} = ${fmt(a * b)} 🎉\n\nGreat thinking! Try another one?`;
  if ('/÷'.includes(op)) return b === 0 ? '😊 We cannot divide by zero — nothing can be shared into zero groups!' : `➗ ${a} ÷ ${b}\n\nStep 1: How many times does ${b} fit into ${a}?\nStep 2: Check: ${fmt(a / b)} × ${b} = ${a}.\n\nAnswer: ${a} ÷ ${b} = ${fmt(a / b)} 🎉`;
  if (op === '+') return `➕ ${a} + ${b}\n\nStep 1: Start at ${a}.\nStep 2: Count on ${b} more.\n\nAnswer: ${a} + ${b} = ${fmt(a + b)} 🎉`;
  return `➖ ${a} − ${b}\n\nStep 1: Start with ${a}.\nStep 2: Take away ${b}.\n\nAnswer: ${a} − ${b} = ${fmt(a - b)} 🎉`;
}

export function mockAnswer(question) {
  const q = ` ${question.toLowerCase().trim()} `;
  if (q.trim().length < 3) return UNCLEAR;
  if (has(q, 'address', 'phone number', 'password', 'where do you live')) return '🔒 Let\'s keep personal things private! Never share your address, phone number or passwords online.\n\nI can help you with maths, English, science and more. What would you like to learn? 😊';
  if (has(q, 'kill', 'gun', 'weapon', 'blood', 'sex', 'hate')) return 'That is not something we explore here. 🌈 Let\'s learn something fun instead — ask me about animals, space or numbers!';
  if (has(q, 'do my homework', 'write my homework', 'answer my homework')) return 'I will not just give the answer — I will help you learn it! 💪\n\nTell me the question and we will solve it step by step together. 😊';
  const math = solveMath(q); if (math) return math;
  const hit = KB.find(e => e.k.some(w => wb(q, w))); if (hit) return hit.a;
  return null;               // not in the built-in lessons → askAI() tries the dictionary and Wikipedia next
}


// ---------- online helpers (free, no API key) ----------
const DEF_RE = /(?:meaning of|define|definition of|what does\s+(\S+)\s+mean|what is the meaning of|synonym of|tell me about the word)\s*(?:the word\s+)?([a-z'-]+)?/;
function definitionWord(raw) {
  const q = raw.toLowerCase().replace(/[?.!,]/g, '').trim();
  const m = q.match(DEF_RE);
  if (m) return (m[1] || m[2] || '').trim() || null;
  if (/^[a-z'-]{2,}$/.test(q)) return q;                         // a single word → treat as "what does it mean?"
  const m2 = q.match(/^(?:what is|what's|who is|meaning)\s+(?:a |an |the )?([a-z'-]+)$/); return m2 ? m2[1] : null;
}
const topicOf = (raw) => raw.toLowerCase().replace(/[?.!,]/g, '').replace(/^(please\s+)?(can you |could you )?(tell me|explain|describe|teach me|show me)( about| how| why| what)?\s*/, '').replace(/^(what|who|where|when|why|how)( is| are| was| were| does| do| did| can| to)?\s+(a |an |the )?/, '').trim();

export async function askAI(question, { grade, history = [] } = {}) {
  // 1) Claude through your server (full conversation so follow-up questions work)
  try {
    const messages = [...history.map(m => ({ role:m.role, content:m.text })), { role:'user', content:question }];
    const r = await fetchT(AI_CONFIG.url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ messages, grade }) });
    const d = await r.json();
    if (d.reply && r.ok) return plain(d.reply);
    if (d.reply && d.error === 'no-key') return `🔑 ${d.reply}`;
    if (d.reply && d.error === 'upstream') return `😅 ${d.reply}`;
  } catch (e) { if (__DEV__) console.log('[ai] server not reachable', e); }
  // 2) Offline helpers: built-in lessons, maths, dictionary
  await wait(400);
  const known = mockAnswer(question); if (known) return known;
  const w = definitionWord(question);
  if (w) { try { const e = await lookup(w); if (e) return `${formatEntry(e)}\n\nNice word! Can you use it in a sentence? ✍️`; } catch (e) { if (__DEV__) console.log('[ai-dict]', e); } }
  return OFFLINE_MSG;
}
