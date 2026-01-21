import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { colors, spacing, typography } from '@/constants/design';

interface MuscleData {
  [key: string]: number; // Score from 0 to 1
}

interface MuscleMapProps {
  data: MuscleData;
  side?: 'front' | 'back';
}

// Simplified muscle map paths for the mobile version
// In a real app, these would be detailed SVG paths for each muscle group
const MuscleGroup = ({ name, path, score, side }: { name: string; path: string; score: number; side: string }) => {
  const intensity = Math.min(Math.max(score, 0), 1);
  // Color scale from light zinc to deep zinc/black
  const fillColor = intensity > 0 
    ? `rgba(24, 24, 27, ${0.1 + intensity * 0.9})`
    : colors.backgroundSecondary;
  
  const strokeColor = colors.border;

  return (
    <Path
      d={path}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="1"
    />
  );
};

export function MuscleMap({ data, side = 'front' }: MuscleMapProps) {
  // Mock paths for visualization - in production these would be real muscle outlines
  const muscles = side === 'front' ? [
    { name: 'chest', path: 'M40,30 Q50,25 60,30 L60,45 Q50,50 40,45 Z', score: data.chest || 0 },
    { name: 'abs', path: 'M42,50 L58,50 L58,80 L42,80 Z', score: data.abs || 0 },
    { name: 'quads_l', path: 'M35,85 L45,85 L45,130 L30,130 Z', score: data.quads || 0 },
    { name: 'quads_r', path: 'M55,85 L65,85 L70,130 L55,130 Z', score: data.quads || 0 },
    { name: 'shoulders_l', path: 'M25,25 Q30,20 35,28 L38,40 L28,42 Z', score: data.shoulders || 0 },
    { name: 'shoulders_r', path: 'M75,25 Q70,20 65,28 L62,40 L72,42 Z', score: data.shoulders || 0 },
  ] : [
    { name: 'back', path: 'M35,25 L65,25 L65,60 L35,60 Z', score: data.back || 0 },
    { name: 'glutes', path: 'M35,65 L65,65 L68,85 L32,85 Z', score: data.glutes || 0 },
    { name: 'hamstrings_l', path: 'M32,90 L45,90 L45,135 L30,135 Z', score: data.hamstrings || 0 },
    { name: 'hamstrings_r', path: 'M55,90 L68,90 L70,135 L55,135 Z', score: data.hamstrings || 0 },
  ];

  return (
    <View style={styles.container}>
      <Svg width="100%" height="200" viewBox="0 0 100 150">
        <G>
          {/* Simple Body Outline */}
          <Path
            d="M50,5 Q55,5 60,10 L60,20 Q50,25 40,20 L40,10 Q45,5 50,5 Z"
            fill={colors.backgroundTertiary}
            stroke={colors.border}
          />
          {muscles.map((m) => (
            <MuscleGroup key={m.name} name={m.name} path={m.path} score={m.score} side={side} />
          ))}
        </G>
      </Svg>
      <Text style={styles.label}>{side === 'front' ? 'Front' : 'Back'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
  },
  label: {
    ...typography.smallBold,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
});
