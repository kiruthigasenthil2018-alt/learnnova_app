import React from 'react';
import { Text } from 'react-native';
import { C, F, useStore, gradeOf } from '../theme';
import { Page, Grid, GameCard, LearnNovaHeader, SectionTitle } from '../components';
import { allStories, BAND_LABEL, STORIES } from '../data/stories';

// Story Mode: all 10 stories, the learner's own level first. Each ends with a moral.
export default function StoriesScreen({ navigation }) {
  const { data } = useStore(), grade = gradeOf(data.learner.level) || 3, list = allStories(grade);
  return (
    <Page theme="phonics" max={900}>
      <LearnNovaHeader title="Story Mode 📚" sub={`${STORIES.length} stories • each one has a moral`} color="#2463EB" emoji="📖" />
      <Grid min={300} max={2} data={list} renderItem={(s) => <GameCard emoji={s.emoji} title={s.title} sub={`${BAND_LABEL[s.band]} • moral included`} color={s.band === 'lo' ? '#43A047' : s.band === 'mid' ? '#2463EB' : '#7C4DFF'} onPress={() => navigation.navigate('Story', { id:s.id })} />} />
      <SectionTitle>Learn new words 📖</SectionTitle>
      <GameCard emoji="🔤" title="Vocabulary" sub="Word cards, meanings and a quiz" color="#00796B" onPress={() => navigation.navigate('Vocabulary')} />
    </Page>
  );
}
