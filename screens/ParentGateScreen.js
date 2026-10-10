import React, { useRef, useState, useMemo } from 'react';
import { View, Text, PanResponder, Pressable, TextInput, Platform } from 'react-native';
import { C, F, R } from '../theme';
import { Wallpaper, Btn, BackButton } from '../components';

// "Grown-Ups Only!" — swipe right to continue (or answer a sum if swiping is hard)
export default function ParentGateScreen({ navigation }) {
  const [w, setW] = useState(0), [x, setX] = useState(0), [ans, setAns] = useState(''), [bad, setBad] = useState(false);
  const sum = useMemo(() => [Math.floor(Math.random() * 6) + 6, Math.floor(Math.random() * 6) + 6], []);
  const KNOB = 56, max = Math.max(0, w - KNOB), startX = useRef(0), maxRef = useRef(0); maxRef.current = max;
  const open = () => navigation.replace('ParentSection');
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder:() => true, onMoveShouldSetPanResponder:() => true, onPanResponderTerminationRequest:() => false,
    onPanResponderGrant:() => { startX.current = 0; },
    onPanResponderMove:(_, g) => setX(Math.max(0, Math.min(maxRef.current, g.dx))),
    onPanResponderRelease:(_, g) => { if (g.dx >= maxRef.current * 0.9 && maxRef.current > 0) open(); else setX(0); },
  }), []);
  const check = () => { if (+ans === sum[0] + sum[1]) open(); else { setBad(true); setAns(''); } };
  return (
    <Wallpaper theme="home">
      <View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:20 }}>
        <View style={{ width:'100%', maxWidth:440, backgroundColor:C.card, borderRadius:28, padding:24, alignItems:'center', gap:14 }}>
          <View style={{ alignSelf:'flex-start', marginTop:-8, marginLeft:-8 }}><BackButton light={false} color={C.text} onPress={() => navigation.goBack()} /></View>
          <Text style={{ fontFamily:F.bold, fontSize:26, color:C.text }} accessibilityRole="header">Grown-Ups Only!</Text>
          <Text style={{ fontSize:80 }}>🔒</Text>
          <Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>Swipe RIGHT to continue</Text>
          <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width:'100%', height:KNOB, borderRadius:KNOB / 2, backgroundColor:C.sky, justifyContent:'center', ...(Platform.OS === 'web' ? { touchAction:'none', userSelect:'none' } : {}) }} {...pan.panHandlers} accessibilityLabel="Swipe right to continue">
            <Text style={{ position:'absolute', alignSelf:'center', fontFamily:F.bold, color:C.grey }}>Swipe ➜➜➜</Text>
            <View pointerEvents="none" style={{ position:'absolute', left:x, width:KNOB, height:KNOB, borderRadius:KNOB / 2, backgroundColor:C.green, alignItems:'center', justifyContent:'center' }}><Text style={{ color:'#fff', fontSize:28, fontFamily:F.bold }}>›</Text></View>
          </View>
          <Text style={{ fontFamily:F.semi, color:C.grey, marginTop:4 }}>Or answer: {sum[0]} + {sum[1]} =</Text>
          <View style={{ flexDirection:'row', gap:8, width:'100%' }}>
            <TextInput value={ans} onChangeText={(t) => { setAns(t); setBad(false); }} keyboardType="number-pad" placeholder="?" placeholderTextColor={C.grey} accessibilityLabel="Answer to the sum" style={{ flex:1, borderWidth:2, borderColor:bad ? C.red : C.line, borderRadius:14, padding:12, fontFamily:F.bold, fontSize:18, color:C.text, backgroundColor:C.bg }} onSubmitEditing={check} />
            <Btn title="Go" color={C.blue} onPress={check} style={{ minWidth:80 }} />
          </View>
          {bad ? <Text style={{ color:C.red, fontFamily:F.semi }}>Not quite — try again 😊</Text> : null}
        </View>
      </View>
    </Wallpaper>
  );
}
