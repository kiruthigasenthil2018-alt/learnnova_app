import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, Animated, StyleSheet, Easing, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, APP, R, lazyStyles } from '../theme';
import CartoonBackground from './CartoonBackground';

export const Logo = ({ size = 40, light, column }) => (
  <View style={{ flexDirection:column ? 'column' : 'row', alignItems:'center', gap:8 }}>
    <Image source={require('../assets/icon.png')} style={{ width:size, height:size, borderRadius:size * 0.22 }} />
    <Text style={{ fontFamily:F.bold, fontSize:size * 0.55, color:light ? '#fff' : C.text }}>{APP.name}</Text>
  </View>
);

export function Dots({ color = C.blue, small }) {
  const vals = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    vals.forEach((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 150),
      Animated.timing(v, { toValue:1, duration:300, useNativeDriver:true }),
      Animated.timing(v, { toValue:0, duration:300, useNativeDriver:true }),
      Animated.delay((2 - i) * 150),
    ])).start());
  }, []);
  return (
    <View style={{ flexDirection:'row', gap:6, height:small ? 20 : 28, alignItems:'flex-end' }}>
      {vals.map((v, i) => <Animated.View key={i} style={{ width:small ? 8 : 12, height:small ? 8 : 12, borderRadius:6, backgroundColor:color, transform:[{ translateY:v.interpolate({ inputRange:[0, 1], outputRange:[0, -8] }) }] }} />)}
    </View>
  );
}

export function Float({ children, amp = 8, dur = 1400 }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue:1, duration:dur, easing:Easing.inOut(Easing.quad), useNativeDriver:true }),
      Animated.timing(v, { toValue:0, duration:dur, easing:Easing.inOut(Easing.quad), useNativeDriver:true }),
    ])).start();
  }, []);
  return <Animated.View style={{ transform:[{ translateY:v.interpolate({ inputRange:[0, 1], outputRange:[0, -amp] }) }] }}>{children}</Animated.View>;
}

export function Pulse({ children }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(v, { toValue:1.1, duration:700, useNativeDriver:true }), Animated.timing(v, { toValue:1, duration:700, useNativeDriver:true })])).start();
  }, []);
  return <Animated.View style={{ transform:[{ scale:v }] }}>{children}</Animated.View>;
}

export function FadeIn({ children, delay = 0, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue:1, duration:450, delay, useNativeDriver:true }).start(); }, []);
  return <Animated.View style={[{ opacity:v, transform:[{ translateY:v.interpolate({ inputRange:[0, 1], outputRange:[14, 0] }) }] }, style]}>{children}</Animated.View>;
}

export function ProgressBar({ value, color = C.green, height = 10, track = C.line }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue:Math.max(0, Math.min(1, value)), duration:500, useNativeDriver:false }).start(); }, [value]);
  return <View style={{ height, borderRadius:height / 2, backgroundColor:track, overflow:'hidden' }}><Animated.View style={{ height, backgroundColor:color, borderRadius:height / 2, width:v.interpolate({ inputRange:[0, 1], outputRange:['0%', '100%'] }) }} /></View>;
}

export const Wallpaper = ({ theme = 'home', children }) => (
  <View style={{ flex:1, backgroundColor:C.deep }}>
    <CartoonBackground theme={theme} light />
    <View style={{ flex:1 }}>{children}</View>
  </View>
);

export function Btn({ title, onPress, color = C.blue, style, disabled, loading, outline, icon }) {
  const sc = useRef(new Animated.Value(1)).current;
  const to = (v) => Animated.spring(sc, { toValue:v, useNativeDriver:true, speed:30 }).start();
  return (
    <Animated.View style={{ transform:[{ scale:sc }] }}>
      <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled || loading} onPressIn={() => to(0.96)} onPressOut={() => to(1)} onPress={onPress}
        style={[{ backgroundColor:outline ? C.card : color, borderRadius:R.btn, paddingVertical:14, paddingHorizontal:20, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:8, opacity:disabled ? 0.5 : 1, borderWidth:outline ? 2 : 0, borderColor:color, minHeight:52, borderBottomWidth:outline ? 2 : 4, borderBottomColor:outline ? color : 'rgba(0,0,0,0.25)' }, style]}>
        {loading ? <Dots small color="#fff" /> : <>{icon}<Text style={[{ fontFamily:F.bold, fontSize:16, color:outline ? color : '#fff', textAlign:'center' }, Platform.OS === 'web' ? { userSelect:'none' } : null]}>{title}</Text></>}
      </Pressable>
    </Animated.View>
  );
}

// Text input with label, error text and (for passwords) a show/hide eye toggle
export function Input({ label, value, onChangeText, error, secure, kb, icon, onSubmitEditing }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom:12 }}>
      <Text style={st.lbl}>{label}</Text>
      <View style={[st.box, error && { borderColor:C.red }]}>
        {icon && <Ionicons name={icon} size={18} color={C.grey} />}
        <TextInput style={st.inp} value={value} onChangeText={onChangeText} placeholder={label} placeholderTextColor={C.grey} secureTextEntry={secure && !show} keyboardType={kb} autoCapitalize="none" autoCorrect={false} onSubmitEditing={onSubmitEditing} accessibilityLabel={label} />
        {secure && (
          <TouchableOpacity onPress={() => setShow(!show)} accessibilityRole="button" accessibilityLabel={show ? 'Hide password' : 'Show password'} hitSlop={10}>
            <Ionicons name={show ? 'eye-off' : 'eye'} size={22} color={C.blue} />
          </TouchableOpacity>)}
      </View>
      {error ? <Text style={st.err}>{error}</Text> : null}
    </View>
  );
}
const st = lazyStyles(() => StyleSheet.create({
  lbl:{ fontFamily:F.semi, color:C.text, fontSize:13, marginBottom:6 },
  box:{ flexDirection:'row', alignItems:'center', gap:10, borderWidth:1.5, borderColor:C.line, borderRadius:14, paddingHorizontal:14, backgroundColor:C.bg },
  inp:{ flex:1, paddingVertical:14, fontFamily:F.reg, color:C.text, fontSize:15 },
  err:{ color:C.red, fontFamily:F.reg, fontSize:12, marginTop:4 },
}));
