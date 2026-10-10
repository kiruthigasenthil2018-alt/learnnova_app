// Public curriculum API used by all screens: subjects, per-grade lessons and quizzes.
import { P, shuffle, rng } from './questionUtils';
import { MATH_TOPICS, mathQuestion } from './mathData';
import { ENGLISH, SCIENCE, SOCIAL } from './contentData';

export const SUBJECTS = [
  { id:'english', title:'English', emoji:'📘', color:'#2463EB', theme:'phonics', sub:'Grammar, words and reading' },
  { id:'math', title:'Mathematics', emoji:'🔢', color:'#7C4DFF', theme:'math', sub:'Numbers, shapes and problems' },
  { id:'science', title:'Science / EVS', emoji:'🔬', color:'#00796B', theme:'science', sub:'Plants, animals and our world' },
  { id:'social', title:'Social Science', emoji:'🌍', color:'#B85C00', theme:'home', sub:'My country, maps and people' },
];
export const subjectOf = (id) => SUBJECTS.find(s => s.id === id);
export const lessonId = (subject, grade, n) => `${subject}-g${grade}-${n}`;
const CONTENT = { english:ENGLISH, science:SCIENCE, social:SOCIAL };

const bandOf = (g) => (g <= 2 ? 'lo' : g === 3 ? 'mid' : 'hi');
const pickQs = (qs, g) => (g === 1 || g === 4 ? qs.slice(0, 3) : g === 2 || g === 5 ? qs.slice(1, 4) : qs.slice(0, 3));

const cache = {};
export function getLessons(subject, grade) {
  grade = Math.round(+grade); if (!(grade >= 1 && grade <= 5)) grade = 3;
  const key = `${subject}-${grade}`;
  if (cache[key]) return cache[key];
  let list;
  if (subject === 'math') {
    list = MATH_TOPICS.map((t, i) => {
      const seed = grade * 1000 + i * 17;
      const ex = [0, 1].map(k => { const q = mathQuestion(t.key, grade, seed + 900 + k); return { text:(q.pic ? q.pic + '  ' : '') + q.q, answer:q.o[q.a] }; });
      return { id:lessonId(subject, grade, i + 1), n:i + 1, title:t.title, emoji:t.emoji, intro:t.intro[grade - 1], examples:ex.map(e => `${e.text}  →  ${e.answer}`), flow:null, qs:[0, 1, 2, 3].map(k => mathQuestion(t.key, grade, seed + k)).slice(0, 3), topic:t.key };
    });
  } else {
    const b = bandOf(grade), bi = ['lo', 'mid', 'hi'].indexOf(b);
    list = CONTENT[subject].map((L, i) => ({
      id:lessonId(subject, grade, i + 1), n:i + 1, title:L.title, emoji:L.emoji, intro:L.intro[bi], examples:L.ex[bi].split('  •  '), flow:L.flow,
      qs:pickQs(L.qs[b], grade).map(P),
    }));
  }
  return (cache[key] = list);
}

// Ten-question subject quiz. Maths is freshly generated each time; other subjects sample the grade's questions.
export function getSubjectQuiz(subject, grade, n = 10) {
  grade = Math.round(+grade); if (!(grade >= 1 && grade <= 5)) grade = 3;
  if (subject === 'math') {
    const R = rng();
    return Array.from({ length:n }, (_, i) => mathQuestion(MATH_TOPICS[i % MATH_TOPICS.length].key, grade, Math.floor(R.f() * 1e9)));
  }
  const pool = getLessons(subject, grade).flatMap(l => l.qs);
  return shuffle(pool).slice(0, n);
}
export const lessonProgress = (lessons, gradeLessonsDone) => lessons.filter(l => l.id in gradeLessonsDone).length;
