import React, { useMemo, useState } from 'react';
import { useStore, gradeOf } from '../theme';
import { QuizEngine } from '../components';
import { buildQuiz, PHONICS_GAME_LIST } from '../data/quizBuilder';
import { getLessons } from '../data/curriculum';
import { ACTIVITIES } from '../data/nurseryData';

// One screen plays every kind of quiz. It builds the questions, plays them and reports the result to the store.
export default function QuizScreen({ route, navigation }) {
  const p = route.params, { award, data } = useStore(), [run, setRun] = useState(0);
  const quiz = useMemo(() => buildQuiz(p), [JSON.stringify(p), run]);
  const go = (...a) => navigation.replace(...a);

  const onFinish = (score, total) => {
    const perfect = score === total, pct = Math.round(score / total * 100);
    let evt;
    if (p.mode === 'lesson') evt = { xp:20, lessonId:getLessons(p.subject, p.grade)[p.idx].id, pct, counts:{ ['lesson:' + p.subject]:1, ['q:' + p.subject]:total }, recent:{ subject:p.subject, grade:p.grade, idx:p.idx } };
    else if (p.mode === 'subjectQuiz') evt = { xp:perfect ? 50 : 30, quiz:true, perfect, counts:{ ['q:' + p.subject]:total } };
    else if (p.mode === 'story') evt = { xp:perfect ? 50 : 30, quiz:true, perfect, counts:{ 'q:english':total } };
    else if (p.mode === 'vocab') evt = { xp:perfect ? 40 : 20, quiz:true, perfect, counts:{ 'q:english':total } };
    else if (p.mode === 'phonics') evt = { xp:10, game:true, counts:{ phonicsGame:1 } };
    else evt = { xp:10, game:true, counts:p.activity === 'colors' ? { colors:1 } : p.activity === 'counting' ? { numbers:1 } : { activity:1 } };
    const res = award(evt);
    return { ...res, xp:evt.xp };
  };

  // "Recommended next" suggestions after a result
  const nextActions = () => {
    if (p.mode === 'lesson') {
      const ls = getLessons(p.subject, p.grade), nxt = ls.find((l, i) => i > p.idx && !(l.id in data.lessons)) || ls[p.idx + 1];
      const out = [{ emoji:'🎮', label:`${ls[p.idx].title} Quiz`, onPress:() => go('Quiz', { mode:'subjectQuiz', subject:p.subject, grade:p.grade }) }];
      if (nxt) out.unshift({ emoji:'📚', label:`Next lesson: ${nxt.title}`, onPress:() => go('Lesson', { subject:p.subject, grade:p.grade, idx:ls.indexOf(nxt) }) });
      out.push({ emoji:'🤖', label:'Ask LearnNova AI', onPress:() => navigation.navigate('Main', { screen:'AI' }) });
      return out;
    }
    if (p.mode === 'vocab') return [
      { emoji:'📖', label:'More vocabulary', onPress:() => navigation.replace('Vocabulary') },
      { emoji:'🔎', label:'Look up a word', onPress:() => navigation.navigate('Main', { screen:'Dictionary' }) },
    ];
    if (p.mode === 'story') return [
      { emoji:'📚', label:'Read another story', onPress:() => navigation.replace('Stories') },
      { emoji:'📖', label:'Learn vocabulary', onPress:() => navigation.replace('Vocabulary') },
      { emoji:'🏠', label:'Go to Home', onPress:() => navigation.navigate('Main', { screen:'Home' }) },
    ];
    if (p.mode === 'subjectQuiz') return [
      { emoji:'📘', label:'Back to lessons', onPress:() => navigation.navigate('Subject', { subject:p.subject || 'english', grade:p.grade || gradeOf(data.learner.level) || 1 }) },
      { emoji:'🏠', label:'Go to Home', onPress:() => navigation.navigate('Main', { screen:'Home' }) },
    ];
    if (p.mode === 'phonics') {
      const i = PHONICS_GAME_LIST.findIndex(g => g.id === p.game), n = PHONICS_GAME_LIST[(i + 1) % PHONICS_GAME_LIST.length];
      return [{ emoji:n.emoji, label:`Play next: ${n.title}`, onPress:() => go('Quiz', { mode:'phonics', game:n.id }) }, { emoji:'🔤', label:'Learn more letters', onPress:() => navigation.replace('Phonics') }, { emoji:'✏️', label:'Practice tracing', onPress:() => navigation.replace('Tracing') }];
    }
    const i = ACTIVITIES.findIndex(a => a.id === p.activity), n = ACTIVITIES[(i + 1) % ACTIVITIES.length];
    return [{ emoji:n.emoji, label:`Next activity: ${n.title}`, onPress:() => navigation.replace(...n.to) }, { emoji:'🔤', label:'Learn a letter', onPress:() => navigation.replace('Phonics') }];
  };
  return <QuizEngine key={run} quiz={quiz} onFinish={onFinish} nextActions={nextActions} onClose={() => navigation.goBack()} onRestart={() => setRun(run + 1)} />;
}
