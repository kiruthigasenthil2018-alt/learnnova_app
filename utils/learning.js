import { SUBJECTS, getLessons } from '../data/curriculum';
import { PHONICS } from '../data/phonicsData';

export const gradeProgress = (data, subject, grade) => {
  const ls = getLessons(subject, grade), done = ls.filter(l => l.id in data.lessons).length;
  return { done, total:ls.length, pct:ls.length ? done / ls.length : 0, lessons:ls };
};
export const overallPct = (data, grade) => SUBJECTS.reduce((a, s) => a + gradeProgress(data, s.id, grade).pct, 0) / SUBJECTS.length;

// Next lesson for "Continue Learning": follow the most recent subject, else the first unfinished one.
export function continueFor(data, grade) {
  const order = [...SUBJECTS].sort((a, b) => (b.id === data.recent?.subject) - (a.id === data.recent?.subject));
  for (const s of order) {
    const ls = getLessons(s.id, grade), idx = ls.findIndex(l => !(l.id in data.lessons));
    if (idx >= 0) return { subject:s, idx, lesson:ls[idx], ...gradeProgress(data, s.id, grade) };
  }
  return null;
}
export const nextLetter = (data) => PHONICS.find(p => !data.letters.includes(p.letter)) || PHONICS[0];
export const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'; };
