import React, { useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, PanResponder, Platform } from 'react-native';
import { C, F, useStore } from '../theme';
import { Page, LearnNovaHeader, Btn, CelebrationAnimation, FadeIn } from '../components';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), DIGITS = '0123456789'.split('');
const webFix = Platform.OS === 'web' ? { touchAction:'none', userSelect:'none', cursor:'crosshair' } : {};

export default function TracingScreen({ route }) {
  const { award } = useStore();
  const [ch, setCh] = useState(route.params?.value || 'A'), [pts, setPts] = useState([]), [size, setSize] = useState(0), [done, setDone] = useState(false);
  const start = useRef({ x:0, y:0 }), last = useRef(null);
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder:() => true, onMoveShouldSetPanResponder:() => true, onPanResponderTerminationRequest:() => false,
    onPanResponderGrant:(e) => { start.current = { x:e.nativeEvent.locationX, y:e.nativeEvent.locationY }; last.current = null; add(start.current.x, start.current.y); },
    onPanResponderMove:(_, g) => add(start.current.x + g.dx, start.current.y + g.dy),
  }), []);
  const add = (x, y) => {
    const l = last.current; if (l && Math.hypot(x - l.x, y - l.y) < 7) return;
    last.current = { x, y }; setPts(p => (p.length > 700 ? p : [...p, { x, y }]));
  };
  const clear = () => { setPts([]); setDone(false); last.current = null; };
  const finish = () => { setDone(true); award({ xp:5, counts:{ tracing:1 }, game:true }); };
  const pick = (c) => { setCh(c); clear(); };
  return (
    <Page theme="games" max={560}>
      <LearnNovaHeader title="Tracing ✏️" sub="Trace the big letter with your finger or mouse" emoji="🖍️" color="#00796B" />
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
        {[...LETTERS, ...DIGITS].map(c => <Pressable key={c} onPress={() => pick(c)} accessibilityRole="button" accessibilityLabel={`Trace ${c}`} style={{ width:40, height:40, borderRadius:12, backgroundColor:ch === c ? C.blue : C.card, borderWidth:2, borderColor:C.line, alignItems:'center', justifyContent:'center' }}><Text style={{ fontFamily:F.bold, color:ch === c ? '#fff' : C.text }}>{c}</Text></Pressable>)}
      </View>
      <View onLayout={(e) => setSize(e.nativeEvent.layout.width)} style={{ width:'100%', aspectRatio:1, backgroundColor:C.card, borderRadius:28, borderWidth:4, borderColor:C.line, borderStyle:'dashed', overflow:'hidden', ...webFix }} {...pan.panHandlers} accessibilityLabel={`Drawing area for letter ${ch}`}>
        <View pointerEvents="none" style={{ position:'absolute', left:0, right:0, top:0, bottom:0, alignItems:'center', justifyContent:'center' }}>
          <Text style={{ fontFamily:F.bold, fontSize:size * 0.78, color:'#D5DEF0', lineHeight:size * 0.95 }}>{ch}</Text>
        </View>
        {pts.map((p, i) => <View key={i} pointerEvents="none" style={{ position:'absolute', left:p.x - 9, top:p.y - 9, width:18, height:18, borderRadius:9, backgroundColor:C.blue }} />)}
        {done && <CelebrationAnimation />}
      </View>
      {done ? <FadeIn><Text style={{ fontFamily:F.bold, fontSize:20, color:C.green, textAlign:'center' }}>🎉 Awesome tracing! ⭐ +5 XP</Text></FadeIn> : null}
      <View style={{ flexDirection:'row', gap:10 }}>
        <View style={{ flex:1 }}><Btn title="Clear" outline color={C.grey} onPress={clear} /></View>
        <View style={{ flex:1 }}><Btn title="Done ✓" color={C.green} disabled={pts.length < 8 || done} onPress={finish} /></View>
      </View>
    </Page>
  );
}
