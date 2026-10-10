import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { C, F, R, AVATARS, GOALS, useStore } from '../theme';
import { Logo, Btn, Wallpaper, FadeIn, Float, LevelPicker } from '../components';

// Create a child profile in 4 gentle steps: name → age → avatar → level
const AGE_LEVEL = { 2:'nursery', 3:'nursery', 4:'nursery', 5:'nursery', 6:'g1', 7:'g2', 8:'g3' };
export default function SetupScreen({ navigation }) {
  const { user, profiles, createLearner } = useStore();
  const [step, setStep] = useState(0), [name, setName] = useState(profiles.length ? '' : user.name.split(' ')[0]), [age, setAge] = useState(null);
  const [av, setAv] = useState(0), [page, setPage] = useState(0), [level, setLevel] = useState(null), [goal, setGoal] = useState(50), [err, setErr] = useState('');
  const first = name.trim() || 'your child';
  const back = () => { setErr(''); if (step > 0) setStep(step - 1); else if (navigation.canGoBack()) navigation.goBack(); };
  const next = () => {
    setErr('');
    if (step === 0 && name.trim().length < 2) return setErr('Please type a first name (2+ letters)');
    if (step === 1 && !age) return setErr('Please pick an age');
    if (step === 2) { if (!level) setLevel(AGE_LEVEL[age] || 'g3'); }
    if (step === 3) { if (!level) return setErr('Please choose who is learning today'); return createLearner({ name:name.trim(), age, level, avatar:av, goal }); }
    setStep(step + 1);
  };
  const perPage = 8, pages = Math.ceil(AVATARS.length / perPage);
  const Round = ({ label, onPress, right }) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
      {right ? <Text style={{ color:'#fff', fontFamily:F.bold, fontSize:16 }}>{label}</Text> : null}
      <View style={{ width:52, height:52, borderRadius:26, backgroundColor:right ? C.green : '#B0BEC5', alignItems:'center', justifyContent:'center', borderBottomWidth:4, borderBottomColor:'rgba(0,0,0,0.25)' }}><Text style={{ color:'#fff', fontSize:26, fontFamily:F.bold }}>{right ? '›' : '‹'}</Text></View>
    </Pressable>
  );
  const Q = ({ children }) => <Text style={{ fontFamily:F.bold, fontSize:26, color:C.text, textAlign:'center', marginBottom:14 }} accessibilityRole="header">{children}</Text>;
  return (
    <Wallpaper theme="phonics">
      <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14 }}>
          <Round label="Back" onPress={back} /><Logo size={30} light /><Round label="Next" onPress={next} right />
        </View>
        <ScrollView contentContainerStyle={{ flexGrow:1, alignItems:'center', justifyContent:'center', padding:16 }} keyboardShouldPersistTaps="handled">
          <FadeIn key={step} style={{ width:'100%', maxWidth:620, backgroundColor:C.card, borderRadius:28, padding:22 }}>
            {step === 0 && (<><Q>What is your child's first name?</Q>
              <TextInput style={{ borderWidth:3, borderColor:C.blue, borderRadius:30, paddingVertical:16, paddingHorizontal:22, fontFamily:F.bold, fontSize:22, color:C.text, backgroundColor:C.bg }} value={name} onChangeText={setName} placeholder="First name" placeholderTextColor={C.grey} accessibilityLabel="First name" autoFocus onSubmitEditing={next} /></>)}
            {step === 1 && (<><Q>What is {first}'s age?</Q>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
                {[2, 3, 4, 5, 6, 7, 8].map(a => <Pressable key={a} onPress={() => { setAge(a); setLevel(AGE_LEVEL[a]); }} accessibilityRole="button" accessibilityState={{ selected:age === a }} style={{ width:64, height:64, borderRadius:32, borderWidth:3, borderColor:C.blue, backgroundColor:age === a ? C.blue : C.card, alignItems:'center', justifyContent:'center' }}><Text style={{ fontFamily:F.bold, fontSize:24, color:age === a ? '#fff' : C.blue }}>{a === 8 ? '8+' : a}</Text></Pressable>)}
              </View></>)}
            {step === 2 && (<><Q>Select an avatar</Q>
              <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
                <Pressable onPress={() => setPage((page + pages - 1) % pages)} accessibilityRole="button" accessibilityLabel="Previous avatars" style={{ width:40, height:60, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:34, color:C.blue, fontFamily:F.bold }}>‹</Text></Pressable>
                <View style={{ flex:1, flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
                  {AVATARS.slice(page * perPage, page * perPage + perPage).map(([e, c], k) => { const i = page * perPage + k; return (
                    <Pressable key={i} onPress={() => setAv(i)} accessibilityRole="button" accessibilityLabel={`Avatar ${i + 1}`} style={{ width:72, height:72, borderRadius:36, backgroundColor:c, alignItems:'center', justifyContent:'center', borderWidth:av === i ? 5 : 0, borderColor:C.text }}><Text style={{ fontSize:38 }}>{e}</Text></Pressable>); })}
                </View>
                <Pressable onPress={() => setPage((page + 1) % pages)} accessibilityRole="button" accessibilityLabel="Next avatars" style={{ width:40, height:60, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:34, color:C.blue, fontFamily:F.bold }}>›</Text></Pressable>
              </View></>)}
            {step === 3 && (<><Q>Who is learning today? 🌟</Q>
              <LevelPicker value={level} onChange={setLevel} />
              <Text style={{ fontFamily:F.bold, color:C.text, marginTop:16, marginBottom:8 }}>Daily XP goal</Text>
              <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10 }}>{GOALS.map(([v, t, sub]) => (
                <Pressable key={v} onPress={() => setGoal(v)} accessibilityRole="button" style={{ flexGrow:1, flexBasis:'30%', minWidth:90, borderWidth:2, borderColor:goal === v ? C.green : C.line, backgroundColor:goal === v ? C.mint : C.card, borderRadius:14, padding:10, alignItems:'center' }}><Text style={{ fontFamily:F.bold, color:C.text }}>{t}</Text><Text style={{ fontFamily:F.semi, color:C.grey, fontSize:12 }}>{sub}</Text></Pressable>))}</View></>)}
            {err ? <Text style={{ color:C.red, fontFamily:F.semi, textAlign:'center', marginTop:14 }}>{err}</Text> : null}
            {step === 3 ? <View style={{ marginTop:16 }}><Btn title="Start learning" color={C.green} onPress={next} /></View> : null}
            <Text style={{ textAlign:'center', color:C.grey, fontFamily:F.semi, marginTop:14 }}>Step {step + 1} of 4</Text>
          </FadeIn>
          <View style={{ position:'absolute', right:12, bottom:8 }}><Float><Text style={{ fontSize:56 }}>🐘</Text></Float></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Wallpaper>
  );
}
