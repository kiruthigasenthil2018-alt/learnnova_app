// "Download as PDF".  Web: opens a clean printable page and the browser's Print dialog → choose "Save as PDF".
// Android/iOS: needs `npx expo install expo-print expo-sharing` (creates a real PDF file and opens the share sheet).
import { Platform } from 'react-native';
import { getLessons, subjectOf } from '../data/curriculum';
import { PHONICS } from '../data/phonicsData';

let Print = null, Sharing = null;
try { Print = require('expo-print'); } catch (e) { Print = null; }
try { Sharing = require('expo-sharing'); } catch (e) { Sharing = null; }

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CSS = `body{font-family:Arial,Helvetica,sans-serif;color:#14213D;margin:24px;line-height:1.5}
h1{color:#2463EB;margin:0 0 4px}h2{color:#14213D;border-bottom:3px solid #FFC83D;padding-bottom:4px;margin-top:26px}
.sub{color:#566485;margin-bottom:16px}.box{background:#EEF4FF;border-radius:12px;padding:12px 16px;margin:10px 0}
.ex{background:#FFF8E1;border-radius:10px;padding:8px 12px;margin:6px 0}.flow span{display:inline-block;background:#E8F5E9;border-radius:10px;padding:6px 12px;margin:3px}
.q{margin:12px 0;page-break-inside:avoid}.opt{margin-left:22px}.pic{font-size:30px}.lesson{page-break-before:always}.lesson:first-of-type{page-break-before:avoid}
.key td{padding:2px 14px 2px 0}.foot{margin-top:30px;color:#566485;font-size:12px;text-align:center}
.letter{display:inline-block;width:150px;height:150px;border:2px solid #D5DEF0;border-radius:16px;text-align:center;margin:6px;vertical-align:top;page-break-inside:avoid}
.letter b{font-size:44px;color:#2463EB}.letter div{font-size:15px}`;
const wrap = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${body}<div class="foot">LearnNova • Learn • Play • Explore • Grow 🌟</div></body></html>`;

const qBlock = (q, n) => {
  if (q.type === 'match') return `<div class="q"><b>${n}. ${esc(q.q)}</b><div class="opt">${q.pairs.map(p => `${esc(p[0])} → ______`).join('<br>')}</div></div>`;
  const opts = q.o.map((o, i) => `<div class="opt">${String.fromCharCode(65 + i)}. ${esc(o)}</div>`).join('');
  return `<div class="q">${q.pic ? `<div class="pic">${esc(q.pic)}</div>` : ''}<b>${n}. ${esc(q.q)}</b>${opts}</div>`;
};
const ans = (q) => (q.type === 'match' ? q.pairs.map(p => `${p[0]}=${p[1]}`).join(', ') : `${String.fromCharCode(65 + q.a)}. ${q.o[q.a]}`);
const lessonBody = (l, grade, withKey) => `<div class="lesson"><h2>${esc(l.emoji)} Lesson ${l.n}: ${esc(l.title)}</h2>
  <div class="box"><b>💡 Learn this</b><br>${esc(l.intro)}</div>
  ${l.flow ? `<div class="flow"><b>🔭 Step by step:</b><br>${l.flow.map(f => `<span>${esc(f)}</span>`).join(' ➜ ')}</div>` : ''}
  <b>✏️ Examples</b>${l.examples.map(e => `<div class="ex">${esc(e)}</div>`).join('')}
  <b>📝 Practice</b>${l.qs.map((q, i) => qBlock(q, i + 1)).join('')}${withKey ? '' : ''}</div>`;
const keyBlock = (ls) => `<div class="lesson"><h2>✅ Answer key</h2>${ls.map(l => `<p><b>Lesson ${l.n}: ${esc(l.title)}</b></p><table class="key">${l.qs.map((q, i) => `<tr><td>${i + 1}.</td><td>${esc(ans(q))}</td></tr>`).join('')}</table>`).join('')}</div>`;

export function lessonHtml(subject, grade, idx) {
  const sub = subjectOf(subject), l = getLessons(subject, grade)[idx];
  return { title:`LearnNova ${sub.title} Grade ${grade} Lesson ${l.n} - ${l.title}`, html:wrap(`${sub.title} Grade ${grade} – ${l.title}`, `<h1>${esc(sub.emoji)} ${esc(sub.title)} – Grade ${grade}</h1><div class="sub">Learner name: __________________  Date: ____________</div>${lessonBody(l, grade)}${keyBlock([l])}`) };
}
export function subjectHtml(subject, grade) {
  const sub = subjectOf(subject), ls = getLessons(subject, grade);
  return { title:`LearnNova ${sub.title} Grade ${grade} Workbook`, html:wrap(`${sub.title} Grade ${grade}`, `<h1>${esc(sub.emoji)} ${esc(sub.title)} – Grade ${grade} Workbook</h1><div class="sub">${ls.length} lessons with examples and practice questions • Learner name: __________________</div>${ls.map(l => lessonBody(l, grade)).join('')}${keyBlock(ls)}`) };
}
export function alphabetHtml() {
  return { title:'LearnNova A-Z Phonics Chart', html:wrap('A–Z Phonics Chart', `<h1>🔤 A–Z Phonics Chart</h1><div class="sub">Say the sound, then the word: “B says buh, B for Ball.”</div>${PHONICS.map(p => `<div class="letter"><b>${p.upper}${p.lower}</b><div style="font-size:34px">${esc(p.emoji)}</div><div>${esc(p.word)}</div><div style="color:#566485">/${esc(p.sound)}/ “${esc(p.say)}”</div></div>`).join('')}`) };
}

// returns { ok, reason }
export async function savePdf({ html, title }) {
  try {
    if (Platform.OS === 'web') {
      const w = window.open('', '_blank'); if (!w) return { ok:false, reason:'popup' };
      w.document.open(); w.document.write(html); w.document.close(); w.focus();
      setTimeout(() => { try { w.print(); } catch (e) {} }, 500);
      return { ok:true };
    }
    if (!Print || !Sharing) return { ok:false, reason:'missing' };
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType:'application/pdf', UTI:'com.adobe.pdf', dialogTitle:title });
    return { ok:true };
  } catch (e) { if (__DEV__) console.log('[pdf]', e); return { ok:false, reason:'error' }; }
}
