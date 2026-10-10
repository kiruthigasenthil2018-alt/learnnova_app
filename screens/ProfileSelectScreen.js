import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { C, F, AVATARS, useStore, levelTitle } from '../theme';
import { Logo, Wallpaper, FadeIn, Btn } from '../components';

// "Who's learning?" — pick a child profile, add a new one, or open the parent area
export default function ProfileSelectScreen({ navigation }) {
  const { profiles, selectProfile, signOut } = useStore();
  return (
    <Wallpaper theme="home">
      <ScrollView contentContainerStyle={{ flexGrow:1, alignItems:'center', justifyContent:'center', padding:20, gap:18 }}>
        <Logo size={46} light column />
        <Text style={{ fontFamily:F.bold, fontSize:26, color:'#fff', textAlign:'center' }} accessibilityRole="header">Who is learning today? 🌟</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:22, justifyContent:'center', maxWidth:760 }}>
          {profiles.map((p, i) => { const [e, c] = AVATARS[p.avatar || 0]; return (
            <FadeIn key={p.id} delay={i * 80}>
              <Pressable onPress={() => selectProfile(p.id)} accessibilityRole="button" accessibilityLabel={`${p.name}, ${levelTitle(p.level)}`} style={{ alignItems:'center', gap:6, width:130 }}>
                <View style={{ width:110, height:110, borderRadius:55, backgroundColor:c, borderWidth:5, borderColor:'#fff', alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:60 }}>{e}</Text></View>
                <Text style={{ fontFamily:F.bold, fontSize:18, color:'#fff', textAlign:'center' }} numberOfLines={1}>{p.name}</Text>
                <Text style={{ fontFamily:F.semi, fontSize:12, color:'#DCE6FF' }}>{levelTitle(p.level)}</Text>
              </Pressable>
            </FadeIn>); })}
          <FadeIn delay={profiles.length * 80}>
            <Pressable onPress={() => navigation.navigate('Setup')} accessibilityRole="button" accessibilityLabel="Add a new learner" style={{ alignItems:'center', gap:6, width:130 }}>
              <View style={{ width:110, height:110, borderRadius:55, backgroundColor:'#26A69A', borderWidth:5, borderColor:'#fff', alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:40, color:'#fff', fontFamily:F.bold }}>＋</Text><Text style={{ color:'#fff', fontFamily:F.bold, fontSize:13 }}>NEW</Text></View>
              <Text style={{ fontFamily:F.bold, fontSize:16, color:'#fff' }}>Add learner</Text>
            </Pressable>
          </FadeIn>
        </View>
        <View style={{ gap:10, width:'100%', maxWidth:300 }}>
          <Btn title="🔒  For Parents" outline color="#fff" onPress={() => navigation.navigate('ParentGate')} />
          <Btn title="Log out" outline color="#FFCDD2" onPress={signOut} />
        </View>
      </ScrollView>
    </Wallpaper>
  );
}
