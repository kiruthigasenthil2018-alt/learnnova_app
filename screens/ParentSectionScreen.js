import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { C, F, AVATARS, useStore, levelTitle } from '../theme';
import { Page, Card, SectionTitle, Btn, SettingRow, ThemePicker, LearnNovaHeader, ReminderCard } from '../components';

export default function ParentSectionScreen({ navigation }) {
  const { settings, setSettings, profiles, activeId, deleteProfile, switchProfile } = useStore();
  const [guide, setGuide] = useState(false), [confirm, setConfirm] = useState(null);
  return (
    <Page theme="home" max={720}>
      <LearnNovaHeader title="Parent Section" sub="Settings for grown-ups" emoji="👨‍👩‍👧" color={C.blue} />
      <View style={{ flexDirection:'row', gap:10, flexWrap:'wrap' }}>
        <Btn title="Rate this App" outline color={C.blue} onPress={() => setGuide('rate')} style={{ flexGrow:1 }} />
        <Btn title="Parent Guide" color={C.blue} onPress={() => setGuide(guide === 'guide' ? false : 'guide')} style={{ flexGrow:1 }} />
      </View>
      {guide === 'rate' && <Card><Text style={{ fontFamily:F.semi, color:C.text, lineHeight:23 }}>⭐ Thank you! Rating will be available once LearnNova is published in the app stores.</Text></Card>}
      {guide === 'guide' && <Card style={{ gap:6 }}>
        <Text style={{ fontFamily:F.bold, fontSize:17, color:C.text }}>Parent Guide</Text>
        {['Create one profile for each child — progress is saved separately.', 'Ages 2–5 use the Nursery path (phonics, numbers, colors, shapes, rhymes).', 'Grades 1–5 follow English, Maths, Science and Social Science lessons.', '10–15 minutes a day is plenty. The daily target and streak build the habit.', 'Use the toggles below to hide tabs or turn off sound and backgrounds.'].map(t => <Text key={t} style={{ fontFamily:F.reg, color:C.grey, lineHeight:22 }}>• {t}</Text>)}
      </Card>}
      <SectionTitle>Preferences</SectionTitle>
      <Card style={{ paddingVertical:4 }}>
        <SettingRow emoji="🎮" title="Show Games tab" value={settings.showGames} onChange={(v) => setSettings({ showGames:v })} />
        <SettingRow emoji="📖" title="Show Dictionary tab" value={settings.showDictionary} onChange={(v) => setSettings({ showDictionary:v })} />
        <SettingRow emoji="🤖" title="Show AI Assistant tab" value={settings.showAI} onChange={(v) => setSettings({ showAI:v })} />
        <SettingRow emoji="🔊" title="Sound and read-aloud" sub="Letters, words, stories and rhymes" value={settings.sound} onChange={(v) => setSettings({ sound:v })} />
        <SettingRow emoji="🎨" title="Cartoon backgrounds" value={settings.backgrounds} onChange={(v) => setSettings({ backgrounds:v })} />
      </Card>
      <SectionTitle>Reminder</SectionTitle>
      <Card><ReminderCard /></Card>
      <SectionTitle>Appearance</SectionTitle>
      <Card><ThemePicker /></Card>
      <SectionTitle>Learners</SectionTitle>
      <Card style={{ gap:10 }}>
        {profiles.map(p => (
          <View key={p.id} style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
            <View style={{ width:46, height:46, borderRadius:23, backgroundColor:AVATARS[p.avatar || 0][1], alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:26 }}>{AVATARS[p.avatar || 0][0]}</Text></View>
            <View style={{ flex:1 }}><Text style={{ fontFamily:F.bold, color:C.text }}>{p.name}{p.id === activeId ? '  (playing now)' : ''}</Text><Text style={{ fontFamily:F.semi, fontSize:12, color:C.grey }}>{levelTitle(p.level)}</Text></View>
            {confirm === p.id ? (<><Btn title="Delete?" color={C.red} onPress={() => { deleteProfile(p.id); setConfirm(null); }} style={{ minHeight:42, paddingVertical:6 }} /><Btn title="No" outline color={C.grey} onPress={() => setConfirm(null)} style={{ minHeight:42, paddingVertical:6 }} /></>)
              : <Btn title="Remove" outline color={C.red} onPress={() => setConfirm(p.id)} style={{ minHeight:42, paddingVertical:6 }} />}
          </View>))}
        <Btn title="＋ Add another learner" outline color={C.blue} onPress={() => { switchProfile(); }} />
        <Text style={{ fontFamily:F.semi, fontSize:12, color:C.grey }}>"Add another learner" opens the profile screen where you can tap NEW.</Text>
      </Card>
    </Page>
  );
}
