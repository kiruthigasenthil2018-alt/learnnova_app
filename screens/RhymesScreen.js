import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, SHADOW } from '../theme';
import { Page, LearnNovaHeader, Btn, Card } from '../components';
import { RHYMES } from '../data/nurseryData';
import { speak, stopSpeaking } from '../services/audioService';

export default function RhymesScreen({ navigation }) {
  const [rid, setRid] = useState(RHYMES[0].id), [line, setLine] = useState(-1), [playing, setPlaying] = useState(false), timers = useRef([]);
  const rhyme = RHYMES.find(r => r.id === rid);
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; stopSpeaking(); setPlaying(false); setLine(-1); };
  useEffect(() => clear, []);
  const sing = () => {
    clear(); setPlaying(true);
    rhyme.lines.forEach((l, i) => timers.current.push(setTimeout(() => { setLine(i); speak(l, { rate:0.75, pitch:1.3 }); }, i * 3000)));
    timers.current.push(setTimeout(() => { setPlaying(false); setLine(-1); }, rhyme.lines.length * 3000));
  };
  return (
    <Page theme="games" max={640}>
      <LearnNovaHeader title="Nursery Rhymes 🎵" sub="Tap a line, or sing along!" emoji={rhyme.emoji} color="#C2185B" />
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
        {RHYMES.map(r => <Pressable key={r.id} onPress={() => { clear(); setRid(r.id); }} accessibilityRole="button" style={{ paddingVertical:10, paddingHorizontal:14, borderRadius:20, backgroundColor:rid === r.id ? '#C2185B' : C.card, borderWidth:2, borderColor:C.line, minHeight:44, justifyContent:'center' }}><Text style={{ fontFamily:F.bold, color:rid === r.id ? '#fff' : C.text }}>{r.emoji} {r.title}</Text></Pressable>)}
      </View>
      <Card style={{ gap:8 }}>
        {rhyme.lines.map((l, i) => (
          <Pressable key={i} onPress={() => { clear(); setLine(i); speak(l, { rate:0.75, pitch:1.3 }); }} accessibilityRole="button" accessibilityLabel={`Line ${i + 1}: ${l}. Tap to hear`}
            style={{ padding:14, borderRadius:16, backgroundColor:line === i ? '#FCE4EC' : C.bg, borderWidth:2, borderColor:line === i ? '#C2185B' : 'transparent', minHeight:56, justifyContent:'center' }}>
            <Text style={{ fontFamily:F.bold, fontSize:20, color:C.text, lineHeight:28 }}>{line === i ? '🎵 ' : ''}{l}</Text>
          </Pressable>))}
      </Card>
      <Btn title={playing ? '⏹ Stop' : '▶ Sing along'} color={playing ? C.red : '#C2185B'} onPress={playing ? clear : sing} />
      <Btn title="🧩 Find the missing words" outline color={C.blue} onPress={() => navigation.navigate('Quiz', { mode:'rhyme', id:rid })} />
    </Page>
  );
}
