import React from 'react';
import { View, Text } from 'react-native';
import { C, F, R, useStore } from '../theme';
import { Page, Card, LearnNovaHeader, Btn, FadeIn, AudioButton, PdfButton } from '../components';
import { lessonHtml } from '../services/pdfService';
import { subjectOf, getLessons } from '../data/curriculum';

// Lesson page: explanation → examples → (optional picture flow) → practice quiz
export default function LessonScreen({ route, navigation }) {
  const { subject, grade, idx } = route.params, sub = subjectOf(subject), { data } = useStore();
  const lesson = getLessons(subject, grade)[idx], done = lesson.id in data.lessons;
  return (
    <Page theme={sub.theme} max={760}>
      <LearnNovaHeader title={lesson.title} sub={`${sub.title} • Grade ${grade} • Lesson ${lesson.n}`} emoji={lesson.emoji} color={sub.color}>{done ? <Text style={{ color:'#FFE082', fontFamily:F.bold }}>✓ Completed</Text> : null}</LearnNovaHeader>
      <FadeIn><Card style={{ gap:10 }}>
        <Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>💡 Learn this</Text>
        <Text style={{ fontFamily:F.semi, fontSize:grade <= 2 ? 20 : 17, color:C.text, lineHeight:grade <= 2 ? 30 : 26 }}>{lesson.intro}</Text>
        <AudioButton say={lesson.intro} label="Read to me" note={lesson.title} style={{ alignSelf:'flex-start' }} />
      </Card></FadeIn>
      {lesson.flow ? (
        <FadeIn delay={100}><Card style={{ gap:4, alignItems:'center' }}>
          <Text style={{ fontFamily:F.bold, fontSize:18, color:C.text, alignSelf:'flex-start' }}>🔭 See it step by step</Text>
          {lesson.flow.map((f, i) => (
            <View key={f} style={{ alignItems:'center' }}>
              <View style={{ backgroundColor:C.sky, borderRadius:16, paddingVertical:10, paddingHorizontal:22, minWidth:190, alignItems:'center' }}><Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>{f}</Text></View>
              {i < lesson.flow.length - 1 ? <Text style={{ fontSize:22, color:sub.color }}>↓</Text> : null}
            </View>))}
        </Card></FadeIn>
      ) : null}
      <FadeIn delay={180}><Card style={{ gap:8 }}>
        <Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>✏️ Examples</Text>
        {lesson.examples.map((e, i) => <View key={i} style={{ backgroundColor:C.cream, borderRadius:14, padding:12 }}><Text style={{ fontFamily:F.semi, fontSize:16, color:C.text, lineHeight:24 }}>{e}</Text></View>)}
      </Card></FadeIn>
      <PdfButton label="📄 Download this lesson as PDF" build={() => lessonHtml(subject, grade, idx)} />
      <Btn title={done ? '🔁 Practise again' : '🚀 Start Practice  (+20 XP)'} color={C.green} onPress={() => navigation.navigate('Quiz', { mode:'lesson', subject, grade, idx })} />
    </Page>
  );
}
