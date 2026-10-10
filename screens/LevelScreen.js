import React from 'react';
import { Text } from 'react-native';
import { C, F, useStore } from '../theme';
import { Page, LevelPicker, FadeIn } from '../components';

// "Who is learning today?" — reachable from Home and the Learn dashboards
export default function LevelScreen({ navigation }) {
  const { data, updateLearner } = useStore();
  return (
    <Page theme="home" max={720}>
      <FadeIn><Text style={{ fontFamily:F.bold, fontSize:28, color:C.text, textAlign:'center' }} accessibilityRole="header">Who is learning today? 🌟</Text></FadeIn>
      <LevelPicker value={data.learner.level} onChange={(id) => { updateLearner({ level:id }); navigation.navigate('Main', { screen:'Learn' }); }} />
    </Page>
  );
}
