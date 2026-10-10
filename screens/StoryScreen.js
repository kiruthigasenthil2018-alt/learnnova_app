import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { C, F } from '../theme';
import { Page, Card, LearnNovaHeader, Btn, AudioButton, FadeIn } from '../components';
import useResponsive from '../hooks/useResponsive';
import { STORIES, BAND_LABEL } from '../data/stories';

export default function StoryScreen({ route, navigation }) {
  const s = STORIES.find(x => x.id === route.params.id) || STORIES[0], r = useResponsive(), [showMoral, setShowMoral] = useState(false);
  const i = STORIES.indexOf(s), nxt = STORIES[(i + 1) % STORIES.length];
  return (
    <Page theme="phonics" max={720}>
      <LearnNovaHeader title={`${s.title} ${s.emoji}`} sub={`Story ${i + 1} of ${STORIES.length}  •  ${BAND_LABEL[s.band]}`} color="#2463EB" />
      <Card style={{ gap:12 }}>
        <Text style={{ fontFamily:F.semi, fontSize:r.fs(s.band === 'lo' ? 22 : 18), color:C.text, lineHeight:r.fs(s.band === 'lo' ? 34 : 29) }}>{s.text}</Text>
        <AudioButton say={s.text} label="Read to me" note={s.title} style={{ alignSelf:'flex-start' }} rate={0.85} />
      </Card>
      <Card style={{ gap:8, backgroundColor:C.cream }}>
        <Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>📖 New words</Text>
        {s.words.map(w => <Text key={w.word} style={{ fontFamily:F.semi, color:C.text, lineHeight:23 }}><Text style={{ fontFamily:F.bold, color:C.blue }}>{w.word}</Text> — {w.meaning}</Text>)}
      </Card>
      {showMoral ? (
        <FadeIn><Card style={{ gap:6, backgroundColor:C.mint }}>
          <Text style={{ fontFamily:F.bold, fontSize:18, color:C.okText }}>💡 Moral of the story</Text>
          <Text style={{ fontFamily:F.bold, fontSize:r.fs(18), color:C.text, lineHeight:r.fs(27) }}>{s.moral}</Text>
          <AudioButton say={`The moral of the story is: ${s.moral}`} label="Hear the moral" note={s.moral} style={{ alignSelf:'flex-start', marginTop:4 }} color="#43A047" />
        </Card></FadeIn>
      ) : <Btn title="💡 Show the moral" outline color={C.green} onPress={() => setShowMoral(true)} />}
      <Btn title="🧠 Answer the questions" color={C.green} onPress={() => navigation.replace('Quiz', { mode:'story', id:s.id })} />
      <Btn title={`Next story: ${nxt.title} ▶`} outline color={C.blue} onPress={() => navigation.replace('Story', { id:nxt.id })} />
    </Page>
  );
}
