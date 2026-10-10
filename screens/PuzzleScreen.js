import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, useStore } from '../theme';
import { Page, LearnNovaHeader, Btn, FadeIn, CelebrationAnimation, ShakeView, AudioButton } from '../components';
import { PUZZLE_WORDS } from '../data/nurseryData';
import { shuffle } from '../data/questionUtils';

// Build the word: tap the letters in the right order
export default function PuzzleScreen() {
  const { award } = useStore();
  const [n, setN] = useState(() => Math.floor(Math.random() * PUZZLE_WORDS.length)), [picked, setPicked] = useState([]), [wrong, setWrong] = useState(0), [solved, setSolved] = useState(0), [done, setDone] = useState(false);
  const [pic, word] = PUZZLE_WORDS[n];
  const tiles = useMemo(() => shuffle(word.split('').map((ch, id) => ({ id, ch }))), [n]);
  const tap = (t) => {
    if (done || picked.includes(t.id)) return;
    const p = [...picked, t.id]; setPicked(p);
    if (p.length === word.length) {
      if (p.map(id => tiles.find(x => x.id === id).ch).join('') === word) { setDone(true); setSolved(s => s + 1); award({ xp:5, game:true, counts:{ puzzle:1 } }); }
      else { setWrong(w => w + 1); setTimeout(() => setPicked([]), 700); }
    }
  };
  const next = () => { setN((n + 1) % PUZZLE_WORDS.length); setPicked([]); setDone(false); };
  const letters = picked.map(id => tiles.find(x => x.id === id).ch);
  return (
    <Page theme="games" max={600}>
      <LearnNovaHeader title="Word Puzzle 🧩" sub={`Solved today: ${solved}  •  +5 XP each`} emoji="🔤" color="#D81B60" />
      <View style={{ alignItems:'center', gap:14, backgroundColor:C.card, borderRadius:24, padding:20 }}>
        <Text style={{ fontSize:96 }} accessibilityLabel="Picture to spell">{pic}</Text>
        <AudioButton say={word.toLowerCase()} label="Hear the word" note={word} />
        <ShakeView trigger={wrong} style={{ flexDirection:'row', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
          {word.split('').map((_, i) => <View key={i} style={{ width:56, height:64, borderRadius:14, borderWidth:3, borderColor:done ? C.green : C.line, borderStyle:'dashed', backgroundColor:done ? C.mint : C.bg, alignItems:'center', justifyContent:'center' }}><Text style={{ fontFamily:F.bold, fontSize:34, color:C.text }}>{letters[i] || ''}</Text></View>)}
        </ShakeView>
        <View style={{ flexDirection:'row', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
          {tiles.map(t => <Pressable key={t.id} onPress={() => tap(t)} disabled={picked.includes(t.id)} accessibilityRole="button" accessibilityLabel={`Letter ${t.ch}`} style={{ width:60, height:64, borderRadius:16, backgroundColor:picked.includes(t.id) ? C.line : C.blue, alignItems:'center', justifyContent:'center', borderBottomWidth:5, borderBottomColor:'rgba(0,0,0,0.2)' }}><Text style={{ fontFamily:F.bold, fontSize:32, color:'#fff' }}>{t.ch}</Text></Pressable>)}
        </View>
        {wrong > 0 && !done && picked.length === word.length ? <Text style={{ fontFamily:F.semi, color:C.red }}>💡 Try Again! Let's listen and look at the picture.</Text> : null}
        {done && <FadeIn><View style={{ alignItems:'center', gap:8 }}><CelebrationAnimation /><Text style={{ fontFamily:F.bold, fontSize:22, color:C.green }}>🎉 Great Job! {word}</Text></View></FadeIn>}
      </View>
      <View style={{ flexDirection:'row', gap:10 }}>
        <View style={{ flex:1 }}><Btn title="Clear" outline color={C.grey} onPress={() => setPicked([])} /></View>
        <View style={{ flex:1 }}><Btn title={done ? 'Next puzzle ▶' : 'Skip ▶'} color={done ? C.green : C.blue} onPress={next} /></View>
      </View>
    </Page>
  );
}
