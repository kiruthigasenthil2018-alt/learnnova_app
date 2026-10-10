import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, R, AVATARS, GOALS, SHADOW, useStore, isNursery, gradeOf, levelTitle } from '../theme';
import { Page, Grid, Card, Btn, Float, FadeIn, StatTile, SectionTitle, AchievementBadge, GameCard, ThemePicker, ReminderCard } from '../components';
import { SUBJECTS } from '../data/curriculum';
import { ACHIEVEMENTS } from '../data/achievementData';
import { gradeProgress } from '../utils/learning';

export default function ProfileScreen({ navigation }) {
  const { data, user, level, updateLearner, resetProgress, signOut, switchProfile } = useStore();
  const l = data.learner, [e, c] = AVATARS[l.avatar || 0], grade = gradeOf(l.level), nursery = isNursery(l.level);
  const lessons = Object.keys(data.lessons).length;
  return (
    <Page theme="home" max={760}>
      <FadeIn><Card style={{ alignItems:'center', gap:6 }}>
        <Float><View style={{ width:96, height:96, borderRadius:48, backgroundColor:c, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:50 }}>{e}</Text></View></Float>
        <Text style={{ fontFamily:F.bold, fontSize:24, color:C.text }}>Hello, {l.name} 👋</Text>
        <Text style={{ fontFamily:F.semi, color:C.grey }}>{levelTitle(l.level)} • {user.email}</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'center', marginTop:6 }}>
          <Btn title="Change grade" outline color={C.blue} onPress={() => navigation.navigate('Level')} style={{ minWidth:150 }} />
          <Btn title="Switch learner" outline color={C.blue} onPress={switchProfile} style={{ minWidth:150 }} />
        </View>
      </Card></FadeIn>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10 }}>
        <StatTile emoji="🔥" value={data.streak} label="Streak" /><StatTile emoji="⭐" value={data.xp} label="XP" /><StatTile emoji="📚" value={lessons} label="Lessons" /><StatTile emoji="🏆" value={data.badges.length} label="Achievements" />
      </View>
      {!nursery && (<>
        <SectionTitle>My Subjects</SectionTitle>
        <Grid min={240} max={2} data={SUBJECTS} renderItem={(s) => <GameCard emoji={s.emoji} title={s.title} sub={`${Math.round(gradeProgress(data, s.id, grade).pct * 100)}% complete`} color={s.color} onPress={() => navigation.navigate('Subject', { subject:s.id, grade })} />} />
      </>)}
      <GameCard emoji="📊" title="Learning Progress" sub="Charts and parent summary" color={C.blue} onPress={() => navigation.navigate('Progress')} />
      <SectionTitle>🏆 Achievements</SectionTitle>
      <Grid min={140} max={5} data={ACHIEVEMENTS} renderItem={(a) => <AchievementBadge a={a} unlocked={data.badges.includes(a.id)} />} />
      <SectionTitle>⏰ Daily reminder</SectionTitle>
      <Card><ReminderCard /></Card>
      <SectionTitle>🎨 App theme</SectionTitle>
      <Card><ThemePicker /></Card>
      <GameCard emoji="🔒" title="Parent Section" sub="Settings for grown-ups" color={C.purple} onPress={() => navigation.navigate('ParentGate')} />
      <SectionTitle>Daily XP goal</SectionTitle>
      <View style={{ flexDirection:'row', gap:10, flexWrap:'wrap' }}>
        {GOALS.map(([v, t]) => <Pressable key={v} onPress={() => updateLearner({ goal:v })} accessibilityRole="button" accessibilityState={{ selected:l.goal === v }} style={{ flexGrow:1, minWidth:100, minHeight:52, borderWidth:2, borderColor:l.goal === v ? C.green : C.line, backgroundColor:l.goal === v ? C.mint : C.card, borderRadius:14, padding:12, alignItems:'center', justifyContent:'center' }}><Text style={{ fontFamily:F.bold, color:C.text }}>{t} • {v} XP</Text></Pressable>)}
      </View>
      <View style={{ gap:10, marginTop:8 }}>
        <Btn outline title="Reset progress" color={C.grey} onPress={resetProgress} />
        <Btn outline title="Log out" color={C.red} onPress={signOut} />
      </View>
    </Page>
  );
}
