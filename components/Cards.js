import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { C, F, R, SHADOW, LEVELS } from '../theme';
import { ProgressBar, FadeIn, Pulse } from './base';
import { Card, Grid } from './Layout';

export const LearnNovaHeader = ({ title, sub, emoji, color = C.blue, right, children }) => (
  <View style={{ backgroundColor:color, borderRadius:R.card + 4, padding:18, flexDirection:'row', alignItems:'center', gap:14, overflow:'hidden', ...SHADOW }}>
    <View style={{ flex:1, gap:4, minWidth:0 }}>
      <Text style={{ color:'#fff', fontFamily:F.bold, fontSize:24, flexShrink:1 }} accessibilityRole="header">{title}</Text>
      {sub ? <Text style={{ color:'rgba(255,255,255,0.92)', fontFamily:F.semi, fontSize:14, flexShrink:1 }}>{sub}</Text> : null}
      {children}
    </View>
    {right}{emoji ? <Text style={{ fontSize:52 }}>{emoji}</Text> : null}
  </View>
);

export const StatTile = ({ emoji, value, label }) => (
  <View style={{ flex:1, flexBasis:0, minWidth:0, backgroundColor:C.card, borderRadius:R.card - 4, paddingVertical:12, paddingHorizontal:6, alignItems:'center', ...SHADOW }}>
    <Text style={{ fontSize:24 }}>{emoji}</Text><Text style={{ fontFamily:F.bold, fontSize:20, color:C.text }}>{value}</Text><Text style={{ fontFamily:F.semi, fontSize:12, color:C.grey, textAlign:'center' }}>{label}</Text>
  </View>
);

export const XPCard = ({ xp, level, xpToday, goal }) => (
  <Card style={{ gap:8 }}>
    <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
      <Text style={{ fontSize:34 }}>⭐</Text>
      <View style={{ flex:1 }}><Text style={{ fontFamily:F.bold, fontSize:22, color:C.text }}>{xp.toLocaleString('en-IN')} XP</Text><Text style={{ fontFamily:F.semi, color:C.grey }}>Level {level} • {100 - (xp % 100)} XP to next level</Text></View>
    </View>
    <ProgressBar value={(xp % 100) / 100} color={C.gold} />
    {goal ? <Text style={{ fontFamily:F.semi, color:C.grey, fontSize:13 }}>Today: {Math.min(xpToday, goal)} / {goal} XP goal {xpToday >= goal ? '✅' : ''}</Text> : null}
  </Card>
);

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export function StreakCard({ streak, week = {} }) {
  const now = new Date(), mondayOffset = (now.getDay() + 6) % 7;
  const days = DAYS.map((d, i) => { const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset + i); const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; return { d, state:week[k], today:i === mondayOffset }; });
  return (
    <Card style={{ gap:10, flexGrow:1 }}>
      <Text style={{ fontFamily:F.bold, fontSize:20, color:C.text }}>🔥 {streak} Day Streak</Text>
      <Text style={{ fontFamily:F.semi, color:C.grey }}>{streak > 0 ? 'Keep learning every day!' : 'Finish one activity to start your streak!'}</Text>
      <View style={{ flexDirection:'row', gap:4, justifyContent:'space-between' }}>
        {days.map(x => (
          <View key={x.d} style={{ flex:1, alignItems:'center', gap:4 }} accessibilityLabel={`${x.d} ${x.state === 'full' ? 'daily target done' : x.state ? 'learned' : 'no learning yet'}`}>
            <Text style={{ fontFamily:F.bold, fontSize:10, color:x.today ? C.blue : C.grey }}>{x.d}</Text>
            <View style={{ width:'100%', maxWidth:40, aspectRatio:1, borderRadius:20, alignItems:'center', justifyContent:'center', backgroundColor:x.state ? '#FFF3E0' : C.bg, borderWidth:x.today ? 2 : 1, borderColor:x.today ? C.blue : C.line }}>
              <Text style={{ fontSize:16 }}>{x.state === 'full' ? '🌟' : x.state ? '🔥' : '○'}</Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function DailyTarget({ progress, title = "🎯 Today's Target", compact }) {
  const { groups, pct, complete } = progress;
  return (
    <Card style={{ gap:10, flexGrow:1 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <Text style={{ fontFamily:F.bold, fontSize:20, color:C.text, flexShrink:1 }}>{title}</Text>
        <Text style={{ fontFamily:F.bold, color:complete ? C.green : C.blue }}>{Math.round(pct * 100)}%{complete ? ' ✅' : ''}</Text>
      </View>
      <ProgressBar value={pct} color={complete ? C.green : C.gold} height={14} />
      {!compact && groups.map(g => (
        <View key={g.id} style={{ gap:2 }}>
          <Text style={{ fontFamily:F.bold, color:C.text }}>{g.emoji} {g.label}</Text>
          {g.items.map(i => <Text key={i.key} style={{ fontFamily:F.semi, color:i.done ? C.green : C.grey, fontSize:14 }}>{i.done ? '✓' : '○'} {i.label}  ({i.have}/{i.need})</Text>)}
        </View>
      ))}
    </Card>
  );
}

export const SubjectCard = ({ subject, pct, done, total, onPress }) => (
  <Card onPress={onPress} label={`${subject.title}, ${Math.round(pct * 100)} percent complete`} style={{ flexDirection:'row', gap:14, alignItems:'center', minHeight:96 }}>
    <View style={{ width:62, height:62, borderRadius:20, backgroundColor:subject.color, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:32 }}>{subject.emoji}</Text></View>
    <View style={{ flex:1, gap:5 }}>
      <Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>{subject.title}</Text>
      <ProgressBar value={pct} color={subject.color} height={9} />
      <Text style={{ fontFamily:F.semi, fontSize:12, color:C.grey }}>{done}/{total} lessons • {Math.round(pct * 100)}%</Text>
    </View>
  </Card>
);

export const LessonCard = ({ lesson, state, color, onPress }) => (
  <Pressable disabled={false} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Lesson ${lesson.n}, ${lesson.title}, ${state === 'done' ? 'completed' : 'not completed'}`}
    style={({ pressed }) => ({ flexDirection:'row', gap:12, alignItems:'center', backgroundColor:C.card, borderRadius:R.card - 4, padding:14, minHeight:72, borderWidth:2, borderColor:state === 'done' ? C.green : C.line, opacity:pressed ? 0.85 : 1 })}>
    <View style={{ width:46, height:46, borderRadius:23, backgroundColor:state === 'done' ? C.green : color, alignItems:'center', justifyContent:'center' }}><Text style={{ fontSize:state === 'done' ? 22 : 24, color:'#fff', fontFamily:F.bold }}>{state === 'done' ? '✓' : lesson.emoji}</Text></View>
    <View style={{ flex:1 }}><Text style={{ fontFamily:F.bold, fontSize:16, color:C.text }}>{lesson.n}. {lesson.title}</Text><Text style={{ fontFamily:F.semi, fontSize:12, color:C.grey }}>{state === 'done' ? 'Completed ✓' : `${lesson.qs.length} questions • +20 XP`}</Text></View>
    <Text style={{ fontSize:22, color:C.grey }}>›</Text>
  </Pressable>
);

export const GameCard = ({ emoji, title, sub, color = C.blue, badge, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${sub || ''}`}
    style={({ pressed }) => ({ flexDirection:'row', alignItems:'center', gap:14, backgroundColor:C.card, borderRadius:R.card, padding:16, minHeight:92, borderLeftWidth:8, borderLeftColor:color, opacity:pressed ? 0.85 : 1, ...SHADOW })}>
    <Text style={{ fontSize:42 }}>{emoji}</Text>
    <View style={{ flex:1 }}><Text style={{ fontFamily:F.bold, fontSize:17, color:C.text }}>{title}</Text>{sub ? <Text style={{ fontFamily:F.semi, fontSize:13, color:C.grey }}>{sub}</Text> : null}</View>
    {badge ? <View style={{ backgroundColor:C.cream, borderRadius:12, paddingHorizontal:10, paddingVertical:4 }}><Text style={{ fontFamily:F.bold, fontSize:12, color:'#B85C00' }}>{badge}</Text></View> : <Text style={{ fontSize:22, color:C.grey }}>›</Text>}
  </Pressable>
);

// Big square tile used by the Nursery dashboard
export const KidTile = ({ emoji, title, color, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}
    style={({ pressed }) => ({ aspectRatio:1.05, backgroundColor:color, borderRadius:26, alignItems:'center', justifyContent:'center', gap:6, padding:8, borderBottomWidth:6, borderBottomColor:'rgba(0,0,0,0.22)', transform:[{ scale:pressed ? 0.96 : 1 }] })}>
    <Text style={{ fontSize:48 }}>{emoji}</Text>
    <Text style={{ color:'#fff', fontFamily:F.bold, fontSize:17, textAlign:'center' }} numberOfLines={2}>{title}</Text>
  </Pressable>
);

export const PhonicsCard = ({ item, selected, learned, onPress }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Letter ${item.letter}, ${item.word}${learned ? ', learned' : ''}`}
    style={({ pressed }) => ({ aspectRatio:1, backgroundColor:selected ? C.blue : C.card, borderRadius:20, alignItems:'center', justifyContent:'center', borderWidth:3, borderColor:learned ? C.green : selected ? C.blue : C.line, opacity:pressed ? 0.85 : 1 })}>
    <Text style={{ fontFamily:F.bold, fontSize:30, color:selected ? '#fff' : C.text }}>{item.upper}{item.lower}</Text>
    <Text style={{ fontSize:22 }}>{item.emoji}</Text>
    {learned ? <Text style={{ position:'absolute', top:2, right:6, fontSize:14, color:C.green, fontFamily:F.bold }}>✓</Text> : null}
  </Pressable>
);

export const AchievementBadge = ({ a, unlocked }) => (
  <View style={{ alignItems:'center', gap:4, padding:10, borderRadius:R.card - 4, backgroundColor:unlocked ? '#FFF8E1' : C.bg, borderWidth:2, borderColor:unlocked ? C.gold : C.line, minHeight:112 }} accessibilityLabel={`${a.title}, ${unlocked ? 'unlocked' : 'locked'}. ${a.desc}`}>
    <Text style={{ fontSize:34, opacity:unlocked ? 1 : 0.3 }}>{unlocked ? a.emoji : '🔒'}</Text>
    <Text style={{ fontFamily:F.bold, fontSize:13, color:C.text, textAlign:'center' }}>{a.title}</Text>
    <Text style={{ fontFamily:F.semi, fontSize:11, color:C.grey, textAlign:'center' }}>{unlocked ? 'Unlocked!' : a.desc}</Text>
  </View>
);

// "Who is learning today?" — animated selection cards
export function LevelPicker({ value, onChange }) {
  return (
    <Grid min={150} max={3} data={LEVELS} renderItem={(l, i) => (
      <FadeIn delay={i * 70}>
        <Pressable onPress={() => onChange(l.id)} accessibilityRole="button" accessibilityState={{ selected:value === l.id }} accessibilityLabel={`${l.title}, ${l.sub}`}
          style={({ pressed }) => ({ backgroundColor:value === l.id ? l.color : C.card, borderRadius:R.card, padding:14, alignItems:'center', gap:2, minHeight:112, justifyContent:'center', borderWidth:3, borderColor:l.color, transform:[{ scale:pressed ? 0.96 : 1 }] })}>
          <Text style={{ fontSize:36 }}>{l.emoji}</Text>
          <Text style={{ fontFamily:F.bold, fontSize:16, color:value === l.id ? '#fff' : C.text, textAlign:'center' }}>{l.title}</Text>
          <Text style={{ fontFamily:F.semi, fontSize:12, color:value === l.id ? '#fff' : C.grey }}>{l.sub}{value === l.id ? '  ✓' : ''}</Text>
        </Pressable>
      </FadeIn>
    )} />
  );
}
