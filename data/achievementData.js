// Badges unlock from progress stats (see statsOf in hooks/useProgress.js)
export const ACHIEVEMENTS = [
  { id:'first', emoji:'🏆', title:'First Lesson', desc:'Finish your first lesson', test:(s) => s.lessons >= 1 },
  { id:'quizstarter', emoji:'⭐', title:'Quiz Starter', desc:'Complete a quiz', test:(s) => s.quizzes >= 1 },
  { id:'streak7', emoji:'🔥', title:'7 Day Streak', desc:'Learn 7 days in a row', test:(s) => s.best >= 7 },
  { id:'ten', emoji:'📚', title:'10 Lessons', desc:'Finish 10 lessons', test:(s) => s.lessons >= 10 },
  { id:'quick', emoji:'🧠', title:'Quick Learner', desc:'Get a perfect score on a quiz', test:(s) => s.perfect >= 1 },
  { id:'phonics', emoji:'🔤', title:'Phonics Master', desc:'Learn all 26 letters', test:(s) => s.letters >= 26 },
  { id:'math', emoji:'➕', title:'Math Explorer', desc:'Finish 3 maths lessons', test:(s) => s.math >= 3 },
  { id:'science', emoji:'🔬', title:'Young Scientist', desc:'Finish 3 science lessons', test:(s) => s.science >= 3 },
  { id:'social', emoji:'🌍', title:'Social Explorer', desc:'Finish 3 social science lessons', test:(s) => s.social >= 3 },
];
