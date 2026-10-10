import React from 'react';
import { View, Text } from 'react-native';
import { C, F, useStore } from '../theme';
import { Page, Grid, LearnNovaHeader, DailyTarget, KidTile, FadeIn, Btn, SectionTitle } from '../components';
import { dailyProgress } from '../data/targets';
import { NURSERY_TILES } from '../data/nurseryData';

export default function NurseryHome({ navigation }) {
  const { data } = useStore();
  const prog = dailyProgress(data.counts, 'nursery');
  return (
    <Page theme="phonics">
      <LearnNovaHeader title={`Hello, ${data.learner.name}! 🧸`} sub="Let's learn and play today!" emoji="🌈" color="#EC6A8E">
        <Text style={{ color:'#fff', fontFamily:F.bold }}>🔤 {data.letters.length}/26 letters learned</Text>
      </LearnNovaHeader>
      <DailyTarget progress={prog} title="🌟 Today's Learning Goal" />
      <SectionTitle right={<Btn title="Change" outline color={C.blue} onPress={() => navigation.navigate('Level')} style={{ minHeight:40, paddingVertical:6 }} />}>Pick something to explore</SectionTitle>
      <Grid min={135} max={5} gap={12} data={NURSERY_TILES} renderItem={(t, i) => (
        <FadeIn delay={Math.min(i, 8) * 40}><KidTile emoji={t.emoji} title={t.title} color={t.color} onPress={() => navigation.navigate(...t.to)} /></FadeIn>)} />
    </Page>
  );
}
