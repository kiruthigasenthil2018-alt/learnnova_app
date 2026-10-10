import React from 'react';
import { View, Text } from 'react-native';
import { C, F, useStore, isNursery, gradeOf, levelTitle } from '../theme';
import { Page, Grid, Card, LearnNovaHeader, ProgressBar, StreakCard, XPCard, StatTile, AchievementBadge, SectionTitle, DailyTarget } from '../components';
import { SUBJECTS } from '../data/curriculum';
import { ACHIEVEMENTS } from '../data/achievementData';
import { dailyProgress } from '../data/targets';
import { gradeProgress } from '../utils/learning';

export default function ProgressScreen() {
  const { data, level } = useStore(), lv = data.learner.level, nursery = isNursery(lv), grade = gradeOf(lv);
  const lessons = Object.keys(data.lessons).length;
  const rows = nursery
    ? [['Letters', '🔤', data.letters.length / 26, C.blue, `${data.letters.length}/26`], ['Games played', '🎮', Math.min(1, data.games / 20), C.purple, `${data.games}`]]
    : SUBJECTS.map(s => { const p = gradeProgress(data, s.id, grade); return [s.title, s.emoji, p.pct, s.color, `${Math.round(p.pct * 100)}%`]; });
  return (
    <Page theme="math">
      <LearnNovaHeader title="Learning Progress 📊" sub={`${data.learner.name} • ${levelTitle(lv)}`} emoji="📈" color="#2463EB" />
      <Card style={{ gap:12 }}>
        <Text style={{ fontFamily:F.bold, fontSize:18, color:C.text }}>{nursery ? 'Kindergarten skills' : 'Subjects'}</Text>
        {rows.map(([t, e, v, c, label]) => (
          <View key={t} style={{ gap:4 }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}><Text style={{ fontFamily:F.bold, color:C.text }}>{e} {t}</Text><Text style={{ fontFamily:F.bold, color:C.grey }}>{label}</Text></View>
            <ProgressBar value={v} color={c} height={12} />
          </View>))}
      </Card>
      <Grid min={300} max={2} data={[{ id:1, n:<StreakCard streak={data.streak} week={data.week} /> }, { id:2, n:<XPCard xp={data.xp} level={level} xpToday={data.xpToday} goal={data.learner.goal} /> }]} renderItem={(x) => x.n} />
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10 }}>
        <StatTile emoji="📚" value={lessons} label="Lessons completed" /><StatTile emoji="🎮" value={data.quizzes} label="Quizzes completed" /><StatTile emoji="🧩" value={data.games} label="Games played" /><StatTile emoji="🔥" value={data.bestStreak} label="Best streak" />
      </View>
      <DailyTarget progress={dailyProgress(data.counts, lv)} />
      <SectionTitle>🏆 Achievements ({data.badges.length}/{ACHIEVEMENTS.length})</SectionTitle>
      <Grid min={140} max={5} data={ACHIEVEMENTS} renderItem={(a) => <AchievementBadge a={a} unlocked={data.badges.includes(a.id)} />} />
      <Card style={{ backgroundColor:C.sky, gap:4 }}>
        <Text style={{ fontFamily:F.bold, fontSize:16, color:C.text }}>👨‍👩‍👧 For parents</Text>
        <Text style={{ fontFamily:F.reg, color:C.grey, lineHeight:22 }}>{`Today ${data.learner.name} earned ${data.xpToday} XP. Total: ${data.xp.toLocaleString('en-IN')} XP, ${lessons} lessons and ${data.quizzes} quizzes finished. Short daily practice builds the best habits — even 10 minutes helps!`}</Text>
      </Card>
    </Page>
  );
}
