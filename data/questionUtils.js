// Shared helpers for building question objects.
// Question shape: { type:'mcq'|'tf'|'fill'|'pic'|'match', q, o:[options], a:correctIndex, pic?, big?, say?, pairs? }
export const shuffle = (arr, rnd = Math.random) => { const r = [...arr]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

// Compact parser:  'Question|A|B|C|D|idx'   'T:statement|1'   'F:Fill ___ blank|A|B|C|idx'   'P:🍎🍎~Question|A|B|C|idx'
export const P = (s) => {
  let t = 'mcq';
  if (/^[TFP]:/.test(s)) { t = { T:'tf', F:'fill', P:'pic' }[s[0]]; s = s.slice(2); }
  const p = s.split('|');
  if (t === 'tf') return { type:'tf', q:`True or False: ${p[0]}`, o:['True', 'False'], a:p[1] === '1' ? 0 : 1 };
  const a = +p.pop(); let q = p.shift(), pic;
  if (t === 'pic') [pic, q] = q.split('~');
  return { type:t, q, pic, o:p, a };
};

// Shuffle options once per play so the right answer is not always in the same place.
export const shuffleQ = (q, rnd = Math.random) => {
  if (!q.o || q.type === 'tf' || q.type === 'match') return q;
  const right = q.o[q.a], o = shuffle(q.o, rnd);
  return { ...q, o, a:o.indexOf(right) };
};
export const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const rng = (seed) => { const r = seed == null ? Math.random : mulberry(seed); return { f:r, int:(a, b) => a + Math.floor(r() * (b - a + 1)), pick:(x) => x[Math.floor(r() * x.length)] }; };
