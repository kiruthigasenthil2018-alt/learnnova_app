import React from 'react';
import { Page, Grid, GameCard, LearnNovaHeader } from '../components';
import { PHONICS_GAME_LIST } from '../data/quizBuilder';

const SUB = { find:'Which letter makes the /b/ sound?', match:'Match B → 🐝, C → 🐱', sound:'What does Apple start with?', listen:'Hear a sound, pick the letter', missing:'_ pple — find the missing letter' };
export default function PhonicsGamesScreen({ navigation }) {
  return (
    <Page theme="phonics">
      <LearnNovaHeader title="Phonics Games 🔊" sub="Each game earns +10 XP" emoji="🎮" color="#E53935" />
      <Grid min={300} max={2} data={PHONICS_GAME_LIST} renderItem={(g) => <GameCard emoji={g.emoji} title={g.title} sub={SUB[g.id]} color="#E53935" onPress={() => navigation.navigate('Quiz', { mode:'phonics', game:g.id })} />} />
      <GameCard emoji="🔤" title="Learn the letters first" sub="A–Z with sounds and pictures" color="#FB8C00" onPress={() => navigation.navigate('Phonics')} />
    </Page>
  );
}
