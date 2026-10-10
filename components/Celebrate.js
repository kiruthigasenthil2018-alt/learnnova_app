import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { C, F, SHADOW } from '../theme';

// ---------- Fireworks / confetti: bursts of emoji and colour pieces that blast out and fall ----------
const CONF = ['#F9A825', '#EC6A8E', '#2463EB', '#43A047', '#7C4DFF', '#FB8C00', '#26C6DA'];
const EMO = ['🎉', '🎊', '✨', '⭐', '🎈', '🍬', '🍭', '💖'];
export function Fireworks({ bursts = 1, count = 14, big, emojis = EMO, duration = 1500, style }) {
  const set = useRef(Array.from({ length:bursts }, (_, b) => ({
    ox:bursts === 1 ? 50 : 18 + Math.random() * 64, oy:bursts === 1 ? 45 : 18 + Math.random() * 40, delay:b * 420,
    items:Array.from({ length:count }, (_, i) => { const a = (i / count) * Math.PI * 2 + Math.random() * 0.5, d = (big ? 100 : 60) + Math.random() * (big ? 140 : 70);
      return { v:new Animated.Value(0), dx:Math.cos(a) * d, dy:Math.sin(a) * d, emoji:i % 3 === 0 ? emojis[(i + b) % emojis.length] : null, c:CONF[(i + b) % CONF.length], r:Math.random() * 540 - 270 }; }),
  }))).current;
  useEffect(() => { set.forEach(p => p.items.forEach(it => Animated.timing(it.v, { toValue:1, duration, delay:p.delay, easing:Easing.out(Easing.cubic), useNativeDriver:true }).start())); }, []);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow:'hidden' }, style]}>
      {set.map((p, b) => (
        <View key={b} style={{ position:'absolute', left:`${p.ox}%`, top:`${p.oy}%` }}>
          {p.items.map((it, i) => (
            <Animated.View key={i} style={{ position:'absolute', opacity:it.v.interpolate({ inputRange:[0, 0.08, 0.7, 1], outputRange:[0, 1, 1, 0] }),
              transform:[{ translateX:it.v.interpolate({ inputRange:[0, 1], outputRange:[0, it.dx] }) }, { translateY:it.v.interpolate({ inputRange:[0, 0.55, 1], outputRange:[0, it.dy, it.dy + 70] }) },
                { rotate:it.v.interpolate({ inputRange:[0, 1], outputRange:['0deg', `${it.r}deg`] }) }, { scale:it.v.interpolate({ inputRange:[0, 0.2, 1], outputRange:[0.2, 1.25, 0.8] }) }] }}>
              {it.emoji ? <Text style={{ fontSize:big ? 30 : 22 }}>{it.emoji}</Text> : <View style={{ width:9, height:big ? 16 : 13, borderRadius:3, backgroundColor:it.c }} />}
            </Animated.View>))}
        </View>))}
    </View>
  );
}

// ---------- Animals dancing and cheering ----------
const CHEER = ['🐶', '🐱', '🐰', '🐼', '🦁', '🐵', '🐸', '🦊', '🐯', '🐘', '🦄', '🐥'];
const pick = (n) => { const a = [...CHEER]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };

function Dancer({ emoji, i, size, slow }) {
  const v = useRef(new Animated.Value(0)).current, s = slow ? 1.6 : 1;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([Animated.delay(i * 140), Animated.timing(v, { toValue:1, duration:380 * s, easing:Easing.out(Easing.quad), useNativeDriver:true }), Animated.timing(v, { toValue:0, duration:380 * s, easing:Easing.in(Easing.quad), useNativeDriver:true })]));
    l.start(); return () => l.stop();
  }, []);
  const mode = i % 3;                              // 0 jump  • 1 tilt-dance  • 2 jump + spin
  return (
    <Animated.View style={{ transform:[
      { translateY:v.interpolate({ inputRange:[0, 1], outputRange:[0, mode === 1 ? -8 : -26] }) },
      { rotate:v.interpolate({ inputRange:[0, 1], outputRange:mode === 1 ? ['-14deg', '14deg'] : mode === 2 ? ['0deg', '360deg'] : ['-5deg', '5deg'] }) },
      { scaleY:v.interpolate({ inputRange:[0, 0.5, 1], outputRange:[0.92, 1.05, 1] }) }] }}>
      <Text style={{ fontSize:size }}>{emoji}</Text>
    </Animated.View>
  );
}
export function DancingAnimals({ title = 'Congratulations!', sub, n = 5, size = 46, mood = 'cheer' }) {
  const animals = useMemo(() => pick(n), []), pop = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(pop, { toValue:1, friction:4, useNativeDriver:true }).start(); }, []);
  return (
    <Animated.View style={{ alignItems:'center', gap:6, transform:[{ scale:pop.interpolate({ inputRange:[0, 1], outputRange:[0.4, 1] }) }], opacity:pop }}>
      <View style={{ flexDirection:'row', gap:6, flexWrap:'wrap', justifyContent:'center', paddingTop:28 }}>
        {animals.map((a, i) => <Dancer key={i} emoji={a} i={i} size={size} slow={mood === 'try'} />)}
      </View>
      <View style={{ backgroundColor:C.card, borderRadius:20, paddingVertical:8, paddingHorizontal:18, ...SHADOW }}>
        <Text style={{ fontFamily:F.bold, fontSize:20, color:C.text, textAlign:'center' }}>{mood === 'try' ? '💪 ' : '🎉 '}{title}</Text>
        {sub ? <Text style={{ fontFamily:F.semi, fontSize:13, color:C.grey, textAlign:'center' }}>{sub}</Text> : null}
      </View>
    </Animated.View>
  );
}

// A small animal that pops up and wiggles next to "Correct!"
const CORRECT_SAY = ['Yay!', 'Woohoo!', 'Great job!', 'Super!', 'Hooray!', 'You did it!'];
export function AnimalCheer() {
  const [a] = useState(() => pick(1)[0]), [say] = useState(() => CORRECT_SAY[Math.floor(Math.random() * CORRECT_SAY.length)]);
  const v = useRef(new Animated.Value(0)).current, w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue:1, friction:3, useNativeDriver:true }).start();
    const l = Animated.loop(Animated.sequence([Animated.timing(w, { toValue:1, duration:260, useNativeDriver:true }), Animated.timing(w, { toValue:0, duration:260, useNativeDriver:true })])); l.start(); return () => l.stop();
  }, []);
  return (
    <Animated.View style={{ position:'absolute', right:4, top:-34, flexDirection:'row', alignItems:'flex-end', gap:6, opacity:v, transform:[{ scale:v }] }} pointerEvents="none">
      <View style={{ backgroundColor:C.card, borderRadius:14, paddingVertical:4, paddingHorizontal:10, ...SHADOW }}><Text style={{ fontFamily:F.bold, color:C.text, fontSize:13 }}>{say}</Text></View>
      <Animated.Text style={{ fontSize:46, transform:[{ translateY:w.interpolate({ inputRange:[0, 1], outputRange:[0, -12] }) }, { rotate:w.interpolate({ inputRange:[0, 1], outputRange:['-10deg', '10deg'] }) }] }}>{a}</Animated.Text>
    </Animated.View>
  );
}

// Big greeting when the app opens: fireworks + a waving animal (shows once per app start)
let greeted = false;
export function GreetingBlast({ name }) {
  const [on, setOn] = useState(() => !greeted), fade = useRef(new Animated.Value(0)).current, wave = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!on) return; greeted = true;
    Animated.sequence([Animated.timing(fade, { toValue:1, duration:300, useNativeDriver:true }), Animated.delay(2600), Animated.timing(fade, { toValue:0, duration:600, useNativeDriver:true })]).start(() => setOn(false));
    const l = Animated.loop(Animated.sequence([Animated.timing(wave, { toValue:1, duration:300, useNativeDriver:true }), Animated.timing(wave, { toValue:0, duration:300, useNativeDriver:true })])); l.start(); return () => l.stop();
  }, []);
  if (!on) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex:30 }]}>
      <Fireworks bursts={4} count={16} big duration={1700} />
      <Animated.View style={{ position:'absolute', top:'16%', left:0, right:0, alignItems:'center', opacity:fade }}>
        <View style={{ alignItems:'center', backgroundColor:C.card, borderRadius:26, paddingVertical:14, paddingHorizontal:26, ...SHADOW }}>
          <Animated.Text style={{ fontSize:64, transform:[{ rotate:wave.interpolate({ inputRange:[0, 1], outputRange:['-12deg', '12deg'] }) }] }}>🐻</Animated.Text>
          <Text style={{ fontFamily:F.bold, fontSize:22, color:C.text, textAlign:'center' }}>Hello{name ? `, ${name}` : ''}! 👋</Text>
          <Text style={{ fontFamily:F.semi, color:C.grey, textAlign:'center' }}>Let's learn and play today! 🌟</Text>
        </View>
      </Animated.View>
    </View>
  );
}
