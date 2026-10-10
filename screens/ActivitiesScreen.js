import React from 'react';
import { Page, Grid, GameCard, LearnNovaHeader } from '../components';
import { ACTIVITIES } from '../data/nurseryData';

export default function ActivitiesScreen({ navigation }) {
  return (
    <Page theme="games">
      <LearnNovaHeader title="Fun Activities 🧩" sub="Play, match and explore!" emoji="🎈" color="#D81B60" />
      <Grid min={300} max={2} data={ACTIVITIES} renderItem={(a) => <GameCard emoji={a.emoji} title={a.title} sub={a.sub} color={a.color} onPress={() => navigation.navigate(...a.to)} />} />
    </Page>
  );
}
