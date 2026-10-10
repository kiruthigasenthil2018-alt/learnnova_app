import React, { useRef, useState } from 'react';
import { View, Text, Animated, Pressable, StyleSheet, Platform } from 'react-native';
import { C, F, R, useStore, lazyStyles } from '../theme';
import { BITES } from '../data/factsData';
import { Btn, Float, CartoonBackground, SwipeArea } from '../components';

// Fun Facts: swipe left/right (finger or mouse), tap ◀ ▶, use the dots, or press the arrow keys.
export default function BitesScreen() {
  const { data, learnBite } = useStore();
  const [i, setI] = useState(0), slide = useRef(new Animated.Value(0)).current, busy = useRef(false);
  const item = BITES[i], got = data.learned.includes(item.t);

  const go = (to, dir) => {                        // dir: 1 = next (card leaves to the left), -1 = previous
    const n = (to + BITES.length) % BITES.length; if (busy.current || n === i) return; busy.current = true;
    Animated.timing(slide, { toValue:-dir * 1, duration:160, useNativeDriver:true }).start(() => {
      setI(n); slide.setValue(dir * 1);
      Animated.timing(slide, { toValue:0, duration:200, useNativeDriver:true }).start(() => { busy.current = false; });
    });
  };
  const next = () => go(i + 1, 1), prev = () => go(i - 1, -1);
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;
    const k = (e) => { if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev(); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const gotIt = () => { learnBite(item.t); setTimeout(next, 450); };
  const Arrow = ({ label, onPress, side }) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [s.arrow, side === 'l' ? { left:0 } : { right:0 }, pressed && { opacity:0.6 }]}>
      <Text style={{ fontSize:26, color:C.blue, fontFamily:F.bold }}>{side === 'l' ? '‹' : '›'}</Text>
    </Pressable>
  );
  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <CartoonBackground theme="science" />
      <View style={s.wrap}>
        <View style={s.head}>
          <Text style={s.h}>⚡ Fun Facts</Text>
          <Text style={s.sub}>Swipe ◀ ▶ for the next fact  •  {data.learned.length}/{BITES.length} learned (+5 XP each)</Text>
        </View>
        <View style={s.stage}>
          <Arrow label="Previous fact" onPress={prev} side="l" /><Arrow label="Next fact" onPress={next} side="r" />
          <SwipeArea onSwipeLeft={next} onSwipeRight={prev} style={{ width:'100%', alignItems:'center' }}>
            <Animated.View style={[s.card, { opacity:slide.interpolate({ inputRange:[-1, 0, 1], outputRange:[0, 1, 0] }), transform:[{ translateX:slide.interpolate({ inputRange:[-1, 0, 1], outputRange:[-90, 0, 90] }) }] }]}>
              <Text style={s.cat}>{item.cat.toUpperCase()}  •  {i + 1}/{BITES.length}</Text>
              <Float><Text style={{ fontSize:72 }}>{item.e}</Text></Float>
              <Text style={s.t}>{item.t}</Text><Text style={s.x}>{item.x}</Text>
              <View style={{ width:'100%', marginTop:16, gap:10 }}>
                <Btn title={got ? '✓ Learned' : 'Got it  +5 XP'} color={got ? C.green : C.blue} disabled={got} onPress={gotIt} />
                <View style={{ flexDirection:'row', gap:10 }}>
                  <View style={{ flex:1 }}><Btn title="◀ Previous" outline color={C.grey} onPress={prev} /></View>
                  <View style={{ flex:1 }}><Btn title="Next ▶" outline color={C.blue} onPress={next} /></View>
                </View>
              </View>
            </Animated.View>
          </SwipeArea>
        </View>
        <View style={s.dots}>{BITES.map((b, k) => <Pressable key={b.t} onPress={() => go(k, k > i ? 1 : -1)} accessibilityRole="button" accessibilityLabel={`Fact ${k + 1}`} hitSlop={6}><View style={[s.dot, data.learned.includes(b.t) && { backgroundColor:C.green }, k === i && { backgroundColor:C.blue, width:20 }]} /></Pressable>)}</View>
      </View>
    </View>
  );
}
const s = lazyStyles(() => StyleSheet.create({
  wrap:{ flex:1, width:'100%', maxWidth:620, alignSelf:'center', padding:16 },
  head:{ gap:4, marginBottom:12, alignItems:'center' },
  h:{ fontFamily:F.bold, fontSize:26, color:C.text, textAlign:'center' }, sub:{ fontFamily:F.semi, color:C.grey, textAlign:'center', fontSize:13 },
  stage:{ flex:1, justifyContent:'center', alignItems:'center', paddingHorizontal:44 },
  arrow:{ position:'absolute', top:'42%', width:40, height:40, borderRadius:20, backgroundColor:C.card, alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:C.line, zIndex:2 },
  card:{ width:'100%', maxWidth:480, backgroundColor:C.card, borderRadius:24, padding:22, alignItems:'center', borderWidth:2, borderColor:C.line },
  cat:{ fontFamily:F.bold, color:C.blue, letterSpacing:1, marginBottom:8 }, t:{ fontFamily:F.bold, fontSize:24, color:C.text, textAlign:'center', marginTop:8 }, x:{ fontFamily:F.reg, fontSize:16, color:C.grey, textAlign:'center', marginTop:8, lineHeight:24 },
  dots:{ flexDirection:'row', justifyContent:'center', alignItems:'center', gap:6, paddingVertical:12, flexWrap:'wrap' }, dot:{ width:8, height:8, borderRadius:4, backgroundColor:C.line },
}));
