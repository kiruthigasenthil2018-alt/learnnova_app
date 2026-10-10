// All learner progress lives here: XP, streak, daily targets, lessons, achievements.
// App.js calls this once and shares the result through <Store.Provider>.
import { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS } from '../data/achievementData';
import { dailyProgress } from '../data/targets';
import { DEFAULT_SETTINGS, LEVELS } from '../theme';
import { setSoundEnabled } from '../services/audioService';

const dayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const today = () => dayStr(new Date());
export const yesterday = () => dayStr(new Date(Date.now() - 864e5));

export const blank = () => ({ learner:null, xp:0, streak:0, bestStreak:0, lastDay:null, day:today(), xpToday:0, counts:{}, week:{}, lessons:{}, quizzes:0, perfect:0, games:0, letters:[], badges:[], learned:[], recent:null });
const LEGACY = { little:'nursery', kid:'g2', teen:'g5', adult:'g5' };
const roll = (d) => (d.day === today() ? d : { ...d, day:today(), xpToday:0, counts:{}, streak:d.lastDay === yesterday() ? d.streak : 0 });
export const normalize = (raw) => {
  const d = roll({ ...blank(), ...(raw || {}) });
  if (d.learner && !d.learner.level) d.learner = { ...d.learner, level:LEGACY[d.learner.age] || 'g3' };   // data saved by the old Learnova app
  if (d.learner && !LEVELS.some(l => l.id === d.learner.level)) d.learner = { ...d.learner, level:'g3' };   // repair unknown levels
  if (!Array.isArray(d.badges)) d.badges = [];
  return d;
};
export const statsOf = (d) => {
  const ids = Object.keys(d.lessons), by = (s) => ids.filter(i => i.startsWith(s + '-')).length;
  return { lessons:ids.length, quizzes:d.quizzes, perfect:d.perfect, best:d.bestStreak, letters:d.letters.length, games:d.games, english:by('english'), math:by('math'), science:by('science'), social:by('social'), xp:d.xp };
};

export default function useProgress() {
  const [user, setUser] = useState(null), [profiles, setProfiles] = useState([]), [activeId, setActiveId] = useState(null);
  const [data, setData] = useState(null), [settings, setSettingsState] = useState(DEFAULT_SETTINGS), [ready, setReady] = useState(false);
  const ref = useRef(null), activeRef = useRef(null), userRef = useRef(null);
  const commit = (d) => { ref.current = d; setData(d); };
  const save = (k, v) => AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => {});

  // ---- account loading (profiles + migration of data saved by older versions) ----
  const loadAccount = async (u) => {
    userRef.current = u;
    let list = JSON.parse((await AsyncStorage.getItem(`profiles:${u.email}`)) || '[]');
    if (!list.length) {
      const legacy = await AsyncStorage.getItem(`data:${u.email}`);
      if (legacy) { const d = normalize(JSON.parse(legacy)); if (d.learner) { list = [{ id:'p1', ...d.learner }]; await save(`pdata:${u.email}:p1`, d); await save(`profiles:${u.email}`, list); } }
    }
    setProfiles(list); setUser(u);
    const last = await AsyncStorage.getItem(`active:${u.email}`);
    const id = list.find(p => p.id === last) ? last : list.length === 1 ? list[0].id : null;
    await openProfile(u, id);
  };
  const openProfile = async (u, id) => {
    if (!id) { activeRef.current = null; ref.current = null; setActiveId(null); setData(null); return; }
    const raw = await AsyncStorage.getItem(`pdata:${u.email}:${id}`);
    const d = normalize(raw ? JSON.parse(raw) : null);
    if (!d.learner) {                                   // progress file missing/old: rebuild the learner card from the profile list
      const list = JSON.parse((await AsyncStorage.getItem(`profiles:${u.email}`)) || '[]'), pr = list.find(p => p.id === id);
      if (pr) { const { id:_id, ...L } = pr; d.learner = L; }
    }
    if (!d.learner) return openProfile(u, null);        // nothing to open → show the profile picker
    activeRef.current = id; commit(d); setActiveId(id);
    AsyncStorage.setItem(`active:${u.email}`, id).catch(() => {});
  };

  useEffect(() => { (async () => {
    try {
      const st = await AsyncStorage.getItem('settings'); if (st) setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(st), reminder:{ ...DEFAULT_SETTINGS.reminder, ...(JSON.parse(st).reminder || {}) } });
      const sess = await AsyncStorage.getItem('session'); if (sess) await loadAccount(JSON.parse(sess));
    } catch (e) { if (__DEV__) console.log('[storage]', e); }
    setTimeout(() => setReady(true), 1900);
  })(); }, []);
  useEffect(() => { setSoundEnabled(settings.sound !== false); }, [settings.sound]);

  // save progress + keep the profile list in sync with the learner card
  useEffect(() => {
    const u = userRef.current; if (!u || !data || !activeRef.current) return;
    AsyncStorage.setItem(`pdata:${u.email}:${activeRef.current}`, JSON.stringify(data)).catch(() => {});
    const L = data.learner; if (!L) return;
    setProfiles(list => { const cur = list.find(p => p.id === activeRef.current); if (cur && cur.name === L.name && cur.avatar === L.avatar && cur.level === L.level && cur.age === L.age) return list; const nl = list.map(p => (p.id === activeRef.current ? { ...p, ...L } : p)); save(`profiles:${u.email}`, nl); return nl; });
  }, [data]);

  const patch = (fn) => { if (ref.current) commit(fn(roll(ref.current))); };

  // award(): the single entry point every finished activity calls.
  const award = ({ xp = 0, counts = {}, lessonId, pct, quiz, perfect, letter, game, recent } = {}) => {
    if (!ref.current) return { newBadges:[], streak:0 };
    let d = roll(ref.current); d = { ...d, xp:d.xp + xp, xpToday:d.xpToday + xp, counts:{ ...d.counts } };
    Object.entries(counts).forEach(([k, v]) => { d.counts[k] = (d.counts[k] || 0) + v; });
    if (d.lastDay !== today()) { d.streak = d.lastDay === yesterday() ? d.streak + 1 : 1; d.lastDay = today(); }
    d.bestStreak = Math.max(d.bestStreak, d.streak);
    if (lessonId) d.lessons = { ...d.lessons, [lessonId]:Math.max(d.lessons[lessonId] || 0, pct == null ? 100 : pct) };
    if (quiz) d.quizzes += 1;
    if (perfect) d.perfect += 1;
    if (game) d.games += 1;
    if (letter && !d.letters.includes(letter)) d.letters = [...d.letters, letter];
    if (recent) d.recent = recent;
    d.week = { ...d.week, [today()]:d.week[today()] || 'active' };
    if (dailyProgress(d.counts, d.learner && d.learner.level).complete) d.week[today()] = 'full';
    const have = statsOf(d), unlocked = ACHIEVEMENTS.filter(a => a.test(have)).map(a => a.id);
    const fresh = unlocked.filter(id => !d.badges.includes(id));
    d.badges = [...new Set([...d.badges, ...unlocked])];
    commit(d);
    return { newBadges:fresh.map(id => ACHIEVEMENTS.find(a => a.id === id)), streak:d.streak, xp, total:d.xp };
  };

  const store = useMemo(() => ({
    user, profiles, activeId, data, settings, level:data ? Math.floor(data.xp / 100) + 1 : 1,
    signIn:async (u) => { await AsyncStorage.setItem('session', JSON.stringify(u)); await loadAccount(u); },
    signOut:async () => { await AsyncStorage.removeItem('session'); userRef.current = null; activeRef.current = null; ref.current = null; setData(null); setProfiles([]); setActiveId(null); setUser(null); },
    createLearner:async (learner) => {                       // add a child profile and open it
      const u = userRef.current, id = `p${Date.now()}`, list = [...profiles, { id, ...learner }];
      setProfiles(list); save(`profiles:${u.email}`, list);
      activeRef.current = id; commit({ ...blank(), learner }); setActiveId(id); AsyncStorage.setItem(`active:${u.email}`, id).catch(() => {});
    },
    selectProfile:(id) => openProfile(userRef.current, id),
    switchProfile:() => openProfile(userRef.current, null),
    deleteProfile:async (id) => {
      const u = userRef.current, list = profiles.filter(p => p.id !== id);
      setProfiles(list); save(`profiles:${u.email}`, list); AsyncStorage.removeItem(`pdata:${u.email}:${id}`).catch(() => {});
      if (activeId === id) await openProfile(u, null);
    },
    updateLearner:(p) => patch(d => ({ ...d, learner:{ ...d.learner, ...p } })),
    setSettings:(p) => setSettingsState(s => { const n = { ...s, ...p }; save('settings', n); return n; }),
    award,
    addXp:(n) => award({ xp:n }),
    learnBite:(t) => { if (ref.current && !ref.current.learned.includes(t)) { patch(d => ({ ...d, learned:[...d.learned, t] })); award({ xp:5 }); } },
    resetProgress:() => patch(d => ({ ...blank(), learner:d.learner })),
  }), [user, profiles, activeId, data, settings]);
  return { store, ready, user, data, profiles, settings };
}
