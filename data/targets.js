// Daily targets. `counts` (stored per day) holds keys like 'lesson:english', 'q:math', 'letter', 'colors'.
import { isNursery } from '../theme';

export const GRADE_TARGETS = [
  { id:'english', label:'English', emoji:'📘', items:[['lesson:english', 1, '1 lesson'], ['q:english', 5, '5 questions']] },
  { id:'math', label:'Math', emoji:'🔢', items:[['q:math', 10, '10 problems']] },
  { id:'science', label:'Science', emoji:'🔬', items:[['lesson:science', 1, '1 lesson']] },
  { id:'social', label:'Social Science', emoji:'🌍', items:[['q:social', 5, '5 questions']] },
];
export const NURSERY_TARGETS = [
  { id:'letters', label:'Learn 3 letters', emoji:'🔤', items:[['letter', 3, '3 letters']] },
  { id:'numbers', label:'Practice numbers', emoji:'🔢', items:[['numbers', 1, '1 number game']] },
  { id:'colors', label:'Complete 1 color game', emoji:'🎨', items:[['colors', 1, '1 color game']] },
  { id:'phonicsGame', label:'Complete 1 phonics game', emoji:'🎮', items:[['phonicsGame', 1, '1 phonics game']] },
];

export function dailyProgress(counts = {}, level) {
  const groups = (isNursery(level) ? NURSERY_TARGETS : GRADE_TARGETS).map(g => ({
    ...g, items:g.items.map(([k, need, label]) => ({ key:k, need, label, have:Math.min(counts[k] || 0, need), done:(counts[k] || 0) >= need })),
  }));
  const all = groups.flatMap(g => g.items), pct = all.length ? all.filter(i => i.done).length / all.length : 0;
  // partial credit makes the bar move smoothly
  const smooth = all.length ? all.reduce((a, i) => a + i.have / i.need, 0) / all.length : 0;
  return { groups, pct:smooth, complete:pct >= 1 };
}
