import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { C, F, R, SHADOW, useStore, isNursery, gradeOf, levelTitle } from '../theme';
import { Page, Grid, Card, SectionTitle, Btn, Float, FadeIn, StatTile, DailyTarget, StreakCard, GameCard, ProgressBar, GreetingBlast } from '../components';
import useResponsive from '../hooks/useResponsive';
import { dailyProgress } from '../data/targets';
import { SUBJECTS } from '../data/curriculum';
import { continueFor, nextLetter, overallPct, gradeProgress } from '../utils/learning';

export default function HomeScreen({ navigation }) {
  const { data, level, updateLearner } = useStore(), r = useResponsive();
  const lv = data.learner.level, nursery = isNursery(lv), grade = gradeOf(lv);
  const prog = dailyProgress(data.counts, lv);
  const goLearn = () => navigation.navigate('Learn');
  const choose = (id) => { updateLearner({ level:id }); navigation.navigate('Learn'); };
  const cont = !nursery ? continueFor(data, grade) : null, letter = nextLetter(data);

  const actions = [
    { id:'kids', emoji:'🎨', title:'Kids Learning', sub:'Letters, phonics, numbers & more', color:'#EC6A8E', onPress:() => (nursery ? goLearn() : choose('nursery')) },
    { id:'grades', emoji:'📚', title:'Grade 1–5', sub:'English, Maths, Science, Social', color:'#2463EB', onPress:() => (nursery ? navigation.navigate('Level') : goLearn()) },
    { id:'ai', emoji:'🧠', title:'AI Doubt Solver', sub:'Ask LearnNova AI anything', color:'#7C4DFF', onPress:() => navigation.navigate('AI') },
    { id:'dict', emoji:'📖', title:'Dictionary', sub:'Look up any word', color:'#00796B', onPress:() => navigation.navigate('Dictionary') },
    { id:'games', emoji:'🎮', title:'Learning Games', sub:'Play, practise and win XP', color:'#B85C00', onPress:() => navigation.navigate('Games') },
    { id:'stories', emoji:'📚', title:'Stories & Vocabulary', sub:'10 stories with morals, word cards', color:'#2E7D32', onPress:() => navigation.navigate('Stories') },
  ];
  // Featured activity rotates daily
  const featured = [
    { emoji:'🔊', title:'Phonics Game', sub:'Find the letter that makes the sound', to:['Quiz', { mode:'phonics', game:'find' }] },
    { emoji:'⚡', title:'Math Sprint', sub:'Solve as many as you can in 30 seconds', to:['BrainGames'] },
    { emoji:'🃏', title:'Memory Match', sub:'Find the matching animal cards', to:['Memory'] },
    { emoji:'📖', title:'Story Time', sub:'Read a short story and answer questions', to:['Story', { id:grade && grade >= 4 ? 'river' : grade === 3 ? 'seed' : 'rabbit' }] },
  ][new Date().getDate() % 4];

  const weekly = Object.keys(data.week).filter(k => Date.now() - new Date(k).getTime() < 7 * 864e5).length;
  const best = !nursery ? [...SUBJECTS].sort((a, b) => gradeProgress(data, b.id, grade).pct - gradeProgress(data, a.id, grade).pct)[0] : null;

  const play = () => (nursery ? navigation.navigate('Phonics', { letter:letter.letter }) : cont ? navigation.navigate('Lesson', { subject:cont.subject.id, grade, idx:cont.idx }) : navigation.navigate('Learn'));
  const blocks = [
    <StreakCard key="s" streak={data.streak} week={data.week} />,
    <DailyTarget key="d" progress={prog} title={nursery ? "🌟 Today's Learning Goal" : "🎯 Today's Target"} />,
    <Card key="c" style={{ gap:10, flexGrow:1 }}>
      <Text style={{ fontFamily:F.bold, fontSize:20, color:C.text }}>▶ Continue Learning</Text>
      {nursery ? (<>
        <Text style={{ fontFamily:F.semi, fontSize:16, color:C.grey }}>{letter.emoji} Letter {letter.letter} for {letter.word}</Text>
        <Btn title="Learn the letter" color={C.green} onPress={() => navigation.navigate('Phonics', { letter:letter.letter })} />
      </>) : cont ? (<>
        <Text style={{ fontFamily:F.semi, fontSize:16, color:C.text }}>{cont.subject.emoji} {cont.subject.title} — {cont.lesson.title}</Text>
        <ProgressBar value={cont.pct} color={cont.subject.color} /><Text style={{ fontFamily:F.semi, color:C.grey, fontSize:13 }}>Progress: {Math.round(cont.pct * 100)}%</Text>
        <Btn title="Continue" color={C.green} onPress={() => navigation.navigate('Lesson', { subject:cont.subject.id, grade, idx:cont.idx })} />
      </>) : <Text style={{ fontFamily:F.semi, color:C.green }}>🎉 You finished every lesson in this grade!</Text>}
    </Card>,
    <View key="f" style={{ gap:8, flexGrow:1 }}><SectionTitle>✨ Featured Activity</SectionTitle><GameCard emoji={featured.emoji} title={featured.title} sub={featured.sub} color={C.gold} onPress={() => navigation.navigate(...featured.to)} /></View>,
    <Card key="p" style={{ gap:6, backgroundColor:C.sky, flexGrow:1 }}>
      <Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>👨‍👩‍👧 Parent Summary</Text>
      <Text style={{ fontFamily:F.semi, color:C.text, lineHeight:22 }}>{data.learner.name} is learning at {levelTitle(lv)} level.</Text>
      <Text style={{ fontFamily:F.reg, color:C.grey, lineHeight:21 }}>
        {`Active ${weekly} of the last 7 days • ${Object.keys(data.lessons).length} lessons • ${data.quizzes} quizzes • ${data.letters.length}/26 letters`}
        {best && gradeProgress(data, best.id, grade).pct > 0 ? `\nStrongest subject so far: ${best.title}.` : ''}
      </Text>
      <Btn title="See full progress" outline color={C.blue} onPress={() => navigation.navigate('Progress')} />
    </Card>,
  ];

  return (
    <View style={{ flex:1 }}>
    <Page theme="home">
      <FadeIn>
        <View style={{ backgroundColor:C.blue, borderRadius:28, padding:r.isMobile ? 18 : 26, overflow:'hidden', flexDirection:r.isMobile ? 'column' : 'row', alignItems:'center', justifyContent:'space-between', gap:16, ...SHADOW }}>
          <View style={{ flex:1, gap:6, width:'100%' }}>
            <Text style={{ color:'#fff', fontFamily:F.bold, fontSize:r.fs(26) }} accessibilityRole="header">Welcome to LearnNova 🌟</Text>
            <Text style={{ color:'#FFE082', fontFamily:F.bold, fontSize:r.fs(16) }}>Learn • Play • Explore • Grow</Text>
            <Text style={{ color:'#DCE6FF', fontFamily:F.semi, fontSize:r.fs(14), lineHeight:21 }}>Fun and interactive learning for Kindergarten to Grade 5.</Text>
            <Text style={{ color:'#fff', fontFamily:F.semi, marginTop:4 }}>Hi {data.learner.name}! 👋  •  Level {level}</Text>
          </View>
          <View style={{ alignItems:'center', gap:8 }}>
            <Pressable onPress={play} accessibilityRole="button" accessibilityLabel="Play. Continue learning" style={({ pressed }) => ({ width:r.isMobile ? 88 : 104, height:r.isMobile ? 88 : 104, borderRadius:60, backgroundColor:C.green, borderWidth:5, borderColor:'#fff', alignItems:'center', justifyContent:'center', transform:[{ scale:pressed ? 0.94 : 1 }] })}>
              <Text style={{ color:'#fff', fontSize:r.isMobile ? 40 : 48, marginLeft:6 }}>▶</Text>
            </Pressable>
            <Text style={{ color:'#fff', fontFamily:F.bold }}>Tap to play!</Text>
          </View>
        </View>
      </FadeIn>
      <View style={{ flexDirection:'row', gap:10 }}>
        <StatTile emoji="🔥" value={data.streak} label="day streak" /><StatTile emoji="⭐" value={data.xp} label="total XP" /><StatTile emoji="🏅" value={level} label="level" />
      </View>
      <SectionTitle>What shall we do today?</SectionTitle>
      <Grid min={260} max={3} data={actions} renderItem={(a, i) => (<FadeIn delay={i * 60}><GameCard emoji={a.emoji} title={a.title} sub={a.sub} color={a.color} onPress={a.onPress} /></FadeIn>)} />
      <Grid min={340} max={2} data={blocks.map((b, i) => ({ id:i, b }))} renderItem={(x) => x.b} />
    </Page>
    <GreetingBlast name={data.learner.name} />
    </View>
  );
}
