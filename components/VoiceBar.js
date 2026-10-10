import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, SHADOW } from '../theme';
import { useVoice, toggleVoice, stopVoice } from '../services/audioService';
import useResponsive from '../hooks/useResponsive';

// Floating Pause / Play / Stop controls: shows up whenever ANY voice or sound is playing, on every page.
export function VoiceBar() {
  const v = useVoice(), r = useResponsive();
  if (!v.active) return null;
  const Btn = ({ icon, label, onPress, color }) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6}
      style={({ pressed }) => ({ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:color, borderRadius:R.pill, paddingVertical:10, paddingHorizontal:18, minHeight:44, opacity:pressed ? 0.8 : 1 })}>
      <Ionicons name={icon} size={22} color="#fff" /><Text style={{ color:'#fff', fontFamily:F.bold, fontSize:15, ...(Platform.OS === 'web' ? { userSelect:'none' } : null) }}>{label}</Text>
    </Pressable>
  );
  return (
    <View pointerEvents="box-none" style={{ position:'absolute', left:0, right:0, bottom:r.isMobile ? 84 : 24, alignItems:'center', zIndex:100 }}>
      <View style={{ flexDirection:'row', alignItems:'center', gap:8, backgroundColor:C.card, borderRadius:R.pill, padding:6, borderWidth:2, borderColor:C.line, ...SHADOW }}>
        <Text style={{ fontSize:20, marginLeft:8 }}>{v.paused ? '⏸️' : '🔊'}</Text>
        <Btn icon={v.paused ? 'play' : 'pause'} label={v.paused ? 'Play' : 'Pause'} color={C.blue} onPress={toggleVoice} />
        <Btn icon="stop" label="Stop" color={C.red || '#E53935'} onPress={stopVoice} />
      </View>
    </View>
  );
}
