import React from 'react';
import { useStore, isNursery } from '../theme';
import NurseryHome from './NurseryHome';
import GradeHome from './GradeHome';

// The Learn tab shows the right dashboard for the chosen learner.
export default function LearnScreen(props) {
  const { data } = useStore();
  return isNursery(data.learner.level) ? <NurseryHome {...props} /> : <GradeHome {...props} />;
}
