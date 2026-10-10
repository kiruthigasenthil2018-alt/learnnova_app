import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { C, F, useStore, lazyStyles } from '../theme';
import { Btn, FadeIn, CartoonBackground } from '../components';
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = rnd(0, i); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const opts = (ans) => { const s = new Set([ans]); let guard = 0; while (s.size < 4 && guard++ < 50) { const d = ans + rnd(-6, 6); if (d > 0) s.add(d); } return shuffle([...s]); };

function Choices({ options, onPick, picked, answer }) {
  return (
    <View style={s.grid}>{options.map(o => {
      const right = picked != null && o === answer, wrong = picked === o && o !== answer;
      return (<TouchableOpacity key={o} disabled={picked != null} onPress={() => onPick(o)} style={[s.choice, right && { backgroundColor:'#E8F5E9', borderColor:C.green }, wrong && { backgroundColor:'#FDECEC', borderColor:C.red }]} accessibilityRole="button"><Text style={s.chT}>{o}</Text></TouchableOpacity>);
    })}</View>
  );
}

function MathSprint({ addXp }) {
  const make = () => { const a = rnd(2, 12), b = rnd(2, 12), mul = Math.random() < 0.5, ans = mul ? a * b : a + b; return { t:`${a} ${mul ? '×' : '+'} ${b}`, ans, o:opts(ans) }; };
  const [st, setSt] = useState('idle'), [time, setTime] = useState(30), [score, setScore] = useState(0), [q, setQ] = useState(make);
  useEffect(() => {
    if (st !== 'play') return;
    if (time <= 0) { setSt('over'); addXp(score * 2); return; }
    const t = setTimeout(() => setTime(x => x - 1), 1000); return () => clearTimeout(t);
  }, [st, time]);
  const start = () => { setScore(0); setTime(30); setQ(make()); setSt('play'); };
  const pick = (o) => { if (o === q.ans) setScore(x => x + 1); setQ(make()); };
  return (
    <View style={s.card}>
      <Text style={s.h}>⚡ Math Sprint</Text><Text style={s.sub}>Solve as many as you can in 30 seconds.</Text>
      {st === 'play' ? (<><Text style={s.meta}>⏱ {time}s    ✅ {score}</Text><Text style={s.big}>{q.t} = ?</Text><Choices key={q.t + score + time} options={q.o} onPick={pick} /></>)
        : (<>{st === 'over' && <Text style={s.big}>Score: {score} · +{score * 2} XP</Text>}<Btn title={st === 'over' ? 'Play again' : 'Start'} color={C.green} onPress={start} /></>)}
    </View>
  );
}

function Pattern({ addXp }) {
  const make = () => {
    const k = rnd(0, 2);
    if (k === 0) { const s0 = rnd(1, 9), d = rnd(2, 9); return { seq:[0, 1, 2, 3].map(i => s0 + d * i), ans:s0 + 4 * d }; }
    if (k === 1) { const s0 = rnd(1, 4), r = rnd(2, 3); return { seq:[0, 1, 2, 3].map(i => s0 * r ** i), ans:s0 * r ** 4 }; }
    const n = rnd(1, 6); return { seq:[0, 1, 2, 3].map(i => (n + i) ** 2), ans:(n + 4) ** 2 };
  };
  const [p, setP] = useState(make), [picked, setPicked] = useState(null), [streak, setStreak] = useState(0);
  const o = React.useMemo(() => opts(p.ans), [p]);
  const pick = (v) => {
    setPicked(v);
    if (v === p.ans) { setStreak(x => x + 1); addXp(3); } else setStreak(0);
    setTimeout(() => { setP(make()); setPicked(null); }, 900);
  };
  return (
    <View style={s.card}>
      <Text style={s.h}>🧩 Pattern Puzzle</Text><Text style={s.sub}>Find the next number. +3 XP for each correct answer.</Text>
      <Text style={s.meta}>🔥 Streak: {streak}</Text><Text style={s.big}>{p.seq.join(', ')}, ?</Text>
      <Choices options={o} picked={picked} answer={p.ans} onPick={pick} />
    </View>
  );
}

const EMOJI = ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐵', '🐰'];
function Memory({ addXp }) {
  const deckNew = () => shuffle([...EMOJI, ...EMOJI]).map((e, i) => ({ id:i, e, open:false, done:false }));
  const [deck, setDeck] = useState(deckNew), [first, setFirst] = useState(null), [moves, setMoves] = useState(0), [lock, setLock] = useState(false);
  const won = deck.every(c => c.done);
  const flip = (i) => {
    if (lock || deck[i].open || deck[i].done) return;
    const d = deck.map((c, j) => j === i ? { ...c, open:true } : c); setDeck(d);
    if (first === null) return setFirst(i);
    setMoves(m => m + 1);
    if (d[first].e === d[i].e) {
      const d2 = d.map((c, j) => (j === i || j === first) ? { ...c, done:true } : c); setDeck(d2); setFirst(null);
      if (d2.every(c => c.done)) addXp(20);
    } else {
      setLock(true);
      setTimeout(() => { setDeck(x => x.map((c, j) => (j === i || j === first) ? { ...c, open:false } : c)); setFirst(null); setLock(false); }, 700);
    }
  };
  return (
    <View style={s.card}>
      <Text style={s.h}>🃏 Memory Match</Text><Text style={s.sub}>Find all 8 pairs. Finish for +20 XP.</Text><Text style={s.meta}>Moves: {moves}</Text>
      <View style={s.mem}>{deck.map((c, i) => (
        <TouchableOpacity key={c.id} onPress={() => flip(i)} style={[s.tile, (c.open || c.done) && { backgroundColor:c.done ? '#E8F5E9' : '#E8F0FF' }]} accessibilityLabel={c.open || c.done ? c.e : 'Hidden card'}>
          <Text style={{ fontSize:30 }}>{c.open || c.done ? c.e : '❓'}</Text></TouchableOpacity>))}</View>
      {won && <FadeIn><Text style={[s.big, { color:C.green }]}>🎉 You won in {moves} moves!</Text></FadeIn>}
      <Btn title="New game" outline color={C.blue} onPress={() => { setDeck(deckNew()); setFirst(null); setMoves(0); setLock(false); }} />
    </View>
  );
}

export default function PracticeScreen() {
  const { addXp } = useStore();
  const [g, setG] = useState('math');
  return (
    <View style={{ flex:1 }}><CartoonBackground theme="games" /><ScrollView style={{ flex:1 }} contentContainerStyle={{ padding:16, alignItems:'center', paddingBottom:40 }}>
      <View style={{ width:'100%', maxWidth:560 }}>
        <View style={s.seg}>{[['math', '⚡ Sprint'], ['pat', '🧩 Pattern'], ['mem', '🃏 Memory']].map(([k, l]) => (
          <TouchableOpacity key={k} onPress={() => setG(k)} style={[s.tab, g === k && { backgroundColor:C.blue }]}><Text style={[s.tabT, g === k && { color:'#fff' }]}>{l}</Text></TouchableOpacity>))}</View>
        {g === 'math' ? <MathSprint addXp={addXp} /> : g === 'pat' ? <Pattern addXp={addXp} /> : <Memory addXp={addXp} />}
      </View>
    </ScrollView></View>
  );
}
const s = lazyStyles(() => StyleSheet.create({
  seg:{ flexDirection:'row', backgroundColor:'#E4ECFB', borderRadius:14, padding:4, marginBottom:14 }, tab:{ flex:1, padding:10, borderRadius:11, alignItems:'center' }, tabT:{ fontFamily:F.bold, color:C.text, fontSize:13 },
  card:{ backgroundColor:C.card, borderRadius:20, padding:18, gap:10 }, h:{ fontFamily:F.bold, fontSize:22, color:C.text }, sub:{ fontFamily:F.reg, color:C.grey }, meta:{ fontFamily:F.bold, color:C.blue },
  big:{ fontFamily:F.bold, fontSize:28, color:C.text, textAlign:'center', marginVertical:8, flexShrink:1 },
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:10 }, choice:{ flexBasis:'47%', flexGrow:1, borderWidth:2, borderBottomWidth:4, borderColor:C.line, borderRadius:14, padding:16, alignItems:'center' }, chT:{ fontFamily:F.bold, fontSize:20, color:C.text },
  mem:{ flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', rowGap:8 }, tile:{ width:'23%', aspectRatio:1, borderRadius:12, backgroundColor:C.bg, borderWidth:2, borderColor:C.line, alignItems:'center', justifyContent:'center' },
}));
