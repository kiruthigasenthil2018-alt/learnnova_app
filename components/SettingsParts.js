import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, R, PALETTES, useStore } from '../theme';

// ON/OFF row (parent section style)
export const SettingRow = ({ emoji, title, sub, value, onChange }) => (
  <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked:value }} accessibilityLabel={title}
    style={{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:12, minHeight:60 }}>
    <Text style={{ fontSize:30 }}>{emoji}</Text>
    <View style={{ flex:1 }}><Text style={{ fontFamily:F.bold, fontSize:16, color:C.text }}>{title}</Text>{sub ? <Text style={{ fontFamily:F.semi, fontSize:12, color:C.grey }}>{sub}</Text> : null}</View>
    <View style={{ width:74, height:38, borderRadius:19, backgroundColor:value ? C.blue : C.line, justifyContent:'center', paddingHorizontal:5, alignItems:value ? 'flex-end' : 'flex-start' }}>
      <View style={{ position:'absolute', [value ? 'left' : 'right']:10, top:10 }}><Text style={{ fontFamily:F.bold, fontSize:12, color:value ? '#fff' : C.grey }}>{value ? 'ON' : 'OFF'}</Text></View>
      <View style={{ width:28, height:28, borderRadius:14, backgroundColor:C.card }} />
    </View>
  </Pressable>
);

// Light / Dark / System + colour palettes
export function ThemePicker() {
  const { settings, setSettings } = useStore();
  const Chip = ({ on, label, onPress }) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected:on }} style={{ paddingVertical:10, paddingHorizontal:16, borderRadius:20, minHeight:46, justifyContent:'center', backgroundColor:on ? C.blue : C.card, borderWidth:2, borderColor:on ? C.blue : C.line }}>
      <Text style={{ fontFamily:F.bold, color:on ? '#fff' : C.text }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ gap:12 }}>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
        {[['light', '☀️ Light'], ['dark', '🌙 Dark'], ['system', '📱 Auto']].map(([k, l]) => <Chip key={k} on={settings.mode === k} label={l} onPress={() => setSettings({ mode:k })} />)}
      </View>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10 }}>
        {Object.entries(PALETTES).map(([k, p]) => (
          <Pressable key={k} onPress={() => setSettings({ palette:k })} accessibilityRole="button" accessibilityState={{ selected:settings.palette === k }} accessibilityLabel={p.name}
            style={{ alignItems:'center', gap:4, padding:8, borderRadius:16, borderWidth:3, borderColor:settings.palette === k ? C.text : 'transparent', backgroundColor:C.card, minWidth:84 }}>
            <View style={{ width:44, height:44, borderRadius:22, backgroundColor:p.blue, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:22 }}>{p.emoji}</Text></View>
            <Text style={{ fontFamily:F.semi, fontSize:11, color:C.text, textAlign:'center' }}>{p.name}</Text>
          </Pressable>))}
      </View>
    </View>
  );
}
