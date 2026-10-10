import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { C, F, APP, lazyStyles } from '../theme';
import { Logo, Float, Btn, Wallpaper, FadeIn } from '../components';
const SLIDES = [
  { e:'🧒📚🦊', t:'Learn • Play • Explore • Grow', s:'Fun, interactive lessons for Nursery to Grade 5 — made to feel like play.' },
  { e:'🔤🔊🍎', t:'A–Z phonics with sounds', s:'Hear every letter, see the picture and play phonics games.' },
  { e:'🔢🔬🌍', t:'English, Maths, Science & Social', s:'Lessons, quizzes and challenges that get harder as you grow.' },
  { e:'⭐🔥🏆', t:'XP, streaks and badges', s:'Reach your daily goal, keep your streak and unlock achievements.' },
];
export default function WelcomeScreen({ navigation }) {
  const [w, setW] = useState(0), [idx, setIdx] = useState(0);
  const ref = useRef(null), idxRef = useRef(0);
  useEffect(() => {
    if (!w) return;
    const t = setInterval(() => { idxRef.current = (idxRef.current + 1) % SLIDES.length; setIdx(idxRef.current); ref.current?.scrollToIndex({ index:idxRef.current }); }, 3500);
    return () => clearInterval(t);
  }, [w]);
  return (
    <Wallpaper theme="home">
      <ScrollView contentContainerStyle={{ flexGrow:1, justifyContent:'center', alignItems:'center', padding:16 }}>
        <View style={{ width:'100%', maxWidth:720 }}>
          <FadeIn style={{ alignItems:'center', marginBottom:16 }}><Logo size={64} light column /><Text style={s.tag}>{APP.tag}</Text></FadeIn>
          <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
            {w > 0 && (
              <FlatList ref={ref} data={SLIDES} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(_, i) => String(i)}
                getItemLayout={(_, i) => ({ length:w, offset:w * i, index:i })}
                onMomentumScrollEnd={(e) => { const i = Math.round(e.nativeEvent.contentOffset.x / w); idxRef.current = i; setIdx(i); }}
                renderItem={({ item }) => (
                  <View style={{ width:w, paddingHorizontal:4 }}>
                    <View style={s.card}><Float><Text style={s.emoji}>{item.e}</Text></Float><Text style={s.t}>{item.t}</Text><Text style={s.sub}>{item.s}</Text></View>
                  </View>)} />)}
          </View>
          <View style={s.dots}>{SLIDES.map((_, i) => <View key={i} style={[s.dot, i === idx && { backgroundColor:C.card, width:22 }]} />)}</View>
          <Btn title="Get started — it's free" color={C.green} onPress={() => navigation.navigate('Auth', { mode:'signup' })} />
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { mode:'login' })} style={{ marginTop:14 }}><Text style={s.have}>I already have an account</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </Wallpaper>
  );
}
const s = lazyStyles(() => StyleSheet.create({
  tag:{ color:'#DCE6FF', fontFamily:F.semi, marginTop:8, textAlign:'center' },
  card:{ backgroundColor:C.card, borderRadius:24, padding:22, alignItems:'center', minHeight:260, justifyContent:'center' },
  emoji:{ fontSize:56, marginBottom:10 }, t:{ fontFamily:F.bold, fontSize:22, color:C.text, textAlign:'center', flexShrink:1 }, sub:{ fontFamily:F.reg, color:C.grey, textAlign:'center', marginTop:6, flexShrink:1 },
  dots:{ flexDirection:'row', gap:6, justifyContent:'center', marginVertical:14 }, dot:{ width:8, height:8, borderRadius:4, backgroundColor:'rgba(255,255,255,0.45)' },
  have:{ color:'#fff', fontFamily:F.bold, textAlign:'center', fontSize:15 },
}));
