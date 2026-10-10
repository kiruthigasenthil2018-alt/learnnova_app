import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { C, F, R, SHADOW } from '../theme';
import useResponsive from '../hooks/useResponsive';
import CartoonBackground from './CartoonBackground';

// Scrollable page: centred, max-width constrained, optional cartoon background and keyboard handling.
export function Page({ children, theme, max, keyboard, bg = C.bg }) {
  const r = useResponsive();
  const body = (
    <ScrollView style={{ flex:1 }} contentContainerStyle={{ alignItems:'center', padding:r.pad, paddingBottom:56 }} keyboardShouldPersistTaps="handled">
      <View style={{ width:'100%', maxWidth:max || r.maxW, gap:16, alignSelf:'center' }}>{children}</View>
    </ScrollView>
  );
  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <CartoonBackground theme={theme || 'home'} />
      {keyboard ? <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>{body}</KeyboardAvoidingView> : body}
    </View>
  );
}

// Measures its own width and lays children in as many columns as fit (no fixed pixel widths).
export function Grid({ data, renderItem, min = 260, max = 4, gap = 12 }) {
  const [w, setW] = useState(0);
  const cols = w ? Math.max(1, Math.min(max, Math.floor((w + gap) / (min + gap)))) : 1;
  const iw = w ? (w - gap * (cols - 1)) / cols : 0;
  return (
    <View style={{ width:'100%' }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap }}>
          {data.map((it, i) => <View key={it.id || it.key || i} style={{ width:iw, alignSelf:'stretch' }}>{renderItem(it, i, iw)}</View>)}
        </View>
      )}
    </View>
  );
}

export const Card = ({ children, style, onPress, label }) => {
  const base = [{ backgroundColor:C.card, borderRadius:R.card, padding:16, ...SHADOW }, style];
  return onPress
    ? <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [...base, pressed && { opacity:0.85 }]}>{children}</Pressable>
    : <View style={base}>{children}</View>;
};

export const SectionTitle = ({ children, right }) => (
  <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap:8 }}>
    <Text style={{ fontFamily:F.bold, fontSize:20, color:C.text, flexShrink:1 }} accessibilityRole="header">{children}</Text>{right}
  </View>
);

export const EmptyState = ({ emoji = '📚', text = 'No lessons found.', sub = "Let's explore another subject!" }) => (
  <View style={{ alignItems:'center', padding:28 }}>
    <Text style={{ fontSize:64 }}>{emoji}</Text>
    <Text style={{ fontFamily:F.bold, color:C.text, fontSize:18, marginTop:8, textAlign:'center' }}>{text}</Text>
    <Text style={{ fontFamily:F.reg, color:C.grey, marginTop:4, textAlign:'center' }}>{sub}</Text>
  </View>
);

export const ErrorState = ({ onRetry }) => (
  <View style={{ alignItems:'center', padding:28 }}>
    <Text style={{ fontSize:64 }}>😅</Text>
    <Text style={{ fontFamily:F.bold, color:C.text, fontSize:20, marginTop:8 }}>Oops! 😅</Text>
    <Text style={{ fontFamily:F.reg, color:C.grey, marginTop:4, textAlign:'center' }}>Something went wrong.{'\n'}Please try again.</Text>
    {onRetry ? <Pressable onPress={onRetry} accessibilityRole="button" style={{ marginTop:14, backgroundColor:C.blue, borderRadius:R.btn, paddingVertical:12, paddingHorizontal:22 }}><Text style={{ color:'#fff', fontFamily:F.bold }}>Try again</Text></Pressable> : null}
  </View>
);
