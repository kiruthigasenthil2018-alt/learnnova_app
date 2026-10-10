import React, { useMemo, useRef } from 'react';
import { View, PanResponder, Platform } from 'react-native';

// Wrap anything to make it swipeable (finger on phones, mouse drag on desktop).
// Vertical scrolling still works: we only react to clearly horizontal moves.
export function SwipeArea({ children, onSwipeLeft, onSwipeRight, style }) {
  const cb = useRef({}); cb.current = { onSwipeLeft, onSwipeRight };
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder:() => false,
    onMoveShouldSetPanResponder:(_, g) => Math.abs(g.dx) > 18 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
    onPanResponderTerminationRequest:() => true,
    onPanResponderRelease:(_, g) => {
      if (g.dx < -50) cb.current.onSwipeLeft && cb.current.onSwipeLeft();
      else if (g.dx > 50) cb.current.onSwipeRight && cb.current.onSwipeRight();
    },
  }), []);
  return <View style={[style, Platform.OS === 'web' ? { touchAction:'pan-y', userSelect:'none' } : null]} {...pan.panHandlers}>{children}</View>;
}
