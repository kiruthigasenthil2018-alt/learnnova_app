import React from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { F } from '../theme';

// One back button used by every page. `light` = white (for dark headers), otherwise uses `color`.
export function BackButton({ onPress, label = 'Back', light = true, color = '#fff', style }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10}
      style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', gap:4, paddingVertical:8, paddingHorizontal:10, minHeight:44, opacity:pressed ? 0.6 : 1 }, style]}>
      <Ionicons name="arrow-back" size={24} color={light ? '#fff' : color} />
      <Text style={{ color:light ? '#fff' : color, fontFamily:F.bold, fontSize:15 }}>{label}</Text>
    </Pressable>
  );
}
// Goes back if there is a previous page, otherwise to Home.
export const goBackOrHome = (navigation) => () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main', { screen:'Home' }));
