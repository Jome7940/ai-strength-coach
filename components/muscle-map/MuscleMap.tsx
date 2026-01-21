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

// Muscle group display names mapping from web app
export type MuscleGroupType = 
  | 'chest' | 'front_delts' | 'side_delts' | 'rear_delts' | 'triceps' 
  | 'biceps' | 'forearms' | 'upper_back' | 'lats' | 'lower_back' 
  | 'traps' | 'abs' | 'obliques' | 'quads' | 'hamstrings' | 'glutes' 
  | 'calves' | 'hip_flexors' | 'adductors';

// Front view muscle paths from web app
const FRONT_PATHS: Record<string, { d: string; muscles: MuscleGroupType[] }> = {
  left_chest: { d: 'M85,75 Q70,85 65,110 L80,130 Q100,135 115,125 L115,80 Q100,72 85,75 Z', muscles: ['chest'] },
  right_chest: { d: 'M175,75 Q190,85 195,110 L180,130 Q160,135 145,125 L145,80 Q160,72 175,75 Z', muscles: ['chest'] },
  left_front_delt: { d: 'M65,75 Q50,80 45,100 L55,115 L65,110 Q68,90 65,75 Z', muscles: ['front_delts'] },
  right_front_delt: { d: 'M195,75 Q210,80 215,100 L205,115 L195,110 Q192,90 195,75 Z', muscles: ['front_delts'] },
  left_side_delt: { d: 'M45,75 Q35,85 35,105 L45,100 Q48,82 45,75 Z', muscles: ['side_delts'] },
  right_side_delt: { d: 'M215,75 Q225,85 225,105 L215,100 Q212,82 215,75 Z', muscles: ['side_delts'] },
  left_bicep: { d: 'M45,115 Q35,130 35,155 L45,170 L55,155 Q55,130 50,115 Z', muscles: ['biceps'] },
  right_bicep: { d: 'M215,115 Q225,130 225,155 L215,170 L205,155 Q205,130 210,115 Z', muscles: ['biceps'] },
  left_forearm: { d: 'M35,170 Q30,190 35,220 L50,225 Q55,200 50,170 Z', muscles: ['forearms'] },
  right_forearm: { d: 'M225,170 Q230,190 225,220 L210,225 Q205,200 210,170 Z', muscles: ['forearms'] },
  upper_abs: { d: 'M115,130 L145,130 L145,160 L115,160 Z', muscles: ['abs'] },
  mid_abs: { d: 'M115,162 L145,162 L145,192 L115,192 Z', muscles: ['abs'] },
  lower_abs: { d: 'M115,194 L145,194 L145,220 Q130,225 115,220 Z', muscles: ['abs'] },
  left_oblique: { d: 'M80,135 L113,135 L113,200 L85,215 Q75,190 75,160 Z', muscles: ['obliques'] },
  right_oblique: { d: 'M180,135 L147,135 L147,200 L175,215 Q185,190 185,160 Z', muscles: ['obliques'] },
  left_quad: { d: 'M85,225 Q75,260 75,310 L95,350 L115,340 Q115,280 105,225 Z', muscles: ['quads'] },
  right_quad: { d: 'M175,225 Q185,260 185,310 L165,350 L145,340 Q145,280 155,225 Z', muscles: ['quads'] },
  left_adductor: { d: 'M107,225 L115,225 L115,280 L105,310 L95,290 Z', muscles: ['adductors'] },
  right_adductor: { d: 'M153,225 L145,225 L145,280 L155,310 L165,290 Z', muscles: ['adductors'] },
  left_shin: { d: 'M85,355 Q80,390 85,430 L105,430 Q110,390 105,350 Z', muscles: ['calves'] },
  right_shin: { d: 'M175,355 Q180,390 175,430 L155,430 Q150,390 155,350 Z', muscles: ['calves'] },
};

// Back view muscle paths from web app
const BACK_PATHS: Record<string, { d: string; muscles: MuscleGroupType[] }> = {
  traps: { d: 'M100,70 L115,75 L130,70 L145,75 L160,70 Q160,90 145,100 L130,95 L115,100 Q100,90 100,70 Z', muscles: ['traps'] },
  left_upper_back: { d: 'M85,100 L113,100 L113,145 L90,145 Q85,125 85,100 Z', muscles: ['upper_back'] },
  right_upper_back: { d: 'M175,100 L147,100 L147,145 L170,145 Q175,125 175,100 Z', muscles: ['upper_back'] },
  left_rear_delt: { d: 'M55,80 Q45,90 45,110 L60,115 Q65,95 60,80 Z', muscles: ['rear_delts'] },
  right_rear_delt: { d: 'M205,80 Q215,90 215,110 L200,115 Q195,95 200,80 Z', muscles: ['rear_delts'] },
  left_lat: { d: 'M65,115 L88,145 L88,195 L70,180 Q55,150 60,115 Z', muscles: ['lats'] },
  right_lat: { d: 'M195,115 L172,145 L172,195 L190,180 Q205,150 200,115 Z', muscles: ['lats'] },
  left_tricep: { d: 'M45,115 Q35,135 38,165 L55,170 Q55,140 50,115 Z', muscles: ['triceps'] },
  right_tricep: { d: 'M215,115 Q225,135 222,165 L205,170 Q205,140 210,115 Z', muscles: ['triceps'] },
  left_forearm_back: { d: 'M38,170 Q33,195 38,220 L55,225 Q58,195 55,170 Z', muscles: ['forearms'] },
  right_forearm_back: { d: 'M222,170 Q227,195 222,220 L205,225 Q202,195 205,170 Z', muscles: ['forearms'] },
  lower_back: { d: 'M95,150 L165,150 L170,195 L165,215 L95,215 L90,195 Z', muscles: ['lower_back'] },
  left_glute: { d: 'M90,220 Q75,240 80,275 L105,285 L115,260 L115,220 Z', muscles: ['glutes'] },
  right_glute: { d: 'M170,220 Q185,240 180,275 L155,285 L145,260 L145,220 Z', muscles: ['glutes'] },
  left_hamstring: { d: 'M80,285 Q75,320 80,360 L100,365 L108,320 L105,285 Z', muscles: ['hamstrings'] },
  right_hamstring: { d: 'M180,285 Q185,320 180,360 L160,365 L152,320 L155,285 Z', muscles: ['hamstrings'] },
  left_calf: { d: 'M80,370 Q75,400 80,430 L100,430 Q105,400 100,365 Z', muscles: ['calves'] },
  right_calf: { d: 'M180,370 Q185,400 180,430 L160,430 Q155,400 160,365 Z', muscles: ['calves'] },
};

const MuscleGroup = ({ name, path, score }: { name: string; path: string; score: number }) => {
  // Normalize score: assuming 10 sets per week is "well trained" (1.0)
  const normalizedScore = (Number(score) || 0) / 10;
  const intensity = Math.min(Math.max(normalizedScore, 0), 1.2); // allow slightly over 1.0 for "overtrained"
  
  // Color scale mirroring web app: muted -> yellow -> emerald -> red
  let fillColor = colors.backgroundSecondary;
  if (intensity > 0) {
    if (intensity < 0.4) fillColor = 'rgba(234, 179, 8, 0.6)'; // yellow (undertrained)
    else if (intensity < 0.7) fillColor = 'rgba(16, 185, 129, 0.6)'; // emerald light (moderate)
    else if (intensity <= 1.0) fillColor = 'rgba(5, 150, 105, 1)'; // emerald dark (well trained)
    else fillColor = 'rgba(239, 68, 68, 0.7)'; // red (overtrained)
  }

  return (
    <Path
      d={path}
      fill={fillColor}
      stroke={intensity > 0 ? colors.primary : colors.border}
      strokeWidth={intensity > 0 ? 0.5 : 0.2}
    />
  );
};

export function MuscleMap({ data = {}, side = 'front' }: MuscleMapProps) {
  const paths = side === 'front' ? FRONT_PATHS : BACK_PATHS;

  return (
    <View style={styles.container}>
      <Svg width="100%" height="240" viewBox="0 0 260 450">
        <G>
          {/* Body Outline from web app */}
          <Path
            d="M130,5 Q165,5 180,30 L185,60 Q220,75 230,110 L235,150 Q240,180 230,220 L215,230 
               Q220,300 205,350 L180,430 L175,445 L165,445 L155,355 L145,355 
               Q130,400 130,445 L130,445 
               Q130,400 115,355 L105,355 L95,445 L85,445 L80,430 L55,350 
               Q40,300 45,230 L30,220 Q20,180 25,150 L30,110 Q40,75 75,60 L80,30 Q95,5 130,5 Z"
            fill={colors.backgroundTertiary}
            stroke={colors.border}
            strokeWidth={1}
          />
          
          {Object.entries(paths).map(([key, { d, muscles }]) => {
            // Calculate average score for this visual path based on underlying muscle groups
            const score = muscles.reduce((acc, m) => acc + (Number(data[m]) || 0), 0) / muscles.length;
            return (
              <MuscleGroup key={key} name={key} path={d} score={score} />
            );
          })}
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
