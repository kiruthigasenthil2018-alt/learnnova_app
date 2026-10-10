import React from 'react';
import { View, Text } from 'react-native';
import { C, F, R, useStore, gradeOf, levelTitle } from '../theme';
import { Page, Grid, Card, SectionTitle, Btn, LearnNovaHeader, SubjectCard, DailyTarget, ProgressBar, GameCard, FadeIn } from '../components';
import { SUBJECTS } from '../data/curriculum';
import { dailyProgress } from '../data/targets';
import { continueFor, gradeProgress, greeting, overallPct } from '../utils/learning';

export default function GradeHome({ navigation }) {
  const { data } = useStore();
  const grade = gradeOf(data.learner.level), prog = dailyProgress(data.counts, data.learner.level), cont = continueFor(data, grade);
  const challenge = SUBJECTS[new Date().getDate() % SUBJECTS.length];
  return (
    <Page theme="math">
      <LearnNovaHeader title={`${greeting()}, ${data.learner.name}! 🌞`} sub={`Ready to learn something new? • ${levelTitle(data.learner.level)}`} color="#2463EB" emoji="🎒">
        <Text style={{ color:'#FFE082', fontFamily:F.bold }}>🔥 {data.streak} Day Streak</Text>
      </LearnNovaHeader>
      <Btn title="Not Grade? Change learner" outline color={C.blue} onPress={() => navigation.navigate('Level')} style={{ alignSelf:'flex-start', minHeight:42, paddingVertical:6 }} />
      <Grid min={320} max={2} data={[
        { id:'t', n:<DailyTarget progress={prog} compact title="🎯 Today's Goal" /> },
        { id:'c', n:(
          <Card style={{ gap:10 }}>
            <Text style={{ fontFamily:F.bold, fontSize:20, color:C.text }}>Continue Learning</Text>
            {cont ? (<>
              <Text style={{ fontFamily:F.semi, fontSize:16, color:C.text }}>{cont.subject.emoji} {cont.subject.title}: {cont.lesson.title}</Text>
              <ProgressBar value={cont.pct} color={cont.subject.color} /><Text style={{ fontFamily:F.semi, color:C.grey }}>Progress: {Math.round(cont.pct * 100)}%</Text>
              <Btn title="Continue" color={C.green} onPress={() => navigation.navigate('Lesson', { subject:cont.subject.id, grade, idx:cont.idx })} />
            </>) : <Text style={{ fontFamily:F.semi, color:C.green }}>🎉 Every lesson done! Try a quiz.</Text>}
          </Card>) },
      ]} renderItem={(x) => x.n} />
      <SectionTitle>Subjects</SectionTitle>
      <Grid min={300} max={2} data={SUBJECTS} renderItem={(s, i) => { const p = gradeProgress(data, s.id, grade); return <FadeIn delay={i * 70}><SubjectCard subject={s} pct={p.pct} done={p.done} total={p.total} onPress={() => navigation.navigate('Subject', { subject:s.id, grade })} /></FadeIn>; }} />
      <SectionTitle>Today's Challenge 🎮</SectionTitle>
      <GameCard emoji={challenge.emoji} title={`${challenge.title} Challenge`} sub="10 mixed questions • up to +50 XP" color={challenge.color} onPress={() => navigation.navigate('Quiz', { mode:'subjectQuiz', subject:challenge.id, grade })} />
      <Grid min={260} max={2} data={[
        { id:'a', n:<GameCard emoji="🤖" title="Ask LearnNova AI" sub="Get simple, step-by-step help" color="#7C4DFF" onPress={() => navigation.navigate('AI')} /> },
        { id:'b', n:<GameCard emoji="📖" title="Dictionary" sub="Find word meanings" color="#00796B" onPress={() => navigation.navigate('Dictionary')} /> },
        { id:'c', n:<GameCard emoji="📚" title="Stories" sub="10 stories with morals" color="#2463EB" onPress={() => navigation.navigate('Stories')} /> },
        { id:'d', n:<GameCard emoji="🔤" title="Vocabulary" sub="Word cards and quiz" color="#2E7D32" onPress={() => navigation.navigate('Vocabulary')} /> },
      ]} renderItem={(x) => x.n} />
    </Page>
  );
}
