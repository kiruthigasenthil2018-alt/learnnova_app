import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { C, F, R, useStore, gradeOf } from '../theme';
import { CartoonBackground, AIChatBubble, AIInput, LoadingAnimation, Dialog } from '../components';
import { isVoiceSupported, listen } from '../services/voiceService';
import useResponsive from '../hooks/useResponsive';
import { askAI, aiStatus, SUGGESTIONS } from '../services/aiService';

// AIScreen → aiService.askAI() → mock answer (or your backend when AI_CONFIG.url is set)
export default function AIScreen() {
  const { data } = useStore(), r = useResponsive(), ref = useRef(null);
  const [msgs, setMsgs] = useState([{ role:'assistant', text:'Hi! I am LearnNova AI 🤖\nWhat would you like to learn?' }]);
  const [status, setStatus] = useState('checking'), [text, setText] = useState(''), [busy, setBusy] = useState(false), [dlg, setDlg] = useState(null), [listening, setListening] = useState(false), micOK = useRef(false), stopRef = useRef(null);
  useEffect(() => { let on = true; aiStatus().then(x => on && setStatus(x)); return () => { on = false; }; }, []);
  const recheck = () => { setStatus('checking'); aiStatus().then(setStatus); };
  const send = async (t) => {
    const question = (typeof t === 'string' ? t : text).trim();
    if (!question || busy) return;
    setMsgs(m => [...m, { role:'user', text:question }]); setText(''); setBusy(true);
    try { const a = await askAI(question, { grade:gradeOf(data.learner.level), history:msgs.slice(-12) }); aiStatus().then(setStatus); setMsgs(m => [...m, { role:'assistant', text:a }]); }
    catch (e) { if (__DEV__) console.log(e); setMsgs(m => [...m, { role:'assistant', text:'Oops! 😅\nSomething went wrong.\nPlease try again.' }]); }
    setBusy(false);
  };
  const startVoice = () => {
    micOK.current = true; setListening(true);
    stopRef.current = listen({ onResult:(t) => { setListening(false); send(t); }, onEnd:() => setListening(false), onError:(e) => { setListening(false); if (e === 'not-allowed' || e === 'service-not-allowed') setDlg('denied'); } });
  };
  const onMic = () => {
    if (listening) { stopRef.current && stopRef.current(); return setListening(false); }
    if (!isVoiceSupported()) return setDlg('unsupported');
    micOK.current ? startVoice() : setDlg('ask');
  };
  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <CartoonBackground theme="ai" />
      <ScrollView ref={ref} onContentSizeChange={() => ref.current && ref.current.scrollToEnd({ animated:true })} contentContainerStyle={{ alignItems:'center', padding:r.pad }} keyboardShouldPersistTaps="handled" style={{ flex:1 }}>
        <View style={{ width:'100%', maxWidth:760, gap:12 }}>
          <View style={{ backgroundColor:'#7C4DFF', borderRadius:22, padding:16 }}>
            <Text style={{ color:'#fff', fontFamily:F.bold, fontSize:22 }} accessibilityRole="header">🤖 Ask LearnNova AI</Text>
            <Text style={{ color:'#E8E0FF', fontFamily:F.semi }}>Ask me anything — maths, science, words, stories!</Text>
            <Text onPress={recheck} accessibilityRole="button" accessibilityLabel="Check AI connection again" style={{ color:status === 'claude' ? '#B9F6CA' : '#FFE082', fontFamily:F.bold, fontSize:12, marginTop:6 }}>{status === 'claude' ? '● Smart AI connected' : status === 'checking' ? '… connecting' : status === 'nokey' ? '● AI server running, but no API key yet (see README)' : '● AI server not running — simple answers only (run: npm run ai) — tap to re-check'}</Text>
          </View>
          {msgs.map((m, i) => <AIChatBubble key={i} role={m.role} text={m.text} />)}
          {busy && <LoadingAnimation />}
          {msgs.length < 3 && (
            <View style={{ gap:8 }}>
              <Text style={{ fontFamily:F.bold, color:C.grey }}>Try asking:</Text>
              {SUGGESTIONS.map(s => <Pressable key={s} onPress={() => send(s)} accessibilityRole="button" style={{ backgroundColor:C.card, borderRadius:16, padding:14, borderWidth:2, borderColor:C.line, minHeight:48, justifyContent:'center' }}><Text style={{ fontFamily:F.semi, color:C.text }}>💬 {s}</Text></Pressable>)}
            </View>)}
        </View>
      </ScrollView>
      <View style={{ alignItems:'center', backgroundColor:C.card }}><View style={{ width:'100%', maxWidth:760 }}><AIInput value={text} onChange={setText} onSend={send} busy={busy} onMic={onMic} listening={listening} /></View></View>
      <Dialog visible={dlg === 'ask'} title="Microphone Permission" text="LearnNova uses the microphone so you can ask questions with your voice. Your voice is not saved."
        buttons={[{ label:'Not now', outline:true, onPress:() => setDlg(null) }, { label:'Okay', onPress:() => { setDlg(null); startVoice(); } }]} />
      <Dialog visible={dlg === 'unsupported'} title="Voice questions" text="Voice questions work in the web version for now. On phones, please type your question. 😊" buttons={[{ label:'Okay', onPress:() => setDlg(null) }]} />
      <Dialog visible={dlg === 'denied'} title="Microphone is off" text="Please allow the microphone in your browser settings, or type your question instead." buttons={[{ label:'Okay', onPress:() => setDlg(null) }]} />
    </KeyboardAvoidingView>
  );
}
