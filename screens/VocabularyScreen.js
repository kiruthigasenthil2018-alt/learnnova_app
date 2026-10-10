import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, R, SHADOW, useStore } from '../theme';
import { Page, Card, Grid, LearnNovaHeader, Btn, AudioButton, FadeIn } from '../components';
import { VOCAB, vocabOf } from '../data/vocabData';
import { speak } from '../services/audioService';

export default function VocabularyScreen({ route, navigation }) {
  const { data, award } = useStore();
  const [cat, setCat] = useState(route.params?.cat || null), [open, setOpen] = useState(null);
  const c = cat ? vocabOf(cat) : null;
  const learn = (w) => { const k = 'vocab:' + w.word; if (!data.counts[k]) award({ xp:2, counts:{ [k]:1, vocab:1 } }); };
  if (!c) return (
    <Page theme="phonics" max={900}>
      <LearnNovaHeader title="Vocabulary 📖" sub="Pick a word group, learn the words, then take a quiz" color="#00796B" emoji="🔤" />
      <Grid min={220} max={3} data={VOCAB} renderItem={(v) => (
        <Pressable onPress={() => setCat(v.id)} accessibilityRole="button" accessibilityLabel={`${v.title}, ${v.words.length} words`}
          style={({ pressed }) => ({ backgroundColor:C.card, borderRadius:R.card, padding:16, minHeight:120, alignItems:'center', justifyContent:'center', gap:4, borderBottomWidth:6, borderBottomColor:v.color, opacity:pressed ? 0.85 : 1, ...SHADOW })}>
          <Text style={{ fontSize:42 }}>{v.emoji}</Text>
          <Text style={{ fontFamily:F.bold, fontSize:17, color:C.text, textAlign:'center' }}>{v.title}</Text>
          <Text style={{ fontFamily:F.semi, fontSize:12, color:C.grey }}>{v.words.length} words</Text>
        </Pressable>)} />
      <Btn title="🧠 Quiz me on all words" color={C.green} onPress={() => navigation.navigate('Quiz', { mode:'vocab' })} />
      <Btn title="🔎 Look up any word in the Dictionary" outline color={C.blue} onPress={() => navigation.navigate('Main', { screen:'Dictionary' })} />
    </Page>
  );
  return (
    <Page theme="phonics" max={900}>
      <LearnNovaHeader title={`${c.title} ${c.emoji}`} sub={`${c.words.length} words • tap a card to open it`} color={c.color} />
      <Btn title="◀ All word groups" outline color={C.grey} onPress={() => { setCat(null); setOpen(null); }} style={{ alignSelf:'flex-start' }} />
      <Grid min={260} max={2} data={c.words.map(w => ({ ...w, id:w.word }))} renderItem={(w) => {
        const on = open === w.word;
        return (
          <Pressable onPress={() => { setOpen(on ? null : w.word); if (!on) { learn(w); speak(`${w.word}. ${w.meaning}`, { rate:0.8 }); } }} accessibilityRole="button" accessibilityLabel={`${w.word}. ${on ? w.meaning : 'Tap to open'}`}
            style={{ backgroundColor:C.card, borderRadius:R.card, padding:14, gap:6, borderLeftWidth:8, borderLeftColor:c.color, minHeight:96, ...SHADOW }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
              <Text style={{ fontSize:38 }}>{w.emoji}</Text>
              <Text style={{ fontFamily:F.bold, fontSize:20, color:C.text, flex:1 }}>{w.word}</Text>
              <Text style={{ color:C.grey, fontSize:20 }}>{on ? '⌃' : '⌄'}</Text>
            </View>
            {on && (
              <FadeIn><View style={{ gap:6 }}>
                <Text style={{ fontFamily:F.semi, color:C.text, fontSize:15, lineHeight:22 }}>{w.meaning}</Text>
                <Text style={{ fontFamily:F.semi, color:C.blue, fontSize:15, lineHeight:22 }}>✏️ {w.example}</Text>
                <View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
                  <AudioButton say={`${w.word}. ${w.meaning} For example: ${w.example}`} label="Hear it" note={w.meaning} />
                  <Btn title="🔎 Dictionary" outline color={C.blue} onPress={() => navigation.navigate('Main', { screen:'Dictionary' })} style={{ minHeight:48, paddingVertical:8 }} />
                </View>
              </View></FadeIn>
            )}
          </Pressable>);
      }} />
      <Btn title={`🧠 Quiz me on ${c.title}`} color={C.green} onPress={() => navigation.navigate('Quiz', { mode:'vocab', cat:c.id })} />
    </Page>
  );
}
