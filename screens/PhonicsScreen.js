import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, R, SHADOW, useStore } from '../theme';
import { Page, Grid, Card, Btn, AudioButton, PhonicsCard, FadeIn, Float, SectionTitle, GameCard, PdfButton, SwipeArea, DancingAnimals, Fireworks } from '../components';
import { alphabetHtml } from '../services/pdfService';
import { speak } from '../services/audioService';
import useResponsive from '../hooks/useResponsive';
import { PHONICS, phonicsOf } from '../data/phonicsData';

export default function PhonicsScreen({ route, navigation }) {
  const { data, award } = useStore(), r = useResponsive();
  const [sel, setSel] = useState(route.params?.letter || 'A'), [fresh, setFresh] = useState(null);
  const L = phonicsOf(sel), idx = PHONICS.indexOf(L), next = PHONICS[(idx + 1) % 26];
  const learned = data.letters.includes(sel), seenToday = !!data.counts['letter:' + sel];

  const learn = () => {
    if (!seenToday) award({ xp:5, letter:sel, counts:{ letter:1, ['letter:' + sel]:1 }, recent:{ kind:'phonics', letter:sel } });
    setFresh(sel);
  };
  const pick = (l) => { setSel(l); setFresh(null); };
  const Box = ({ icon, title, children, color = C.sky }) => (
    <View style={{ width:'100%', backgroundColor:color, borderRadius:16, padding:14, gap:4 }}>
      <Text style={{ fontFamily:F.bold, color:C.text, fontSize:15 }}>{icon} {title}</Text>
      {children}
    </View>
  );
  const body = { fontFamily:F.semi, color:C.text, lineHeight:23, fontSize:r.fs(15) };
  const prev = PHONICS[(idx + 25) % 26];
  return (
    <Page theme="phonics">
      <SwipeArea onSwipeLeft={() => pick(next.letter)} onSwipeRight={() => pick(prev.letter)}>
      <FadeIn key={sel}>
        <Card style={{ alignItems:'center', gap:12, padding:r.isMobile ? 16 : 24 }}>
          <Text style={{ fontFamily:F.semi, color:C.grey }}>Letter {idx + 1} of 26  •  swipe ◀ ▶ to change</Text>
          <Text style={{ fontSize:r.isMobile ? 84 : 104, fontFamily:F.bold, color:C.blue, lineHeight:r.isMobile ? 100 : 120 }} accessibilityLabel={`Letter ${L.letter}`}>{L.upper}{L.lower}</Text>
          <Float amp={8}><Text style={{ fontSize:r.isMobile ? 84 : 104 }}>{L.emoji}</Text></Float>
          <Text style={{ fontFamily:F.bold, fontSize:r.fs(28), color:C.text, textAlign:'center' }}>{L.letter} for {L.word}</Text>
          <Text style={{ fontFamily:F.semi, fontSize:r.fs(15), color:C.grey, textAlign:'center' }}>{L.kind}</Text>

          <Box icon="👂" title={`What sound does ${L.letter} make?`}>
            <Text style={body}>{L.explain}</Text>
            <Text style={{ fontFamily:F.bold, color:C.blue, fontSize:r.fs(18) }}>{L.letter}  →  “{L.say}”  →  {L.word}</Text>
          </Box>
          <Box icon="👄" title="How to say it" color={C.cream}>
            <Text style={body}>{L.tip}</Text>
            {L.note ? <Text style={[body, { color:C.grey }]}>💡 {L.note}</Text> : null}
          </Box>
          <Box icon="🪜" title="Learn it in 4 steps" color={C.mint}>
            {L.steps.map((t, i) => <Text key={i} style={body}>{i + 1}. {t}</Text>)}
          </Box>

          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
            <AudioButton say={L.speakSound} label="Hear Sound" size="lg" note={`${L.say}, ${L.say}, ${L.say}`} rate={0.7} />
            <AudioButton say={L.speakWord} label="Hear Word" size="lg" color="#FB8C00" note={L.sentence} rate={0.7} />
            <AudioButton say={L.speakExplain} label="Explain it" size="lg" color="#43A047" note={L.explain} rate={0.75} />
          </View>

          <View style={{ width:'100%', gap:6 }}>
            <Text style={{ fontFamily:F.bold, color:C.text }}>Words that start with {L.letter}  (tap to hear)</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
              {[{ emoji:L.emoji, word:L.word }, ...L.more].map(m => (
                <Pressable key={m.word} onPress={() => speak(`${m.word}. ${m.word} starts with ${L.letter}.`, { rate:0.7 })} accessibilityRole="button" accessibilityLabel={`Hear ${m.word}`} style={{ alignItems:'center', justifyContent:'center', backgroundColor:C.cream, borderRadius:16, paddingVertical:10, paddingHorizontal:12, width:92, minHeight:84, gap:2 }}>
                  <Text style={{ fontSize:32 }}>{m.emoji}</Text><Text style={{ fontFamily:F.bold, fontSize:13, color:C.text, textAlign:'center' }} numberOfLines={1}>{m.word}</Text>
                </Pressable>))}
            </View>
          </View>

          <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'center', width:'100%' }}>
            <Btn title="▶ Practice Tracing" outline color={C.blue} onPress={() => navigation.navigate('Tracing', { kind:'letter', value:sel })} style={{ minWidth:180 }} />
            <Btn title={learned ? '✓ Learned! Again?' : '✅ I learned it!'} color={C.green} onPress={learn} style={{ minWidth:180 }} />
          </View>
          <View style={{ flexDirection:'row', gap:10, marginTop:4 }}>
            <Btn title={`◀ ${prev.letter}`} outline color={C.grey} onPress={() => pick(prev.letter)} style={{ minWidth:110 }} />
            <Btn title={`${next.letter} ▶`} outline color={C.grey} onPress={() => pick(next.letter)} style={{ minWidth:110 }} />
          </View>
        </Card>
      </FadeIn>
      </SwipeArea>
      {fresh === sel && (
        <FadeIn><Card style={{ gap:8, backgroundColor:C.mint, overflow:'hidden' }}>
          <Fireworks count={14} />
          <View style={{ alignItems:'center' }}><DancingAnimals n={4} size={38} title={`You learned ${sel}!`} /></View>
          <Text style={{ fontFamily:F.bold, fontSize:20, color:C.okText }}>🎉 Great Job!</Text>
          <Text style={{ fontFamily:F.semi, color:C.text }}>You completed: Letter {sel}   ⭐ {seenToday ? '' : '+5 XP'}</Text>
          <Text style={{ fontFamily:F.bold, color:C.text }}>Next:</Text>
          <Btn title={`🔤  Learn Letter ${next.letter}`} outline color={C.blue} onPress={() => pick(next.letter)} />
          <Btn title="🎮  Play Phonics Game" outline color={C.blue} onPress={() => navigation.navigate('Quiz', { mode:'phonics', game:'find' })} />
          <Btn title={`✏️  Practice ${sel} Tracing`} outline color={C.blue} onPress={() => navigation.navigate('Tracing', { kind:'letter', value:sel })} />
        </Card></FadeIn>
      )}
      <SectionTitle>A–Z ({data.letters.length}/26 learned)</SectionTitle>
      <Grid min={74} max={9} gap={8} data={PHONICS} renderItem={(p) => <PhonicsCard item={p} selected={p.letter === sel} learned={data.letters.includes(p.letter)} onPress={() => pick(p.letter)} />} />
      <PdfButton label="📄 Download A–Z phonics chart as PDF" build={alphabetHtml} />
      <GameCard emoji="🎮" title="Phonics Games" sub="5 games to practise sounds" color="#E53935" onPress={() => navigation.navigate('PhonicsGames')} />
    </Page>
  );
}
