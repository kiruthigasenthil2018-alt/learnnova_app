// Dictionary service layer.  UI → lookup() → kid-friendly local words first, then REAL online dictionaries.
// Free sources, no API key:
//   1. api.dictionaryapi.dev   (meanings, phonetics, examples, synonyms)
//   2. en.wiktionary.org       (huge: millions of words, forms like "running", slang, names of things)
//   3. api.datamuse.com        (spelling correction: "habbit" → "habit", plus short definitions as a last resort)
// Every request has a time-out, so the screen can never be stuck on "Looking it up…".
import { DICTIONARY } from '../data/dictionaryData';

const TIMEOUT = 6000;
const clean = (w) => (w || '').trim().toLowerCase().replace(/[^a-z' -]/g, '').replace(/\s+/g, ' ').trim();
const local = (w) => DICTIONARY.find(d => d.word.toLowerCase() === w) || null;
const strip = (h) => (h || '').replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

async function getJson(url) {
  const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => ctl && ctl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, ctl ? { signal:ctl.signal } : undefined);
    if (r.status === 404) return { notFound:true };
    if (!r.ok) throw new Error('http ' + r.status);
    return { data:await r.json() };
  } finally { clearTimeout(timer); }
}

// 1) dictionaryapi.dev
async function fromDictApi(w) {
  const { data, notFound } = await getJson(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(w)}`);
  if (notFound || !Array.isArray(data) || !data[0]) return null;
  const e = data[0], ms = data.flatMap(x => x.meanings || []);
  if (!ms.length) return null;
  const defs = ms.flatMap(m => (m.definitions || []).map(d => ({ pos:m.partOfSpeech, d:d.definition, ex:d.example })));
  const syn = [...new Set(ms.flatMap(m => [...(m.synonyms || []), ...(m.definitions || []).flatMap(d => d.synonyms || [])]))].slice(0, 6);
  const ph = (data.flatMap(x => x.phonetics || [])).find(p => p.text) || {};
  return {
    word:e.word, emoji:'📖', pos:ms[0].partOfSpeech, online:true, source:'dictionaryapi.dev',
    pron:e.phonetic || ph.text || '', meaning:defs[0].d, example:(defs.find(d => d.ex) || {}).ex || '', similar:syn,
    more:defs.slice(1, 5).map(d => `(${d.pos}) ${d.d}`),
  };
}
// 2) Wiktionary
async function fromWiktionary(w) {
  const { data, notFound } = await getJson(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(w)}`);
  if (notFound || !data || !data.en || !data.en.length) return null;
  const defs = data.en.flatMap(sec => (sec.definitions || []).map(d => ({ pos:(sec.partOfSpeech || '').toLowerCase(), d:strip(d.definition), ex:strip((d.examples || [])[0] || (d.parsedExamples && d.parsedExamples[0] && d.parsedExamples[0].example) || '') }))).filter(d => d.d);
  if (!defs.length) return null;
  return {
    word:w, emoji:'📖', pos:defs[0].pos, online:true, source:'Wiktionary', pron:'', meaning:defs[0].d,
    example:(defs.find(d => d.ex) || {}).ex || '', similar:[], more:defs.slice(1, 5).map(d => `(${d.pos}) ${d.d}`),
  };
}
// 3) Datamuse: spelling fix + short definitions
export async function didYouMean(word) {
  try {
    const { data } = await getJson(`https://api.datamuse.com/words?sp=${encodeURIComponent(clean(word))}&max=6`);
    return (data || []).map(x => x.word).filter(x => x !== clean(word));
  } catch (e) { return []; }
}
async function fromDatamuse(w) {
  const { data } = await getJson(`https://api.datamuse.com/words?sp=${encodeURIComponent(w)}&md=dp&max=1`);
  const hit = data && data[0]; if (!hit || hit.word !== w || !hit.defs || !hit.defs.length) return null;
  const defs = hit.defs.map(x => { const [p, ...rest] = x.split('\t'); return { pos:({ n:'noun', v:'verb', adj:'adjective', adv:'adverb' })[p] || p, d:rest.join(' ') }; });
  return { word:w, emoji:'📖', pos:defs[0].pos, online:true, source:'Datamuse', pron:'', meaning:defs[0].d, example:'', similar:[], more:defs.slice(1, 4).map(d => `(${d.pos}) ${d.d}`) };
}
// Try every source at the same time; the first useful answer wins (order of preference kept).
async function online(w) {
  const jobs = [fromDictApi(w), fromWiktionary(w), fromDatamuse(w)].map(p => p.catch(e => ({ __err:e })));
  const res = await Promise.all(jobs);
  const hit = res.find(r => r && !r.__err);
  if (hit) return hit;
  if (res.every(r => r && r.__err)) throw new Error('offline');
  return null;
}
const variants = (w) => [w.replace(/ies$/, 'y'), w.replace(/ied$/, 'y'), w.replace(/es$/, ''), w.replace(/s$/, ''), w.replace(/ed$/, ''), w.replace(/ing$/, ''), w.replace(/ly$/, ''), w.replace(/er$/, '')].filter((v, i, a) => v.length > 2 && v !== w && a.indexOf(v) === i);

// Optional picture for the word (Wikipedia thumbnail). Never blocks the answer.
export async function wordImage(word) {
  const w = clean(word); if (!w) return null;
  try {
    const { data } = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(w)}`);
    return data && data.thumbnail && data.type !== 'disambiguation' ? data.thumbnail.source : null;
  } catch (e) { return null; }
}

// lookup('habbit') → { ...entry, corrected:'habit', typed:'habbit' }
export async function lookup(word) {
  const w = clean(word); if (!w) return null;
  const l = local(w); if (l) return l;
  let offline = false;
  const attempt = async (x) => { try { return await online(x); } catch (e) { offline = true; return null; } };
  let e = await attempt(w);
  if (e) return e;
  for (const v of variants(w).slice(0, 3)) { const l2 = local(v); if (l2) return l2; e = await attempt(v); if (e) return { ...e, note:`“${w}” is a form of “${v}”.` }; }
  if (offline) throw new Error('offline');
  // spelling help: take the best guess and show its meaning
  const alts = await didYouMean(w);
  for (const a of alts.slice(0, 2)) { const l3 = local(a); const e2 = l3 || await attempt(a); if (e2) return { ...e2, corrected:a, typed:w }; }
  return null;
}
export function suggest(prefix, n = 6) { const w = clean(prefix); if (!w) return []; return DICTIONARY.filter(d => d.word.startsWith(w)).slice(0, n); }
export const wordOfTheDay = () => DICTIONARY[Math.floor(Date.now() / 864e5) % DICTIONARY.length];
export const allWords = () => DICTIONARY;
export const formatEntry = (e) => `📖 ${e.word.toUpperCase()}${e.pron ? `   ${e.pron}` : ''}\n\nMeaning:\n${e.meaning}${e.example ? `\n\nExample:\n${e.example}` : ''}${e.similar && e.similar.length ? `\n\nSimilar words:\n${e.similar.join(', ')}` : ''}`;
