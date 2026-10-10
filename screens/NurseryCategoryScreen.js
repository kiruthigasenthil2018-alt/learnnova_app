import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, R, SHADOW } from '../theme';
import { Page, Grid, LearnNovaHeader, Btn, AudioButton } from '../components';
import { CATEGORIES } from '../data/nurseryData';
import { speak, playClip } from '../services/audioService';
import { clipFor } from '../services/animalSounds';

export default function NurseryCategoryScreen({ route, navigation }) {
  const cat = CATEGORIES[route.params.id], [active, setActive] = useState(null);
  const animals = cat.title === 'Animals';
  // Animals play their real sound (bark, meow, moo ...). Everything else is read aloud.
  const tap = async (it) => {
    setActive(it.id);
    if (animals) { const ok = await playClip(clipFor(it.name), 'clip:' + it.name); if (!ok) speak(cat.say(it)); else setTimeout(() => speak(`${it.name} says ${it.extra}`, { rate:0.8 }), 1700); }
    else speak(cat.say(it));
  };
  return (
    <Page theme="phonics">
      <LearnNovaHeader title={cat.title} sub={animals ? "Tap an animal to hear its sound! 🔊" : "Tap a picture to hear it! 🔊"} emoji={cat.emoji} color={cat.color} />
      <Grid min={140} max={5} gap={12} data={cat.items} renderItem={(it) => (
        <Pressable onPress={() => tap(it)} accessibilityRole="button" accessibilityLabel={`${it.name}. Tap to hear.`}
          style={({ pressed }) => ({ backgroundColor:C.card, borderRadius:24, padding:12, alignItems:'center', justifyContent:'center', gap:4, minHeight:150, borderWidth:4, borderColor:active === it.id ? cat.color : 'transparent', transform:[{ scale:pressed ? 0.96 : 1 }], ...SHADOW })}>
          {cat.title === 'Numbers' ? (<><Text style={{ fontFamily:F.bold, fontSize:56, color:cat.color }}>{it.big}</Text><Text style={{ fontSize:20, textAlign:'center' }} numberOfLines={3}>{it.emoji}</Text></>)
            : cat.title === 'Colors' ? (<><View style={{ width:70, height:70, borderRadius:35, backgroundColor:it.color, borderWidth:3, borderColor:C.line }} /><Text style={{ fontSize:30 }}>{it.emoji}</Text></>)
            : <Text style={{ fontSize:60 }}>{it.emoji}</Text>}
          <Text style={{ fontFamily:F.bold, fontSize:20, color:C.text, textAlign:'center' }}>{it.name}</Text>
          {it.extra && cat.title === 'Animals' ? <Text style={{ fontFamily:F.semi, color:C.grey }}>“{it.extra}”</Text> : null}
        </Pressable>)} />
      <Btn title={`🎮  Practise ${cat.title}`} color={C.green} onPress={() => navigation.navigate('Quiz', { mode:'nursery', activity:cat.quiz })} />
    </Page>
  );
}
