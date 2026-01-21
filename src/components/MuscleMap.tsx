import { useState } from 'react';
import { motion } from 'framer-motion';
import type { MuscleGroup, MuscleMapData } from '@/types';
import { cn } from '@/lib/utils';

// Simplified data format for dashboard use
type SimpleMuscleData = { sets: number; intensity: number };

interface MuscleMapProps {
  data: Record<MuscleGroup, MuscleMapData | SimpleMuscleData>;
  onMuscleClick?: (muscle: MuscleGroup) => void;
  selectedMuscle?: MuscleGroup | null;
  view?: 'front' | 'back';
  className?: string;
}

// Muscle group display names
const MUSCLE_NAMES: Record<MuscleGroup, string> = {
  chest: 'Chest',
  front_delts: 'Front Delts',
  side_delts: 'Side Delts',
  rear_delts: 'Rear Delts',
  triceps: 'Triceps',
  biceps: 'Biceps',
  forearms: 'Forearms',
  upper_back: 'Upper Back',
  lats: 'Lats',
  lower_back: 'Lower Back',
  traps: 'Traps',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  hip_flexors: 'Hip Flexors',
  adductors: 'Adductors',
};

// Intensity to color mapping
function getIntensityColor(intensity: 0 | 1 | 2 | 3 | 'over'): string {
  switch (intensity) {
    case 0: return 'fill-muted';
    case 1: return 'fill-yellow-500/70 dark:fill-yellow-500/60';
    case 2: return 'fill-emerald-500/70 dark:fill-emerald-500/60';
    case 3: return 'fill-emerald-600 dark:fill-emerald-500';
    case 'over': return 'fill-red-500/70 dark:fill-red-500/60';
    default: return 'fill-muted';
  }
}

// Front view muscle paths
const FRONT_MUSCLES: Record<string, { d: string; muscles: MuscleGroup[] }> = {
  // Head/Neck (decorative)
  head: {
    d: 'M115,20 Q130,10 145,20 L150,50 Q130,55 110,50 Z',
    muscles: [],
  },
  neck: {
    d: 'M118,50 L142,50 L145,70 L115,70 Z',
    muscles: [],
  },
  // Chest
  left_chest: {
    d: 'M85,75 Q70,85 65,110 L80,130 Q100,135 115,125 L115,80 Q100,72 85,75 Z',
    muscles: ['chest'],
  },
  right_chest: {
    d: 'M175,75 Q190,85 195,110 L180,130 Q160,135 145,125 L145,80 Q160,72 175,75 Z',
    muscles: ['chest'],
  },
  // Shoulders
  left_front_delt: {
    d: 'M65,75 Q50,80 45,100 L55,115 L65,110 Q68,90 65,75 Z',
    muscles: ['front_delts'],
  },
  right_front_delt: {
    d: 'M195,75 Q210,80 215,100 L205,115 L195,110 Q192,90 195,75 Z',
    muscles: ['front_delts'],
  },
  left_side_delt: {
    d: 'M45,75 Q35,85 35,105 L45,100 Q48,82 45,75 Z',
    muscles: ['side_delts'],
  },
  right_side_delt: {
    d: 'M215,75 Q225,85 225,105 L215,100 Q212,82 215,75 Z',
    muscles: ['side_delts'],
  },
  // Arms - Biceps
  left_bicep: {
    d: 'M45,115 Q35,130 35,155 L45,170 L55,155 Q55,130 50,115 Z',
    muscles: ['biceps'],
  },
  right_bicep: {
    d: 'M215,115 Q225,130 225,155 L215,170 L205,155 Q205,130 210,115 Z',
    muscles: ['biceps'],
  },
  // Arms - Forearms
  left_forearm: {
    d: 'M35,170 Q30,190 35,220 L50,225 Q55,200 50,170 Z',
    muscles: ['forearms'],
  },
  right_forearm: {
    d: 'M225,170 Q230,190 225,220 L210,225 Q205,200 210,170 Z',
    muscles: ['forearms'],
  },
  // Core - Abs
  upper_abs: {
    d: 'M115,130 L145,130 L145,160 L115,160 Z',
    muscles: ['abs'],
  },
  mid_abs: {
    d: 'M115,162 L145,162 L145,192 L115,192 Z',
    muscles: ['abs'],
  },
  lower_abs: {
    d: 'M115,194 L145,194 L145,220 Q130,225 115,220 Z',
    muscles: ['abs'],
  },
  // Core - Obliques
  left_oblique: {
    d: 'M80,135 L113,135 L113,200 L85,215 Q75,190 75,160 Z',
    muscles: ['obliques'],
  },
  right_oblique: {
    d: 'M180,135 L147,135 L147,200 L175,215 Q185,190 185,160 Z',
    muscles: ['obliques'],
  },
  // Legs - Quads
  left_quad: {
    d: 'M85,225 Q75,260 75,310 L95,350 L115,340 Q115,280 105,225 Z',
    muscles: ['quads'],
  },
  right_quad: {
    d: 'M175,225 Q185,260 185,310 L165,350 L145,340 Q145,280 155,225 Z',
    muscles: ['quads'],
  },
  // Legs - Adductors (inner thigh)
  left_adductor: {
    d: 'M107,225 L115,225 L115,280 L105,310 L95,290 Z',
    muscles: ['adductors'],
  },
  right_adductor: {
    d: 'M153,225 L145,225 L145,280 L155,310 L165,290 Z',
    muscles: ['adductors'],
  },
  // Lower Legs - Shins/Calves front
  left_shin: {
    d: 'M85,355 Q80,390 85,430 L105,430 Q110,390 105,350 Z',
    muscles: ['calves'],
  },
  right_shin: {
    d: 'M175,355 Q180,390 175,430 L155,430 Q150,390 155,350 Z',
    muscles: ['calves'],
  },
};

// Back view muscle paths
const BACK_MUSCLES: Record<string, { d: string; muscles: MuscleGroup[] }> = {
  // Head/Neck (decorative)
  head: {
    d: 'M115,20 Q130,10 145,20 L150,50 Q130,55 110,50 Z',
    muscles: [],
  },
  neck: {
    d: 'M118,50 L142,50 L145,70 L115,70 Z',
    muscles: [],
  },
  // Traps
  traps: {
    d: 'M100,70 L115,75 L130,70 L145,75 L160,70 Q160,90 145,100 L130,95 L115,100 Q100,90 100,70 Z',
    muscles: ['traps'],
  },
  // Upper Back / Rhomboids
  left_upper_back: {
    d: 'M85,100 L113,100 L113,145 L90,145 Q85,125 85,100 Z',
    muscles: ['upper_back'],
  },
  right_upper_back: {
    d: 'M175,100 L147,100 L147,145 L170,145 Q175,125 175,100 Z',
    muscles: ['upper_back'],
  },
  // Rear Delts
  left_rear_delt: {
    d: 'M55,80 Q45,90 45,110 L60,115 Q65,95 60,80 Z',
    muscles: ['rear_delts'],
  },
  right_rear_delt: {
    d: 'M205,80 Q215,90 215,110 L200,115 Q195,95 200,80 Z',
    muscles: ['rear_delts'],
  },
  // Lats
  left_lat: {
    d: 'M65,115 L88,145 L88,195 L70,180 Q55,150 60,115 Z',
    muscles: ['lats'],
  },
  right_lat: {
    d: 'M195,115 L172,145 L172,195 L190,180 Q205,150 200,115 Z',
    muscles: ['lats'],
  },
  // Triceps
  left_tricep: {
    d: 'M45,115 Q35,135 38,165 L55,170 Q55,140 50,115 Z',
    muscles: ['triceps'],
  },
  right_tricep: {
    d: 'M215,115 Q225,135 222,165 L205,170 Q205,140 210,115 Z',
    muscles: ['triceps'],
  },
  // Forearms (back)
  left_forearm: {
    d: 'M38,170 Q33,195 38,220 L55,225 Q58,195 55,170 Z',
    muscles: ['forearms'],
  },
  right_forearm: {
    d: 'M222,170 Q227,195 222,220 L205,225 Q202,195 205,170 Z',
    muscles: ['forearms'],
  },
  // Lower Back
  lower_back: {
    d: 'M95,150 L165,150 L170,195 L165,215 L95,215 L90,195 Z',
    muscles: ['lower_back'],
  },
  // Glutes
  left_glute: {
    d: 'M90,220 Q75,240 80,275 L105,285 L115,260 L115,220 Z',
    muscles: ['glutes'],
  },
  right_glute: {
    d: 'M170,220 Q185,240 180,275 L155,285 L145,260 L145,220 Z',
    muscles: ['glutes'],
  },
  // Hamstrings
  left_hamstring: {
    d: 'M80,285 Q75,320 80,360 L100,365 L108,320 L105,285 Z',
    muscles: ['hamstrings'],
  },
  right_hamstring: {
    d: 'M180,285 Q185,320 180,360 L160,365 L152,320 L155,285 Z',
    muscles: ['hamstrings'],
  },
  // Calves
  left_calf: {
    d: 'M80,370 Q75,400 80,430 L100,430 Q105,400 100,365 Z',
    muscles: ['calves'],
  },
  right_calf: {
    d: 'M180,370 Q185,400 180,430 L160,430 Q155,400 160,365 Z',
    muscles: ['calves'],
  },
};

export function MuscleMap({ data, onMuscleClick, selectedMuscle, view = 'front', className }: MuscleMapProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleGroup | null>(null);
  
  const muscles = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;
  
  const getMuscleIntensity = (muscleGroups: MuscleGroup[]): 0 | 1 | 2 | 3 | 'over' => {
    if (muscleGroups.length === 0) return 0;
    
    // Get the highest intensity from all muscle groups
    let maxIntensity: 0 | 1 | 2 | 3 | 'over' = 0;
    for (const muscle of muscleGroups) {
      const muscleData = data[muscle];
      if (muscleData) {
        // Handle both simple and full data formats
        const intensity = 'intensity' in muscleData ? muscleData.intensity : 0;
        if (intensity === 'over' || (typeof intensity === 'number' && intensity > (maxIntensity as number))) {
          maxIntensity = intensity as 0 | 1 | 2 | 3 | 'over';
        }
      }
    }
    return maxIntensity;
  };
  
  const isSelected = (muscleGroups: MuscleGroup[]): boolean => {
    return muscleGroups.some(m => m === selectedMuscle);
  };
  
  const isHovered = (muscleGroups: MuscleGroup[]): boolean => {
    return muscleGroups.some(m => m === hoveredMuscle);
  };
  
  return (
    <div className={cn('relative', className)}>
      <svg
        viewBox="0 0 260 450"
        className="w-full h-auto"
        style={{ maxHeight: '500px' }}
      >
        {/* Body outline */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="[stop-color:hsl(var(--muted))]" />
            <stop offset="100%" className="[stop-color:hsl(var(--muted)/0.8)]" />
          </linearGradient>
        </defs>
        
        {/* Render muscle groups */}
        {Object.entries(muscles).map(([key, { d, muscles: muscleGroups }]) => {
          const intensity = getMuscleIntensity(muscleGroups);
          const selected = isSelected(muscleGroups);
          const hovered = isHovered(muscleGroups);
          const interactive = muscleGroups.length > 0;
          
          return (
            <motion.path
              key={key}
              d={d}
              className={cn(
                'transition-all duration-300 ease-in-out',
                interactive ? 'cursor-pointer' : '',
                getIntensityColor(intensity),
                selected && 'stroke-primary stroke-[3] drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]',
                hovered && !selected && 'stroke-foreground/30 stroke-2 opacity-95',
                !interactive && 'fill-muted/50'
              )}
              initial={false}
              animate={{
                scale: selected || hovered ? 1.01 : 1,
                translateY: selected || hovered ? -1 : 0,
              }}
              onMouseEnter={() => muscleGroups.length > 0 && setHoveredMuscle(muscleGroups[0])}
              onMouseLeave={() => setHoveredMuscle(null)}
              onClick={() => muscleGroups.length > 0 && onMuscleClick?.(muscleGroups[0])}
            />
          );
        })}
        
        {/* Outline for body shape */}
        <path
          d="M130,5 Q165,5 180,30 L185,60 Q220,75 230,110 L235,150 Q240,180 230,220 L215,230 
             Q220,300 205,350 L180,430 L175,445 L165,445 L155,355 L145,355 
             Q130,400 130,445 L130,445 
             Q130,400 115,355 L105,355 L95,445 L85,445 L80,430 L55,350 
             Q40,300 45,230 L30,220 Q20,180 25,150 L30,110 Q40,75 75,60 L80,30 Q95,5 130,5 Z"
          fill="none"
          className="stroke-border"
          strokeWidth="1.5"
        />
      </svg>
      
      {/* Tooltip */}
      {hoveredMuscle && (
        <div className="absolute top-2 left-2 right-2 bg-card border border-border rounded-lg p-3 shadow-lg z-10">
          <div className="font-medium">{MUSCLE_NAMES[hoveredMuscle]}</div>
          {data[hoveredMuscle] && (
            <div className="text-sm text-muted-foreground mt-1">
              {'effectiveSets' in data[hoveredMuscle] ? (
                <>
                  <div>Sets this week: {(data[hoveredMuscle] as MuscleMapData).effectiveSets} / {(data[hoveredMuscle] as MuscleMapData).targetSets}</div>
                  {(data[hoveredMuscle] as MuscleMapData).exercises?.length > 0 && (
                    <div className="mt-1">
                      Recent: {(data[hoveredMuscle] as MuscleMapData).exercises.slice(0, 2).join(', ')}
                    </div>
                  )}
                </>
              ) : (
                <div>Sets this week: {(data[hoveredMuscle] as SimpleMuscleData).sets}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Dual view component showing both front and back
export function MuscleMapDual({ 
  data, 
  onMuscleClick, 
  selectedMuscle,
  className 
}: Omit<MuscleMapProps, 'view'>) {
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      <div className="text-center">
        <div className="text-sm font-medium text-muted-foreground mb-2">Front</div>
        <MuscleMap
          data={data}
          onMuscleClick={onMuscleClick}
          selectedMuscle={selectedMuscle}
          view="front"
        />
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-muted-foreground mb-2">Back</div>
        <MuscleMap
          data={data}
          onMuscleClick={onMuscleClick}
          selectedMuscle={selectedMuscle}
          view="back"
        />
      </div>
    </div>
  );
}

// Legend component
export function MuscleMapLegend({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-4 text-sm', className)}>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-muted" />
        <span className="text-muted-foreground">Not Trained</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-yellow-500/70" />
        <span className="text-muted-foreground">Undertrained</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-emerald-500/70" />
        <span className="text-muted-foreground">Moderate</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-emerald-600" />
        <span className="text-muted-foreground">Well Trained</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-red-500/70" />
        <span className="text-muted-foreground">Overtrained</span>
      </div>
    </div>
  );
}
