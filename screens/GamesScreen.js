import React from 'react';
import { C, useStore, isNursery, gradeOf } from '../theme';
import { Page, Grid, GameCard, LearnNovaHeader, SectionTitle } from '../components';
import { PHONICS_GAME_LIST } from '../data/quizBuilder';
import { ACTIVITIES } from '../data/nurseryData';
import { SUBJECTS } from '../data/curriculum';

export default function GamesScreen({ navigation }) {
  const { data } = useStore(), nursery = isNursery(data.learner.level), grade = gradeOf(data.learner.level) || 3;
  const phonics = (<React.Fragment key="p"><SectionTitle>🔊 Phonics Games</SectionTitle>
    <Grid min={300} max={2} data={PHONICS_GAME_LIST} renderItem={(g) => <GameCard emoji={g.emoji} title={g.title} sub="+10 XP" color="#E53935" onPress={() => navigation.navigate('Quiz', { mode:'phonics', game:g.id })} />} /></React.Fragment>);
  const acts = (<React.Fragment key="a"><SectionTitle>🧩 Kindergarten Activities</SectionTitle>
    <Grid min={300} max={2} data={ACTIVITIES} renderItem={(a) => <GameCard emoji={a.emoji} title={a.title} sub={a.sub} color={a.color} onPress={() => navigation.navigate(...a.to)} />} /></React.Fragment>);
  const brain = (<React.Fragment key="b"><SectionTitle>⚡ Brain Games</SectionTitle>
    <Grid min={300} max={2} data={[
      { id:1, e:'⚡', t:'Math Sprint', s:'30 seconds of quick sums', to:['BrainGames'] }, { id:2, e:'🧩', t:'Pattern Puzzle', s:'Find the next number', to:['BrainGames'] },
      { id:3, e:'🃏', t:'Memory Match', s:'Match the pairs', to:['Memory'] }, { id:4, e:'💡', t:'Fun Facts', s:'Swipe through amazing facts', to:['Bites'] },
    ]} renderItem={(g) => <GameCard emoji={g.e} title={g.t} sub={g.s} color={C.purple} onPress={() => navigation.navigate(...g.to)} />} /></React.Fragment>);
  const quizzes = (<React.Fragment key="q"><SectionTitle>🧠 Subject Challenges</SectionTitle>
    <Grid min={300} max={2} data={SUBJECTS} renderItem={(s) => <GameCard emoji={s.emoji} title={`${s.title} Quiz`} sub={`Grade ${grade} • 10 questions`} color={s.color} onPress={() => navigation.navigate('Quiz', { mode:'subjectQuiz', subject:s.id, grade })} />} /></React.Fragment>);
  return (
    <Page theme="games">
      <LearnNovaHeader title="Learning Games 🎮" sub="Play, practise and earn XP!" emoji="🎉" color="#6A1B9A" />
      {nursery ? [phonics, acts, brain] : [quizzes, brain, acts, phonics]}
    </Page>
  );
}
