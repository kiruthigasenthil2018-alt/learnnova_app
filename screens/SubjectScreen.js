import React from 'react';
import { View, Text } from 'react-native';
import { C, F, useStore } from '../theme';
import { Page, Grid, LearnNovaHeader, LessonCard, GameCard, SectionTitle, ProgressBar, FadeIn, PdfButton } from '../components';
import { subjectHtml } from '../services/pdfService';
import { subjectOf } from '../data/curriculum';
import { STORIES, allStories, BAND_LABEL } from '../data/stories';
import { gradeProgress } from '../utils/learning';

export default function SubjectScreen({ route, navigation }) {
  const { subject, grade } = route.params, sub = subjectOf(subject), { data } = useStore();
  const p = gradeProgress(data, subject, grade);
  return (
    <Page theme={sub.theme}>
      <LearnNovaHeader title={sub.title} sub={`Grade ${grade} • ${p.done} of ${p.total} lessons done`} emoji={sub.emoji} color={sub.color}>
        <View style={{ marginTop:6 }}><ProgressBar value={p.pct} color="#FFE082" track="rgba(255,255,255,0.3)" /></View>
      </LearnNovaHeader>
      <GameCard emoji="🧠" title={`${sub.title} Quiz`} sub="10 mixed questions • +30 XP (perfect: +50)" color={sub.color} onPress={() => navigation.navigate('Quiz', { mode:'subjectQuiz', subject, grade })} />
      <PdfButton label={`📄 Download all ${sub.title} lessons as PDF`} build={() => subjectHtml(subject, grade)} />
      <SectionTitle>Lessons</SectionTitle>
      <Grid min={320} max={2} data={p.lessons} renderItem={(l, i) => <FadeIn delay={Math.min(i, 6) * 40}><LessonCard lesson={l} color={sub.color} state={l.id in data.lessons ? 'done' : 'todo'} onPress={() => navigation.navigate('Lesson', { subject, grade, idx:i })} /></FadeIn>} />
      {subject === 'english' && (<>
        <SectionTitle>Story Mode 📚 • {STORIES.length} stories with morals</SectionTitle>
        <Grid min={300} max={2} data={allStories(grade)} renderItem={(st) => <GameCard emoji={st.emoji} title={st.title} sub={`${BAND_LABEL[st.band]} • read, answer, learn the moral`} color={st.band === 'lo' ? '#43A047' : st.band === 'mid' ? '#2463EB' : '#7C4DFF'} onPress={() => navigation.navigate('Story', { id:st.id })} />} />
        <SectionTitle>Vocabulary 📖</SectionTitle>
        <GameCard emoji="🔤" title="Vocabulary" sub="8 word groups: feelings, actions, opposites and more" color="#00796B" onPress={() => navigation.navigate('Vocabulary')} />
      </>)}
    </Page>
  );
}
