import React, { useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, useStore } from '../theme';
import { Page, Grid, LearnNovaHeader, Btn, FadeIn, CelebrationAnimation } from '../components';
import { ANIMALS, FRUITS, TRANSPORT } from '../data/nurseryData';
import { shuffle } from '../data/questionUtils';

const SETS = { Animals:ANIMALS, Fruits:FRUITS, Vehicles:TRANSPORT };
const deckOf = (set) => shuffle([...shuffle(SETS[set]).slice(0, 6)].flatMap(it => [it, it])).map((it, id) => ({ id, key:it.name, e:it.emoji, open:false, done:false }));

export default function MemoryScreen() {
  const { award } = useStore();
  const [set, setSet] = useState('Animals'), [deck, setDeck] = useState(() => deckOf('Animals')), [first, setFirst] = useState(null), [moves, setMoves] = useState(0), [lock, setLock] = useState(false), [paid, setPaid] = useState(false);
  const won = deck.every(c => c.done);
  const fresh = (s = set) => { setSet(s); setDeck(deckOf(s)); setFirst(null); setMoves(0); setLock(false); setPaid(false); };
  const flip = (i) => {
    if (lock || deck[i].open || deck[i].done) return;
    const d = deck.map((c, j) => (j === i ? { ...c, open:true } : c)); setDeck(d);
    if (first === null) return setFirst(i);
    setMoves(m => m + 1);
    if (d[first].key === d[i].key) {
      const d2 = d.map((c, j) => (j === i || j === first ? { ...c, done:true } : c)); setDeck(d2); setFirst(null);
      if (d2.every(c => c.done) && !paid) { setPaid(true); award({ xp:10, game:true, counts:{ memory:1 } }); }
    } else { setLock(true); setTimeout(() => { setDeck(x => x.map((c, j) => (j === i || j === first ? { ...c, open:false } : c))); setFirst(null); setLock(false); }, 800); }
  };
  return (
    <Page theme="games" max={640}>
      <LearnNovaHeader title="Memory Game 🃏" sub={`Moves: ${moves}  •  Find all 6 pairs`} emoji="🧠" color="#6A1B9A" />
      <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
        {Object.keys(SETS).map(k => <Pressable key={k} onPress={() => fresh(k)} accessibilityRole="button" style={{ paddingVertical:10, paddingHorizontal:16, borderRadius:20, backgroundColor:set === k ? C.blue : C.card, borderWidth:2, borderColor:C.line, minHeight:44, justifyContent:'center' }}><Text style={{ fontFamily:F.bold, color:set === k ? '#fff' : C.text }}>{k}</Text></Pressable>)}
      </View>
      <Grid min={84} max={4} gap={10} data={deck} renderItem={(c, i) => (
        <Pressable onPress={() => flip(i)} accessibilityRole="button" accessibilityLabel={c.open || c.done ? c.key : 'Hidden card'}
          style={{ aspectRatio:1, borderRadius:20, alignItems:'center', justifyContent:'center', backgroundColor:c.done ? C.mint : c.open ? C.sky : '#7C4DFF', borderWidth:3, borderColor:c.done ? C.green : c.open ? C.blue : '#5E35B1' }}>
          <Text style={{ fontSize:c.open || c.done ? 44 : 34 }}>{c.open || c.done ? c.e : '❓'}</Text>
        </Pressable>)} />
      {won && <FadeIn><View><CelebrationAnimation big /><Text style={{ fontFamily:F.bold, fontSize:24, color:C.green, textAlign:'center' }}>🎉 You did it in {moves} moves! ⭐ +10 XP</Text></View></FadeIn>}
      <Btn title="New game" outline color={C.blue} onPress={() => fresh()} />
    </Page>
  );
}
