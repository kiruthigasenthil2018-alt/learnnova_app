import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Animated, Easing, StyleSheet, Modal, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, F, R, SHADOW } from '../theme';
import { speak, playClip, useVoice, toggleVoice } from '../services/audioService';
import { clipFor } from '../services/animalSounds';
import { savePdf } from '../services/pdfService';
import { Dots } from './base';
import { Fireworks } from './Celebrate';

// 🔊 Plays `say` through the audio service. If no audio engine exists we show the pronunciation text instead of crashing.
export function AudioButton({ say, label = 'Hear it', size = 'md', color = C.blue, note, style, rate, clip }) {
  const [fallback, setFallback] = useState(false);
  const v = useVoice(), myKey = clip ? 'clip:' + clip : say, mine = v.active && v.key === myKey;   // this button is the one playing
  const press = async () => {
    if (mine) return toggleVoice();                                  // playing -> Pause, paused -> Resume
    const ok = (clip && await playClip(clipFor(clip), myKey)) || await speak(say, rate ? { rate } : {}); setFallback(!ok); if (!ok) setTimeout(() => setFallback(false), 4000);
  };
  const big = size === 'lg';
  return (
    <View style={[{ alignItems:'center' }, style]}>
      <Pressable onPress={press} accessibilityRole="button" accessibilityLabel={mine ? (v.paused ? `Resume: ${label}` : `Pause: ${label}`) : `Play sound: ${label}`}
        style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', gap:8, backgroundColor:color, borderRadius:R.pill, paddingVertical:big ? 16 : 11, paddingHorizontal:big ? 26 : 18, minHeight:big ? 60 : 48, opacity:pressed ? 0.8 : 1, borderBottomWidth:4, borderBottomColor:'rgba(0,0,0,0.22)' }]}>
        <Ionicons name={mine ? (v.paused ? 'play' : 'pause') : 'volume-high'} size={big ? 28 : 22} color="#fff" />
        <Text style={{ color:'#fff', fontFamily:F.bold, fontSize:big ? 18 : 15 }}>{mine ? (v.paused ? 'Resume' : 'Pause') : label}</Text>
      </Pressable>
      {fallback ? <Text style={{ marginTop:6, fontFamily:F.semi, color:C.grey, textAlign:'center' }}>Say it like: “{note || say}”</Text> : null}
    </View>
  );
}

// Confetti + stars that burst once when mounted (bigger = several fireworks).
export function CelebrationAnimation({ count = 14, big }) { return <Fireworks bursts={big ? 3 : 1} count={Math.max(count, 12)} big={big} />; }

// Gentle left-right wobble. Change `trigger` to replay it.
export function ShakeView({ trigger, children, style }) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    Animated.sequence([6, -6, 4, -4, 0].map(v => Animated.timing(x, { toValue:v, duration:70, useNativeDriver:true }))).start();
  }, [trigger]);
  return <Animated.View style={[style, { transform:[{ translateX:x }] }]}>{children}</Animated.View>;
}

export const LoadingAnimation = ({ text = '🤖 LearnNova AI is thinking...' }) => (
  <View style={{ flexDirection:'row', alignItems:'center', gap:10, alignSelf:'flex-start', backgroundColor:C.card, borderRadius:18, padding:12, ...SHADOW }} accessibilityLabel="LearnNova AI is thinking">
    <Text style={{ fontFamily:F.semi, color:C.text, flexShrink:1 }}>{text}</Text><Dots small />
  </View>
);

export const AIChatBubble = ({ role, text }) => {
  const me = role === 'user';
  return (
    <View style={{ flexDirection:'row', gap:8, alignSelf:me ? 'flex-end' : 'flex-start', maxWidth:'92%' }}>
      {!me && <Text style={{ fontSize:26 }}>🤖</Text>}
      <View style={{ flexShrink:1, padding:14, borderRadius:18, backgroundColor:me ? C.blue : C.card, ...SHADOW }}>
        <Text style={{ fontFamily:F.reg, fontSize:15, lineHeight:23, color:me ? '#fff' : C.text }} selectable>{text}</Text>
      </View>
    </View>
  );
};

export function AIInput({ value, onChange, onSend, busy, onMic, listening }) {
  return (
    <View style={{ flexDirection:'row', gap:8, alignItems:'center', backgroundColor:C.card, padding:10, borderTopWidth:1, borderTopColor:C.line }}>
      <TextInput style={{ flex:1, backgroundColor:C.bg, borderRadius:R.btn, paddingHorizontal:14, paddingVertical:12, fontFamily:F.reg, fontSize:15, color:C.text, minHeight:48 }}
        value={value} onChangeText={onChange} onSubmitEditing={onSend} placeholder="Type your question..." placeholderTextColor={C.grey} accessibilityLabel="Type your question" returnKeyType="send" />
      <Pressable onPress={onMic} accessibilityRole="button" accessibilityLabel={listening ? 'Listening. Tap to stop' : 'Ask with your voice'} style={{ width:48, height:48, borderRadius:24, backgroundColor:listening ? C.red : C.sky, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:22 }}>{listening ? '🔴' : '🎤'}</Text></Pressable>
      <Pressable onPress={onSend} disabled={busy} accessibilityRole="button" accessibilityLabel="Send question" style={{ backgroundColor:busy ? C.grey : C.blue, borderRadius:R.btn, paddingHorizontal:18, minHeight:48, justifyContent:'center' }}><Text style={{ color:'#fff', fontFamily:F.bold }}>Send</Text></Pressable>
    </View>
  );
}

export function DictionarySearch({ value, onChange, onSearch }) {
  return (
    <View style={{ flexDirection:'row', gap:8 }}>
      <View style={{ flex:1, flexDirection:'row', alignItems:'center', gap:8, backgroundColor:C.card, borderRadius:R.btn, borderWidth:2, borderColor:C.line, paddingHorizontal:12 }}>
        <Text style={{ fontSize:18 }}>🔍</Text>
        <TextInput style={{ flex:1, paddingVertical:14, fontFamily:F.semi, fontSize:16, color:C.text }} value={value} onChangeText={onChange} onSubmitEditing={() => onSearch(value)} placeholder="Search a word" placeholderTextColor={C.grey} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Search a word" returnKeyType="search" />
      </View>
      <Pressable onPress={() => onSearch(value)} accessibilityRole="button" accessibilityLabel="Search" style={{ backgroundColor:C.blue, borderRadius:R.btn, width:56, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:22 }}>🔎</Text></Pressable>
    </View>
  );
}

export function DictionaryResult({ entry, kid, image }) {
  if (kid) return (
    <View style={{ backgroundColor:C.card, borderRadius:R.card, padding:20, alignItems:'center', gap:6, ...SHADOW }}>
      <Text style={{ fontFamily:F.bold, fontSize:30, color:C.text }}>{entry.word.toUpperCase()}</Text>
      <View style={{ width:'100%', maxWidth:240, aspectRatio:1, borderRadius:24, backgroundColor:C.cream, alignItems:'center', justifyContent:'center', overflow:'hidden' }}>{image ? <Image source={{ uri:image }} resizeMode="cover" style={{ width:'100%', height:'100%' }} accessibilityLabel={`Picture of ${entry.word}`} /> : <Text style={{ fontSize:110 }}>{entry.emoji}</Text>}</View>
      <Text style={{ fontFamily:F.bold, fontSize:26, color:C.blue, textTransform:'capitalize' }}>{entry.word}</Text>
      <Text style={{ fontFamily:F.semi, fontSize:18, color:C.text, textAlign:'center', lineHeight:26 }}>{entry.meaning}</Text>
      {entry.pos ? <Text style={{ fontFamily:F.semi, color:C.grey }}>({entry.pos})</Text> : null}
      {entry.example ? <><Text style={{ fontFamily:F.bold, color:C.grey, marginTop:8 }}>Example:</Text>
      <Text style={{ fontFamily:F.semi, fontSize:18, color:C.text, textAlign:'center' }}>{entry.example}</Text></> : null}
      <AudioButton say={`${entry.word}. ${entry.meaning}`} label="Hear it" note={entry.pron} style={{ marginTop:10 }} />
    </View>
  );
  const Row = ({ t, children }) => (<View style={{ marginTop:12 }}><Text style={{ fontFamily:F.bold, color:C.grey, fontSize:13 }}>{t}</Text>{children}</View>);
  return (
    <View style={{ backgroundColor:C.card, borderRadius:R.card, padding:18, ...SHADOW }}>
      <Text style={{ fontFamily:F.bold, fontSize:28, color:C.text, flexShrink:1 }}>{entry.word.toUpperCase()} {entry.emoji}</Text>
      {entry.pron ? <Row t="Pronunciation:"><Text style={{ fontFamily:F.semi, fontSize:17, color:C.blue }}>{entry.pron}</Text></Row> : null}
      <Row t={entry.pos ? `Meaning (${entry.pos}):` : 'Meaning:'}><Text style={{ fontFamily:F.reg, fontSize:16, color:C.text, lineHeight:24 }}>{entry.meaning}</Text></Row>
      {entry.more && entry.more.length ? <Row t="More meanings:">{entry.more.map(m => <Text key={m} style={{ fontFamily:F.reg, fontSize:15, color:C.text, lineHeight:23 }}>• {m}</Text>)}</Row> : null}
      {entry.example ? <Row t="Example:"><Text style={{ fontFamily:F.reg, fontSize:16, color:C.text, lineHeight:24 }}>{entry.example}</Text></Row> : null}
      {entry.similar && entry.similar.length ? <Row t="Similar words:"><Text style={{ fontFamily:F.semi, fontSize:16, color:C.text }}>{entry.similar.join('  •  ')}</Text></Row> : null}
      {entry.source ? <Text style={{ fontFamily:F.reg, fontSize:12, color:C.grey, marginTop:12 }}>Source: {entry.source}</Text> : null}
      <AudioButton say={entry.word} label="Say the word" note={entry.pron} style={{ marginTop:10, alignSelf:'flex-start' }} />
    </View>
  );
}

// Friendly pop-up dialog (permission / confirmation)
export function Dialog({ visible, title, text, buttons = [] }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => buttons[0] && buttons[0].onPress()}>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center', padding:20 }}>
        <View style={{ width:'100%', maxWidth:420, backgroundColor:C.card, borderRadius:28, padding:24, gap:14, alignItems:'center' }} accessibilityViewIsModal>
          <Text style={{ fontFamily:F.bold, fontSize:24, color:C.text, textAlign:'center' }} accessibilityRole="header">{title}</Text>
          <Text style={{ fontFamily:F.semi, fontSize:16, color:C.text, textAlign:'center', lineHeight:24 }}>{text}</Text>
          <View style={{ flexDirection:'row', gap:10, flexWrap:'wrap', justifyContent:'center', width:'100%' }}>
            {buttons.map(b => (
              <Pressable key={b.label} onPress={b.onPress} accessibilityRole="button" style={{ flexGrow:1, minWidth:120, minHeight:50, borderRadius:25, backgroundColor:b.outline ? '#B0BEC5' : '#26A69A', alignItems:'center', justifyContent:'center', paddingHorizontal:20 }}>
                <Text style={{ color:'#fff', fontFamily:F.bold, fontSize:16 }}>{b.label}</Text>
              </Pressable>))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// "Download PDF" button: builds the printable HTML, saves/prints it, and explains if something is missing
export function PdfButton({ build, label = '📄 Download PDF', style }) {
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState(null);
  const press = async () => {
    setBusy(true);
    const res = await savePdf(build());
    setBusy(false);
    if (!res.ok) setMsg(res.reason === 'popup' ? 'Your browser blocked the pop-up. Allow pop-ups for this site and try again.' : res.reason === 'missing' ? 'To save PDFs on your phone, run: npx expo install expo-print expo-sharing' : 'Sorry, the PDF could not be made. Please try again.');
    else if (Platform.OS === 'web') setMsg('Your print window is open. Choose “Save as PDF” as the printer.');
  };
  return (
    <View style={style}>
      <Pressable onPress={press} disabled={busy} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ flexDirection:'row', gap:8, alignItems:'center', justifyContent:'center', minHeight:52, borderRadius:16, borderWidth:2, borderColor:C.blue, backgroundColor:C.card, opacity:pressed || busy ? 0.7 : 1, paddingHorizontal:16 })}>
        <Text style={{ fontFamily:F.bold, color:C.blue, fontSize:16 }}>{busy ? 'Preparing…' : label}</Text>
      </Pressable>
      <Dialog visible={!!msg} title="PDF" text={msg || ''} buttons={[{ label:'Okay', onPress:() => setMsg(null) }]} />
    </View>
  );
}
