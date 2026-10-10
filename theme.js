import { createContext, useContext } from 'react';

// ---------- LearnNova design tokens ----------
// ---------- Theme system (light / dark + colour palettes) ----------
// C is a live object: applyTheme() rewrites its values, and the app re-renders when settings change.
const BASE = { white:'#FFFFFF', red:'#C92020', green:'#43A047', gold:'#F9A825', purple:'#7C4DFF', pink:'#EC6A8E', teal:'#00796B' };
const MODES = {
  light:{ bg:'#F5F9FF', card:'#FFFFFF', text:'#14213D', grey:'#566485', line:'#D5DEF0', sky:'#E8F0FF', mint:'#E8F5E9', rose:'#FDECEC', cream:'#FFF8E1', okText:'#2E7D32', dark:'#001A4D' },
  dark:{ bg:'#0F1A33', card:'#1B2A4A', text:'#F1F5FF', grey:'#A9B6D3', line:'#34476F', sky:'#22365F', mint:'#1E3B2C', rose:'#45262D', cream:'#3B3320', okText:'#7BE08A', dark:'#0A1226' },
};
export const PALETTES = {
  ocean:{ name:'Ocean Blue', emoji:'🌊', blue:'#2463EB', blueDk:'#6A9BFF', deep:'#0B2A7A', dark:'#001A4D' },
  grape:{ name:'Grape Purple', emoji:'🍇', blue:'#7C4DFF', blueDk:'#A58BFF', deep:'#4527A0', dark:'#2A0F5E' },
  sunny:{ name:'Sunny Orange', emoji:'🍊', blue:'#D84315', blueDk:'#FF8A50', deep:'#BF360C', dark:'#4A1B00' },
  forest:{ name:'Forest Green', emoji:'🌳', blue:'#2E7D32', blueDk:'#66BB6A', deep:'#1B5E20', dark:'#0B3318' },
  candy:{ name:'Candy Pink', emoji:'🍬', blue:'#D81B60', blueDk:'#F06292', deep:'#AD1457', dark:'#4A0A26' },
};
export const C = { ...BASE, ...MODES.light, ...PALETTES.ocean, mode:'light', __v:0 };
let applied = '';
export function applyTheme({ mode = 'light', palette = 'ocean' } = {}) {
  const key = mode + palette; if (key === applied) return; applied = key;
  const p = PALETTES[palette] || PALETTES.ocean, m = MODES[mode] || MODES.light;
  Object.assign(C, BASE, m, { blue:mode === 'dark' ? p.blueDk : p.blue, deep:p.deep, dark:mode === 'dark' ? m.dark : p.dark, mode });
  C.__v += 1;
}
// Module-level StyleSheets use this so colours follow the theme.
export const lazyStyles = (factory) => { let cache, v = -1; return new Proxy({}, { get:(_, k) => { if (v !== C.__v) { cache = factory(); v = C.__v; } return cache[k]; } }); };
export const DEFAULT_SETTINGS = { mode:'light', palette:'ocean', sound:true, backgrounds:true, showGames:true, showDictionary:true, showAI:true, reminder:{ on:false, hour:17, minute:0, last:'', mode:'daily', dates:[] } };
export const F = { reg:'Inter_400Regular', semi:'Inter_600SemiBold', bold:'Inter_700Bold' };
export const APP = { name:'LearnNova', tag:'Learn • Play • Explore • Grow 🌟', short:'Learn • Play • Grow' };
export const R = { card:20, btn:16, pill:30 };           // corner radii
export const SHADOW = { shadowColor:'#1B3A8A', shadowOpacity:0.1, shadowRadius:10, shadowOffset:{ width:0, height:4 }, elevation:3 };
export const AVATARS = [['🦁','#FBC02D'],['🐰','#EC6A8E'],['🦊','#F57C00'],['🐢','#43A047'],['🐼','#607D8B'],['🐙','#8E24AA'],['🦄','#AB47BC'],['🐘','#26A69A'],['🐯','#FF8F00'],['🦀','#E53935'],['🐸','#7CB342'],['🦉','#8D6E63'],['🐨','#78909C'],['🐵','#A1887F'],['🐬','#29B6F6'],['🦒','#FFB300']];
export const GOALS = [[20, 'Casual', '20 XP / day'], [50, 'Regular', '50 XP / day'], [100, 'Serious', '100 XP / day']];

// Learner levels shown in "Who is learning today?"
export const LEVELS = [
  { id:'nursery', emoji:'🧸', title:'Nursery / LKG', sub:'Ages 2–5', color:'#EC6A8E' },
  { id:'g1', emoji:'📚', title:'Grade 1', sub:'Ages 6–7', color:'#2463EB' },
  { id:'g2', emoji:'📚', title:'Grade 2', sub:'Ages 7–8', color:'#00796B' },
  { id:'g3', emoji:'📚', title:'Grade 3', sub:'Ages 8–9', color:'#7C4DFF' },
  { id:'g4', emoji:'📚', title:'Grade 4', sub:'Ages 9–10', color:'#B85C00' },
  { id:'g5', emoji:'📚', title:'Grade 5', sub:'Ages 10–11', color:'#C2185B' },
];
export const isNursery = (level) => level === 'nursery';
export const gradeOf = (level) => { if (level === 'nursery') return null; const n = +String(level || '').replace(/\D/g, ''); return n >= 1 && n <= 5 ? n : 3; };   // always 1–5 (3 if unknown)
export const levelTitle = (level) => (LEVELS.find(l => l.id === level) || LEVELS[3]).title;

export const Store = createContext(null);
export const useStore = () => useContext(Store);
