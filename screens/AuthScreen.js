import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Apple from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { C, F, useStore, lazyStyles } from '../theme';
import { Logo, Input, Btn, Wallpaper, FadeIn, BackButton } from '../components';
import { useGoogleLogin } from '../services/googleAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PW_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const hash = (email, pw) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${email.toLowerCase()}::${pw}::learnova`);
const wait = (ms) => new Promise(r => setTimeout(r, ms));

export default function AuthScreen({ route, navigation }) {
  const { signIn } = useStore();
  const [mode, setMode] = useState(route.params?.mode || 'signup'); // login | signup | reset
  const [f, setF] = useState({ name:'', email:'', pw:'', pw2:'' });
  const [agree, setAgree] = useState(false), [err, setErr] = useState({}), [busy, setBusy] = useState(false), [info, setInfo] = useState('');
  const [fails, setFails] = useState({ n:0, until:0 });
  const set = (k) => (v) => { setF({ ...f, [k]:v }); if (err[k]) setErr({ ...err, [k]:undefined }); };
  const signup = mode === 'signup', reset = mode === 'reset';

  const GERR = {
    'not-configured':'Google sign-in is not set up yet. Add your Google client ID to the .env file and restart (see GOOGLE_LOGIN_SETUP.md).',
    popup_failed_to_open:'The Google window was blocked. Allow pop-ups for this site and try again.',
    popup_closed:'The Google window was closed before signing in.',
    script:'Could not reach Google. Check your internet connection.',
    invalid_client:'Google says this client ID is not valid. Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
    redirect_uri_mismatch:'Add this site address (for example http://localhost:8081) to "Authorised JavaScript origins" in Google Cloud.',
    access_denied:'Google sign-in was cancelled.',
  };
  const gUser = useCallback((u) => signIn(u), [signIn]);
  const gErr = useCallback((code) => setErr({ form:GERR[code] || `Google sign-in could not finish (${code}). Please try again.` }), []);
  const google = useGoogleLogin({ onUser:gUser, onError:gErr });
  const apple = async () => {
    try {
      const c = await Apple.signInAsync({ requestedScopes:[Apple.AppleAuthenticationScope.FULL_NAME, Apple.AppleAuthenticationScope.EMAIL] });
      signIn({ name:c.fullName?.givenName || 'Learner', email:c.email || `${c.user}@apple.local`, provider:'apple' });
    } catch (e) {}
  };

  const validate = () => {
    const e = {};
    if (signup && f.name.trim().length < 2) e.name = 'Enter your full name (2+ letters)';
    if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
    if (!reset) {
      if (signup) {
        if (!PW_RE.test(f.pw)) e.pw = 'Use 8+ characters with upper-case, lower-case and a number';
        if (f.pw2 !== f.pw) e.pw2 = 'Passwords do not match';
        if (!agree) e.agree = 'Please accept the terms and privacy policy';
      } else if (!f.pw) e.pw = 'Enter your password';
    }
    return e;
  };
  const submit = async () => {
    setInfo('');
    const e = validate(); setErr(e);
    if (Object.keys(e).length) return;
    if (Date.now() < fails.until) return setErr({ form:'Too many attempts. Try again in a few seconds.' });
    setBusy(true); await wait(900);
    const email = f.email.trim().toLowerCase();
    const users = JSON.parse((await AsyncStorage.getItem('users')) || '{}');
    if (reset) { setBusy(false); setInfo('If this email is registered, a reset link has been sent (demo).'); return; }
    if (signup) {
      if (users[email]) { setBusy(false); return setErr({ email:'This email is already registered. Please sign in.' }); }
      users[email] = { name:f.name.trim(), h:await hash(email, f.pw) };
      await AsyncStorage.setItem('users', JSON.stringify(users));
      setBusy(false); return signIn({ name:f.name.trim(), email, provider:'email' });
    }
    const u = users[email];
    if (!u || u.h !== (await hash(email, f.pw))) {
      const n = fails.n + 1; setFails({ n, until:n >= 5 ? Date.now() + 30000 : 0 });
      setBusy(false); return setErr({ form:n >= 5 ? 'Too many attempts. Locked for 30 seconds.' : 'Wrong email or password.' });
    }
    setBusy(false); signIn({ name:u.name, email, provider:'email' });
  };
  const checks = [['8+ characters', f.pw.length >= 8], ['Upper-case', /[A-Z]/.test(f.pw)], ['Lower-case', /[a-z]/.test(f.pw)], ['A number', /\d/.test(f.pw)]];

  return (
    <Wallpaper theme="phonics">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex:1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={{ alignSelf:'flex-start', marginBottom:4, width:'100%', maxWidth:460 }}><BackButton onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Welcome'))} /></View>
          <View style={{ marginBottom:16 }}><Logo size={52} light column /></View>
          <FadeIn style={s.card}>
            {!reset && (
              <View style={s.toggle}>
                {[['login', 'Sign In'], ['signup', 'Sign Up']].map(([m, l]) => (
                  <TouchableOpacity key={m} onPress={() => { setMode(m); setErr({}); setInfo(''); }} style={[s.tab, mode === m && s.tabOn]} accessibilityRole="button">
                    <Text style={[s.tabTxt, mode === m && { color:'#fff' }]}>{l}</Text>
                  </TouchableOpacity>))}
              </View>)}
            <Text style={s.h}>{reset ? 'Reset password' : signup ? 'Create your account' : 'Welcome back!'}</Text>
            <Text style={s.sub}>{reset ? 'We will email you a reset link.' : signup ? 'Your progress, streak and XP are saved to your account.' : 'Sign in to continue your streak.'}</Text>
            {err.form ? <View style={s.banner}><Text style={s.bannerTxt}>{err.form}</Text></View> : null}
            {info ? <View style={[s.banner, { backgroundColor:'#E8F5E9' }]}><Text style={[s.bannerTxt, { color:C.green }]}>{info}</Text></View> : null}
            {signup && <Input label="Full name" icon="person" value={f.name} onChangeText={set('name')} error={err.name} />}
            <Input label="Email" icon="mail" kb="email-address" value={f.email} onChangeText={set('email')} error={err.email} />
            {!reset && <Input label="Password" icon="lock-closed" secure value={f.pw} onChangeText={set('pw')} error={err.pw} onSubmitEditing={signup ? undefined : submit} />}
            {signup && f.pw.length > 0 && <View style={s.checks}>{checks.map(([t, ok]) => <Text key={t} style={{ fontFamily:F.reg, fontSize:12, color:ok ? C.green : C.grey }}>{ok ? '✓' : '○'} {t}</Text>)}</View>}
            {signup && <Input label="Confirm password" icon="lock-closed" secure value={f.pw2} onChangeText={set('pw2')} error={err.pw2} onSubmitEditing={submit} />}
            {signup && (
              <TouchableOpacity style={s.agree} onPress={() => setAgree(!agree)} accessibilityRole="checkbox">
                <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={22} color={err.agree ? C.red : C.blue} />
                <Text style={s.agreeTxt}>I agree to the terms of service and privacy policy</Text>
              </TouchableOpacity>)}
            {err.agree ? <Text style={{ color:C.red, fontFamily:F.reg, fontSize:12, marginBottom:8 }}>{err.agree}</Text> : null}
            <Btn title={reset ? 'Send reset link' : signup ? 'Create account' : 'Sign in'} onPress={submit} loading={busy} color={C.green} />
            {mode === 'login' && <TouchableOpacity onPress={() => { setMode('reset'); setErr({}); }}><Text style={s.link}>Forgot password?</Text></TouchableOpacity>}
            {reset && <TouchableOpacity onPress={() => { setMode('login'); setInfo(''); }}><Text style={s.link}>← Back to sign in</Text></TouchableOpacity>}
            {!reset && (<>
              <View style={s.orRow}><View style={s.line} /><Text style={s.or}>OR</Text><View style={s.line} /></View>
              <Btn outline color={C.text} title={google.busy ? 'Opening Google…' : 'Continue with Google'} loading={false} disabled={google.busy} onPress={() => { setErr({}); google.start(); }} icon={<Ionicons name="logo-google" size={20} color={C.text} />} />
              {Platform.OS === 'ios' && <View style={{ marginTop:10 }}><Btn outline color={C.text} title="Continue with Apple" onPress={apple} icon={<Ionicons name="logo-apple" size={20} color={C.text} />} /></View>}
            </>)}
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </Wallpaper>
  );
}
const s = lazyStyles(() => StyleSheet.create({
  scroll:{ flexGrow:1, justifyContent:'center', alignItems:'center', padding:16 },
  card:{ width:'100%', maxWidth:460, backgroundColor:C.card, borderRadius:24, padding:20 },
  toggle:{ flexDirection:'row', backgroundColor:'#E4E9F2', borderRadius:30, padding:4, marginBottom:16 },
  tab:{ flex:1, paddingVertical:11, borderRadius:26, alignItems:'center' }, tabOn:{ backgroundColor:C.blue }, tabTxt:{ fontFamily:F.bold, color:C.grey },
  h:{ fontFamily:F.bold, fontSize:24, color:C.text, textAlign:'center' }, sub:{ fontFamily:F.reg, color:C.grey, textAlign:'center', marginTop:4, marginBottom:16, flexShrink:1 },
  banner:{ backgroundColor:'#FDECEC', borderRadius:12, padding:12, marginBottom:12 }, bannerTxt:{ color:C.red, fontFamily:F.semi, fontSize:13 },
  checks:{ flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:-4, marginBottom:12 },
  agree:{ flexDirection:'row', gap:8, alignItems:'center', marginBottom:10 }, agreeTxt:{ flex:1, fontFamily:F.reg, color:C.text, fontSize:13 },
  link:{ textAlign:'center', color:C.blue, fontFamily:F.semi, marginTop:14 },
  orRow:{ flexDirection:'row', alignItems:'center', gap:10, marginVertical:16 }, line:{ flex:1, height:1, backgroundColor:C.line }, or:{ fontFamily:F.bold, color:C.grey },
}));
