import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import { C, useStore } from '../theme';

// Illustrated cartoon wallpaper (sky, sun/moon, clouds, rainbow, hills, trees and themed sprites).
// Built from plain Views so it works on Android, iOS and web with no extra packages.
// Light mode = sunny day scene, dark mode = night scene. Always sits behind content and ignores touches.
const SCENES = {
  home:{ sky:['#D8EBFF', '#0E1A38'], hills:['#BFE6C2', '#9ED6A4', '#17331F', '#102719'], sprites:['☁️', '🎈', '📚', '🚌', '⭐', '✏️', '🦋'], rainbow:true, trees:['🌳', '🌲'] },
  phonics:{ sky:['#FFEFD5', '#2A1A12'], hills:['#FFE0B2', '#FFCC80', '#3A2616', '#2B1A0F'], sprites:['A', 'B', 'C', '🐘', '🐱', '🐶', 'a', '🍎'], rainbow:false, trees:['🌻', '🌳'] },
  math:{ sky:['#ECE5FF', '#18132E'], hills:['#D1C4E9', '#B39DDB', '#2A2250', '#1E1840'], sprites:['1', '2', '3', '➕', '🔺', '🔷', '7', '⭐'], rainbow:false, trees:['🌲', '🌳'] },
  science:{ sky:['#DDF5E8', '#0C2220'], hills:['#B7E4C7', '#95D5B2', '#123326', '#0D281E'], sprites:['🪐', '☁️', '🌱', '🦋', '🔭', '🌍', '🐝'], rainbow:false, trees:['🌳', '🌴'] },
  games:{ sky:['#FFE3F0', '#2A1230'], hills:['#F8BBD0', '#F48FB1', '#3C1B3F', '#2D1330'], sprites:['🎈', '⭐', '🎉', '🎮', '🧩', '✨', '🎁'], rainbow:true, trees:['🎪', '🌳'] },
  ai:{ sky:['#E4E6FF', '#12123A'], hills:['#C5CAE9', '#9FA8DA', '#232358', '#191944'], sprites:['✨', '💡', '🤖', '⭐', '🔭', '💬', '🚀'], rainbow:false, trees:['🛰️', '🌳'] },
};
// 18 spots (left %, top %). Every spot gets an animated toy, animal or candy.
const SPOTS = [[3, 6], [80, 5], [44, 10], [8, 30], [88, 28], [27, 48], [70, 52], [5, 66], [85, 64], [48, 76], [22, 86], [74, 84], [58, 28], [16, 14], [93, 46], [38, 32], [64, 12], [52, 58]];
const TOYS = ['🧸', '🪀', '🚂', '🎈', '🪁', '🧩', '🪅', '🎠', '🚀', '🤖', '🪆', '🛼', '🏎️', '⚽'];
const ANIMALS = ['🐘', '🦁', '🐼', '🐰', '🐶', '🐱', '🦊', '🐸', '🐥', '🦄', '🐙', '🦋', '🐢', '🐝'];
const CANDY = ['🍭', '🍬', '🧁', '🍩', '🍪', '🍦', '🍰', '🎂', '🍫', '🍓', '🍉', '🍎'];
const hashOf = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
// deterministic mix per theme: toys, animals and candy side by side
const mixFor = (theme, theme_sprites) => {
  const h = Math.abs(hashOf(theme)), out = [];
  for (let i = 0; i < SPOTS.length; i++) {
    const k = i % 4; // 0 toy, 1 animal, 2 candy, 3 theme sprite
    out.push(k === 0 ? TOYS[(h + i * 3) % TOYS.length] : k === 1 ? ANIMALS[(h + i * 5) % ANIMALS.length] : k === 2 ? CANDY[(h + i * 7) % CANDY.length] : theme_sprites[i % theme_sprites.length]);
  }
  return out;
};
// One animated sprite: floats up/down, sways, and sometimes spins or pops.
function Sprite({ ch, left, top, size, i, night }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const dur = 2400 + (i % 5) * 450;
    const loop = Animated.loop(Animated.sequence([Animated.delay((i * 230) % 1400), Animated.timing(v, { toValue:1, duration:dur, easing:Easing.inOut(Easing.sin), useNativeDriver:true }), Animated.timing(v, { toValue:0, duration:dur, easing:Easing.inOut(Easing.sin), useNativeDriver:true })]));
    loop.start(); return () => loop.stop();
  }, []);
  const kind = i % 3;                                  // 0 bob up/down, 1 sway, 2 bob + gentle spin
  return (
    <Animated.Text style={{ position:'absolute', left:`${left}%`, top:`${top}%`, fontSize:size, opacity:night ? 0.5 : 0.8,
      transform:[{ translateY:v.interpolate({ inputRange:[0, 1], outputRange:[0, kind === 1 ? 4 : -(14 + (i % 4) * 4)] }) }, { translateX:v.interpolate({ inputRange:[0, 1], outputRange:[0, kind === 1 ? 14 : 0] }) },
        { rotate:v.interpolate({ inputRange:[0, 1], outputRange:kind === 2 ? ['-12deg', '12deg'] : ['-6deg', '6deg'] }) }, { scale:v.interpolate({ inputRange:[0, 1], outputRange:[1, 1.12] }) }] }}>{ch}</Animated.Text>
  );
}
// Animals that stroll along the bottom of the screen
function Walker({ ch, row, speed, delay, w, night }) {
  const x = useRef(new Animated.Value(0)).current, hop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([Animated.delay(delay), Animated.timing(x, { toValue:1, duration:speed, easing:Easing.linear, useNativeDriver:true }), Animated.timing(x, { toValue:0, duration:0, useNativeDriver:true })]));
    const h = Animated.loop(Animated.sequence([Animated.timing(hop, { toValue:1, duration:260, useNativeDriver:true }), Animated.timing(hop, { toValue:0, duration:260, useNativeDriver:true })]));
    a.start(); h.start(); return () => { a.stop(); h.stop(); };
  }, []);
  return (
    <Animated.Text style={{ position:'absolute', bottom:row, left:-60, fontSize:34, opacity:night ? 0.6 : 0.95, transform:[{ translateX:x.interpolate({ inputRange:[0, 1], outputRange:[0, (w || 800) + 120] }) }, { translateY:hop.interpolate({ inputRange:[0, 1], outputRange:[0, -8] }) }] }}>{ch}</Animated.Text>
  );
}
const RB = ['#EF5350', '#FFA726', '#FFEE58', '#66BB6A', '#42A5F5', '#AB47BC'];
const STARS = [[10, 8], [24, 18], [37, 6], [55, 14], [66, 5], [92, 20], [15, 40], [60, 34], [82, 46], [30, 62], [75, 70], [8, 80]];

const Cloud = ({ left, top, s = 1, o }) => (
  <View style={{ position:'absolute', left, top, opacity:o, transform:[{ scale:s }] }}>
    <View style={{ width:90, height:34, borderRadius:17, backgroundColor:'#fff' }} />
    <View style={{ position:'absolute', left:14, top:-16, width:40, height:40, borderRadius:20, backgroundColor:'#fff' }} />
    <View style={{ position:'absolute', left:40, top:-26, width:46, height:46, borderRadius:23, backgroundColor:'#fff' }} />
  </View>
);
const Rainbow = ({ left, top, size = 250, o }) => (
  <View style={{ position:'absolute', left, top, width:size, height:size / 2, overflow:'hidden', opacity:o }}>
    {RB.map((c, i) => <View key={c} style={{ position:'absolute', left:i * 9, top:i * 9, width:size - i * 18, height:size - i * 18, borderRadius:size, borderWidth:9, borderColor:c }} />)}
  </View>
);

export default function CartoonBackground({ theme = 'home', light }) {
  const st = useStore(), on = !st || !st.settings || st.settings.backgrounds !== false;
  const night = light || C.mode === 'dark', sc = SCENES[theme] || SCENES.home, { width } = useWindowDimensions();
  const mix = useMemo(() => mixFor(theme, sc.sprites), [theme]);
  const sky = light ? C.deep : sc.sky[night ? 1 : 0];
  if (!on) return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor:C.bg }]} />;
  const [h1, h2] = night ? [sc.hills[2], sc.hills[3]] : [sc.hills[0], sc.hills[1]];
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow:'hidden', backgroundColor:sky }]}>
      {night ? (<>
        {STARS.map(([l, t], i) => <View key={i} style={{ position:'absolute', left:`${l}%`, top:`${t}%`, width:i % 3 ? 3 : 5, height:i % 3 ? 3 : 5, borderRadius:3, backgroundColor:'#FFF9C4', opacity:0.75 }} />)}
        <Text style={{ position:'absolute', right:'6%', top:'4%', fontSize:54, opacity:0.9 }}>🌙</Text>
      </>) : (<>
        <View style={{ position:'absolute', right:'5%', top:'3%', width:84, height:84, borderRadius:42, backgroundColor:'#FFE082', opacity:0.55 }} />
        <View style={{ position:'absolute', right:'7%', top:'5%', width:60, height:60, borderRadius:30, backgroundColor:'#FFCA28', opacity:0.8 }} />
        <Cloud left="6%" top="9%" s={1} o={0.9} /><Cloud left="52%" top="17%" s={0.8} o={0.8} /><Cloud left="26%" top="36%" s={0.7} o={0.6} />
      </>)}
      {sc.rainbow && !night ? <Rainbow left="-4%" top="22%" o={0.35} /> : null}
      {mix.map((ch, i) => <Sprite key={i} ch={ch} left={SPOTS[i][0]} top={SPOTS[i][1]} size={26 + (i % 3) * 10} i={i} night={night} />)}
      <View style={{ position:'absolute', left:'-25%', bottom:-150, width:'85%', height:270, borderRadius:220, backgroundColor:h1 }} />
      <View style={{ position:'absolute', right:'-30%', bottom:-180, width:'95%', height:300, borderRadius:240, backgroundColor:h2 }} />
      <Text style={{ position:'absolute', left:'3%', bottom:'1%', fontSize:54, opacity:night ? 0.5 : 1 }}>{sc.trees[0]}</Text>
      <Text style={{ position:'absolute', right:'4%', bottom:'1%', fontSize:62, opacity:night ? 0.5 : 1 }}>{sc.trees[1]}</Text>
      <Walker ch="🐘" row={4} speed={26000} delay={0} w={width} night={night} /><Walker ch="🐇" row={14} speed={17000} delay={3000} w={width} night={night} /><Walker ch="🧸" row={2} speed={32000} delay={9000} w={width} night={night} />
    </View>
  );
}
