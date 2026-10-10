// Turns navigation params into a ready-to-play quiz: { title, emoji, theme, color, questions, kid, back }
import { shuffle, shuffleQ } from './questionUtils';
import { PHONICS } from './phonicsData';
import { COLORS, SHAPES, ANIMALS, FRUITS, VEGETABLES, TRANSPORT, FAMILY, BODY, NATURE } from './nurseryData';
import { getLessons, getSubjectQuiz, subjectOf } from './curriculum';
import { STORIES } from './stories';
import { RHYMES } from './nurseryData';
import { vocabOf, allVocab } from './vocabData';

const take = (arr, n) => shuffle(arr).slice(0, n);
const letters4 = (L) => [L.letter, ...take(PHONICS.filter(p => p.letter !== L.letter), 3).map(p => p.letter)];
const kidQ = (x) => ({ big:true, ...x });

const PHONICS_GAMES = {
  find:{ title:'Find the Letter', emoji:'🔎', build:() => take(PHONICS, 6).map(L => kidQ({ type:'mcq', q:`Which letter makes the /${L.sound}/ sound?`, say:L.say, o:letters4(L), a:0 })) },
  match:{ title:'Match Letter and Picture', emoji:'🧩', build:() => [0, 1, 2].map(() => ({ type:'match', q:'Match each letter with its picture', pairs:take(PHONICS, 4).map(L => [L.letter, L.emoji]), big:true })) },
  sound:{ title:'What Sound?', emoji:'🍎', build:() => take(PHONICS, 6).map(L => kidQ({ type:'pic', pic:L.emoji, q:`What letter does ${L.word} start with?`, say:L.word, o:letters4(L), a:0 })) },
  listen:{ title:'Listen and Choose', emoji:'🔊', build:() => take(PHONICS, 6).map(L => kidQ({ type:'mcq', q:'Listen to the sound. Which letter is it?', say:L.say, audioOnly:true, o:letters4(L), a:0 })) },
  missing:{ title:'Missing Letter', emoji:'🔤', build:() => take(PHONICS.filter(p => p.word.length > 2), 6).map(L => kidQ({ type:'fill', pic:L.emoji, q:`_ ${L.word.slice(1).toLowerCase()}`, say:L.word, o:letters4(L), a:0 })) },
};
export const PHONICS_GAME_LIST = Object.entries(PHONICS_GAMES).map(([id, g]) => ({ id, title:g.title, emoji:g.emoji }));

const matchRound = (list, key = 'emoji', val = 'name', title = 'Match the pairs') => ({ type:'match', q:title, pairs:take(list, 4).map(i => [i[key], i[val]]), big:true });
const NURSERY = {
  colors:{ title:'Color Matching', emoji:'🎨', theme:'games', build:() => [...take(COLORS, 5).map(c => kidQ({ type:'pic', pic:c.emoji, q:'What color is this?', say:c.name, o:[c.name, ...take(COLORS.filter(x => x !== c), 3).map(x => x.name)], a:0 })),
    { type:'match', q:'Match the object with its color', pairs:take(COLORS, 4).map(c => [c.emoji, c.name]), big:true }] },
  counting:{ title:'Number Counting', emoji:'🔢', theme:'math', build:() => take([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 6).map(n => kidQ({ type:'pic', pic:['🍎', '⭐', '🎈', '🐟', '🌸'][n % 5].repeat(n), q:'How many do you see?', say:'How many do you see?', o:[String(n), ...take([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(x => x !== n), 3).map(String)], a:0 })) },
  shapes:{ title:'Shape Matching', emoji:'🔷', theme:'math', build:() => [matchRound(SHAPES), matchRound(SHAPES), ...take(SHAPES, 3).map(s => kidQ({ type:'pic', pic:s.emoji, q:'What shape is this?', say:s.name, o:[s.name, ...take(SHAPES.filter(x => x !== s), 3).map(x => x.name)], a:0 }))] },
  animals:{ title:'Animal Matching', emoji:'🐶', theme:'phonics', build:() => [{ type:'match', q:'Match each animal with its sound', pairs:take(ANIMALS, 4).map(a => [a.emoji, a.extra.replace('!', '')]), big:true },
    ...take(ANIMALS, 4).map(a => kidQ({ type:'mcq', q:`Which animal says "${a.extra.replace('!', '')}"?`, say:a.extra, clip:a.name, o:[a.emoji, ...take(ANIMALS.filter(x => x !== a), 3).map(x => x.emoji)], a:0 }))] },
  odd:{ title:'Odd One Out', emoji:'🕵️', theme:'games', build:() => { const sets = [FRUITS, VEGETABLES, ANIMALS, TRANSPORT, BODY, NATURE, FAMILY];
    return Array.from({ length:5 }, () => { const [A, B] = take(sets, 2), three = take(A, 3), odd = take(B, 1)[0]; return kidQ({ type:'mcq', q:'Which one is different?', say:'Which one is different?', o:[odd.emoji, ...three.map(x => x.emoji)], a:0 }); }); } },
};

export function buildQuiz(p) {
  if (p.mode === 'phonics') { const g = PHONICS_GAMES[p.game]; return { title:g.title, emoji:g.emoji, theme:'phonics', color:'#E53935', kid:true, questions:g.build().map(q => shuffleQ(q)) }; }
  if (p.mode === 'nursery') { const g = NURSERY[p.activity]; return { title:g.title, emoji:g.emoji, theme:g.theme, color:'#8E24AA', kid:true, questions:g.build().map(q => shuffleQ(q)) }; }
  if (p.mode === 'lesson') {
    const sub = subjectOf(p.subject), les = getLessons(p.subject, p.grade)[p.idx];
    return { title:les.title, emoji:les.emoji, theme:sub.theme, color:sub.color, kid:p.grade <= 2, questions:les.qs.map(q => shuffleQ(q)) };
  }
  if (p.mode === 'subjectQuiz') { const sub = subjectOf(p.subject); return { title:`${sub.title} Quiz`, emoji:sub.emoji, theme:sub.theme, color:sub.color, kid:p.grade <= 2, questions:getSubjectQuiz(p.subject, p.grade).map(q => shuffleQ(q)) }; }
  if (p.mode === 'story') {
    const s = STORIES.find(x => x.id === p.id), others = STORIES.filter(x => x.id !== s.id).map(x => x.moral);
    const moralQ = { type:'mcq', q:'What is the moral of this story?', o:[s.moral, ...take(others, 3)], a:0 };      // every story ends with a moral question
    return { title:s.title, emoji:s.emoji, theme:'phonics', color:'#2463EB', kid:s.band === 'lo', moral:s.moral, questions:[...s.qs, moralQ].map(q => shuffleQ(q)) };
  }
  if (p.mode === 'vocab') {
    const cat = p.cat ? vocabOf(p.cat) : null, pool = cat ? cat.words : allVocab(), all = allVocab();
    const qs = take(pool, Math.min(8, pool.length)).map((w, i) => (i % 2 === 0
      ? { type:'mcq', q:`Which word means: “${w.meaning}”`, o:[w.word, ...take(all.filter(x => x.word !== w.word), 3).map(x => x.word)], a:0 }
      : { type:'mcq', q:`Fill in the blank: ${w.example.replace(new RegExp(w.word, 'i'), '____')}`, o:[w.word, ...take(all.filter(x => x.word !== w.word), 3).map(x => x.word)], a:0 }));
    return { title:cat ? `${cat.title} words` : 'Vocabulary Quiz', emoji:cat ? cat.emoji : '📖', theme:'phonics', color:cat ? cat.color : '#00796B', kid:false, finishTitle:'Vocabulary Complete!', questions:qs.map(q => shuffleQ(q)) };
  }
  if (p.mode === 'rhyme') {
    const r = RHYMES.find(x => x.id === p.id), others = RHYMES.flatMap(x => x.blank);
    const qs = r.lines.map((line, i) => { const w = r.blank[i], re = new RegExp(w, 'i'); return kidQ({ type:'fill', q:line.replace(re, '____'), say:line, o:[w, ...take(others.filter(x => x.toLowerCase() !== w.toLowerCase()), 3)], a:0 }); });
    return { title:r.title, emoji:r.emoji, theme:'games', color:'#C2185B', kid:true, finishTitle:'Rhyme Complete!', questions:qs.map(q => shuffleQ(q)) };
  }
  return { title:'Quiz', emoji:'🧠', theme:'home', color:'#2463EB', questions:[] };
}
