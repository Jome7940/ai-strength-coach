import type {
  UserProfile,
  Exercise,
  WorkoutTemplate,
  WorkoutExercise,
  MuscleGroup,
  MovementPattern,
  Equipment,
  EquipmentContext,
  WorkoutGeneratorOptions,
  PatternStrength,
  MuscleVolumeEntry,
} from '@/types';
import { exercises, exerciseMap, getExercisesByEquipment } from '@/data/exercises';

// ============================================
// Constants & Configuration
// ============================================

const MUSCLE_TARGETS = {
  weekly: {
    chest: { min: 10, max: 20 },
    front_delts: { min: 6, max: 12 },
    side_delts: { min: 8, max: 16 },
    rear_delts: { min: 8, max: 16 },
    triceps: { min: 6, max: 12 },
    biceps: { min: 6, max: 12 },
    forearms: { min: 4, max: 8 },
    upper_back: { min: 10, max: 20 },
    lats: { min: 10, max: 20 },
    lower_back: { min: 6, max: 12 },
    traps: { min: 6, max: 12 },
    abs: { min: 8, max: 16 },
    obliques: { min: 4, max: 8 },
    quads: { min: 10, max: 20 },
    hamstrings: { min: 8, max: 16 },
    glutes: { min: 8, max: 16 },
    calves: { min: 8, max: 16 },
    hip_flexors: { min: 2, max: 6 },
    adductors: { min: 4, max: 8 },
  },
};

const EQUIPMENT_MAP: Record<EquipmentContext, Equipment[]> = {
  gym: ['full_gym', 'barbell', 'dumbbells', 'kettlebells', 'machines', 'cables', 'bands', 'bodyweight'],
  home: ['dumbbells', 'kettlebells', 'bands', 'bodyweight'],
  travel: ['bands', 'bodyweight'],
  minimal: ['bodyweight'],
};

const DURATION_TEMPLATES = {
  20: { warmup: 3, main: 2, accessories: 1, core: 1 },
  30: { warmup: 4, main: 2, accessories: 2, core: 1 },
  45: { warmup: 5, main: 3, accessories: 3, core: 1 },
  60: { warmup: 6, main: 4, accessories: 4, core: 2 },
};

// ============================================
// Core Workout Generator
// ============================================

export interface GeneratorContext {
  profile: UserProfile;
  muscleVolume: Record<MuscleGroup, number>;
  patternStrength: Map<string, PatternStrength>;
  recentExercises: string[];
  readinessScore: number;
}

export function createEmptyMuscleVolume(): Record<MuscleGroup, number> {
  return {
    chest: 0,
    front_delts: 0,
    side_delts: 0,
    rear_delts: 0,
    triceps: 0,
    biceps: 0,
    forearms: 0,
    upper_back: 0,
    lats: 0,
    lower_back: 0,
    traps: 0,
    abs: 0,
    obliques: 0,
    quads: 0,
    hamstrings: 0,
    glutes: 0,
    calves: 0,
    hip_flexors: 0,
    adductors: 0,
  };
}

export function generateWorkout(
  options: WorkoutGeneratorOptions,
  context: GeneratorContext
): WorkoutTemplate {
  const { duration, equipmentContext, targetMuscles, intensity, isMinimalDose } = options;
  const { profile, muscleVolume, readinessScore } = context;
  
  // Get available equipment
  const availableEquipment = EQUIPMENT_MAP[equipmentContext];
  const availableExercises = getExercisesByEquipment(availableEquipment);
  
  // Filter by difficulty
  const difficultyFiltered = filterByDifficulty(availableExercises, profile.experience);
  
  // Build workout structure
  const template = DURATION_TEMPLATES[duration as keyof typeof DURATION_TEMPLATES] || DURATION_TEMPLATES[45];
  
  // Determine focus based on muscle balance
  const undertrainedMuscles = getUndertrainedMuscles(muscleVolume, profile.trainingDaysPerWeek);
  const focusMuscles = targetMuscles?.length ? targetMuscles : undertrainedMuscles.slice(0, 3);
  
  // Apply readiness-based adjustments
  const adjustedIntensity = adjustIntensityForReadiness(intensity || 'moderate', readinessScore);
  
  // Select exercises
  const warmupExercises = selectWarmupExercises(difficultyFiltered, focusMuscles, template.warmup);
  const mainExercises = selectMainExercises(difficultyFiltered, focusMuscles, profile, template.main, context);
  const accessoryExercises = selectAccessoryExercises(difficultyFiltered, focusMuscles, template.accessories, context);
  const coreExercises = selectCoreExercises(difficultyFiltered, template.core);
  
  // Combine all exercises with proper ordering
  const allExercises: WorkoutExercise[] = [
    ...warmupExercises.map((e, i) => createWorkoutExercise(e, i, true, adjustedIntensity, context)),
    ...mainExercises.map((e, i) => createWorkoutExercise(e, i + warmupExercises.length, false, adjustedIntensity, context)),
    ...accessoryExercises.map((e, i) => createWorkoutExercise(e, i + warmupExercises.length + mainExercises.length, false, adjustedIntensity, context)),
    ...coreExercises.map((e, i) => createWorkoutExercise(e, i + warmupExercises.length + mainExercises.length + accessoryExercises.length, false, adjustedIntensity, context)),
  ];
  
  // Generate rationale
  const rationale = generateRationale(focusMuscles, undertrainedMuscles, readinessScore, adjustedIntensity);
  
  // Calculate target muscles from selected exercises
  const targetMuscleSet = new Set<MuscleGroup>();
  allExercises.forEach(we => {
    we.exercise.primaryMuscles.forEach(m => targetMuscleSet.add(m));
  });
  
  // Get movement patterns used
  const movementPatterns = [...new Set(allExercises.map(we => we.exercise.movementPattern))];
  
  return {
    id: generateId(),
    userId: profile.userId,
    name: generateWorkoutName(focusMuscles),
    description: `${adjustedIntensity.charAt(0).toUpperCase() + adjustedIntensity.slice(1)} intensity ${duration}-minute workout`,
    exercises: allExercises,
    estimatedDuration: duration,
    targetMuscles: [...targetMuscleSet],
    movementPatterns: movementPatterns,
    equipmentContext,
    intensity: adjustedIntensity,
    rationale,
    generatedAt: new Date().toISOString(),
    isLocked: false,
  };
}

// ============================================
// Exercise Selection Functions
// ============================================

function selectWarmupExercises(exercises: Exercise[], focusMuscles: MuscleGroup[], count: number): Exercise[] {
  const warmups = exercises.filter(e => e.category === 'warmup');
  const relevantWarmups = warmups.filter(e => 
    e.primaryMuscles.some(m => focusMuscles.includes(m)) ||
    e.secondaryMuscles.some(m => focusMuscles.includes(m))
  );
  
  // Mix general and specific warmups
  const selected: Exercise[] = [];
  const general = warmups.filter(e => ['arm-circles', 'leg-swings', 'hip-circles', 'jumping-jacks'].includes(e.id));
  const specific = relevantWarmups.filter(e => !general.includes(e));
  
  // Add 1-2 general warmups
  selected.push(...shuffleArray(general).slice(0, Math.min(2, count)));
  
  // Fill rest with specific warmups
  const remaining = count - selected.length;
  selected.push(...shuffleArray(specific).slice(0, remaining));
  
  return selected.slice(0, count);
}

function selectMainExercises(
  exercises: Exercise[],
  focusMuscles: MuscleGroup[],
  profile: UserProfile,
  count: number,
  context: GeneratorContext
): Exercise[] {
  const compounds = exercises.filter(e => e.category === 'compound');
  
  // Score exercises by relevance to focus muscles and variety
  const scored = compounds.map(e => ({
    exercise: e,
    score: scoreExercise(e, focusMuscles, context.recentExercises, profile),
  }));
  
  // Sort by score and pick top exercises
  scored.sort((a, b) => b.score - a.score);
  
  // Ensure variety in movement patterns
  const selected: Exercise[] = [];
  const usedPatterns = new Set<MovementPattern>();
  
  for (const { exercise } of scored) {
    if (selected.length >= count) break;
    
    // Prefer variety but don't require it
    const patternBonus = usedPatterns.has(exercise.movementPattern) ? 0 : 0.5;
    if (selected.length < count) {
      selected.push(exercise);
      usedPatterns.add(exercise.movementPattern);
    }
  }
  
  return selected;
}

function selectAccessoryExercises(
  exercises: Exercise[],
  focusMuscles: MuscleGroup[],
  count: number,
  context: GeneratorContext
): Exercise[] {
  // Include both compounds and isolations for accessories
  const accessories = exercises.filter(e => 
    e.category === 'isolation' || 
    (e.category === 'compound' && e.difficulty === 'beginner')
  );
  
  const scored = accessories.map(e => ({
    exercise: e,
    score: scoreExercise(e, focusMuscles, context.recentExercises, {} as UserProfile) * 0.8,
  }));
  
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, count).map(s => s.exercise);
}

function selectCoreExercises(exercises: Exercise[], count: number): Exercise[] {
  const coreExercises = exercises.filter(e => e.category === 'core');
  return shuffleArray(coreExercises).slice(0, count);
}

function scoreExercise(
  exercise: Exercise,
  focusMuscles: MuscleGroup[],
  recentExercises: string[],
  profile: UserProfile
): number {
  let score = 0;
  
  // Primary muscle match
  const primaryMatch = exercise.primaryMuscles.filter(m => focusMuscles.includes(m));
  score += primaryMatch.length * 10;
  
  // Secondary muscle match
  const secondaryMatch = exercise.secondaryMuscles.filter(m => focusMuscles.includes(m));
  score += secondaryMatch.length * 3;
  
  // Compound exercises get bonus
  if (exercise.category === 'compound') score += 5;
  
  // Variety bonus (not recently done)
  if (!recentExercises.includes(exercise.id)) score += 3;
  
  // Difficulty alignment with experience
  if (profile.experience === exercise.difficulty) score += 2;
  
  return score;
}

// ============================================
// Helper Functions
// ============================================

function createWorkoutExercise(
  exercise: Exercise,
  order: number,
  isWarmup: boolean,
  intensity: 'light' | 'moderate' | 'hard',
  context: GeneratorContext
): WorkoutExercise {
  // Adjust sets/reps based on intensity
  const intensityMultiplier = intensity === 'light' ? 0.8 : intensity === 'hard' ? 1.2 : 1;
  
  const sets = isWarmup ? 1 : Math.round(exercise.defaultSets * intensityMultiplier);
  const rpe = isWarmup ? 4 : Math.min(10, Math.round(exercise.defaultRpe * intensityMultiplier));
  
  // Get target weight from pattern strength if available
  const patternData = context.patternStrength.get(exercise.id);
  const targetWeight = patternData?.lastWeight;
  
  return {
    id: generateId(),
    exerciseId: exercise.id,
    exercise,
    order,
    sets,
    targetReps: exercise.defaultReps,
    targetRpe: rpe,
    targetWeight,
    restSeconds: isWarmup ? 30 : getRestTime(exercise, intensity),
    notes: '',
    isWarmup,
  };
}

function getRestTime(exercise: Exercise, intensity: 'light' | 'moderate' | 'hard'): number {
  const baseRest = exercise.category === 'compound' ? 120 : 60;
  const multiplier = intensity === 'hard' ? 1.3 : intensity === 'light' ? 0.8 : 1;
  return Math.round(baseRest * multiplier);
}

function filterByDifficulty(exercises: Exercise[], experience: string): Exercise[] {
  const allowedDifficulties = {
    beginner: ['beginner'],
    intermediate: ['beginner', 'intermediate'],
    advanced: ['beginner', 'intermediate', 'advanced'],
  };
  
  return exercises.filter(e => 
    allowedDifficulties[experience as keyof typeof allowedDifficulties]?.includes(e.difficulty)
  );
}

function getUndertrainedMuscles(volume: Record<MuscleGroup, number>, trainingDays: number): MuscleGroup[] {
  const weeklyFactor = trainingDays / 4; // Normalize to 4-day base
  
  const underTrained: { muscle: MuscleGroup; deficit: number }[] = [];
  
  for (const [muscle, sets] of Object.entries(volume)) {
    const targets = MUSCLE_TARGETS.weekly[muscle as MuscleGroup];
    if (targets) {
      const adjustedMin = targets.min * weeklyFactor;
      if (sets < adjustedMin) {
        underTrained.push({ muscle: muscle as MuscleGroup, deficit: adjustedMin - sets });
      }
    }
  }
  
  // Sort by biggest deficit
  underTrained.sort((a, b) => b.deficit - a.deficit);
  
  return underTrained.map(u => u.muscle);
}

function adjustIntensityForReadiness(
  baseIntensity: 'light' | 'moderate' | 'hard',
  readinessScore: number
): 'light' | 'moderate' | 'hard' {
  if (readinessScore <= 2) return 'light';
  if (readinessScore >= 4 && baseIntensity === 'moderate') return 'hard';
  if (readinessScore <= 3 && baseIntensity === 'hard') return 'moderate';
  return baseIntensity;
}

function generateWorkoutName(focusMuscles: MuscleGroup[]): string {
  if (focusMuscles.length === 0) return 'Full Body Workout';
  
  const muscleNames: Record<MuscleGroup, string> = {
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
    abs: 'Core',
    obliques: 'Obliques',
    quads: 'Quads',
    hamstrings: 'Hamstrings',
    glutes: 'Glutes',
    calves: 'Calves',
    hip_flexors: 'Hip Flexors',
    adductors: 'Adductors',
  };
  
  const names = focusMuscles.slice(0, 3).map(m => muscleNames[m]);
  
  if (names.length === 1) return `${names[0]} Focus`;
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]}, ${names[1]} & ${names[2]}`;
}

function generateRationale(
  focusMuscles: MuscleGroup[],
  undertrainedMuscles: MuscleGroup[],
  readiness: number,
  intensity: 'light' | 'moderate' | 'hard'
): string[] {
  const rationale: string[] = [];
  
  // Focus explanation
  if (focusMuscles.length > 0) {
    rationale.push(`Targeting ${focusMuscles.slice(0, 3).join(', ')} based on your training balance.`);
  }
  
  // Undertrained muscles
  if (undertrainedMuscles.length > 0) {
    rationale.push(`Prioritizing undertrained muscles: ${undertrainedMuscles.slice(0, 2).join(', ')}.`);
  }
  
  // Readiness adjustment
  if (readiness <= 2) {
    rationale.push('Reduced intensity due to lower readiness score.');
  } else if (readiness >= 4) {
    rationale.push('You\'re well-recovered - optimizing for progress.');
  }
  
  // Intensity explanation
  rationale.push(`${intensity.charAt(0).toUpperCase() + intensity.slice(1)} intensity to match your current state.`);
  
  return rationale;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================
// Progressive Overload & Plateau Detection
// ============================================

export function calculateE1RM(weight: number, reps: number): number {
  // Epley formula: e1RM = weight * (1 + reps/30)
  return weight * (1 + reps / 30);
}

export function suggestNextWeight(
  patternStrength: PatternStrength,
  lastReps: number,
  lastRpe: number,
  targetReps: string
): { weight: number; reps: string; rationale: string } {
  const [minReps, maxReps] = targetReps.split('-').map(Number);
  const currentWeight = patternStrength.lastWeight || 0;
  
  // If hit top of range at target RPE (7-8), increase weight
  if (lastReps >= maxReps && lastRpe <= 8) {
    const increase = currentWeight > 100 ? 5 : 2.5;
    return {
      weight: currentWeight + increase,
      reps: targetReps,
      rationale: `You hit ${lastReps} reps at RPE ${lastRpe}. Time to increase weight by ${increase}lbs.`,
    };
  }
  
  // If failed to hit minimum reps or RPE too high, maintain or reduce
  if (lastReps < minReps || lastRpe >= 9.5) {
    return {
      weight: currentWeight,
      reps: targetReps,
      rationale: `Maintaining weight to build strength at this load before progressing.`,
    };
  }
  
  // Otherwise maintain
  return {
    weight: currentWeight,
    reps: targetReps,
    rationale: `Good progress! Continue building reps at current weight.`,
  };
}

export function detectPlateau(
  patternStrength: PatternStrength,
  recentE1RMs: number[]
): { isPlateau: boolean; reason?: string } {
  if (recentE1RMs.length < 4) return { isPlateau: false };
  
  // Check if e1RM has been flat for 4+ exposures
  const recent = recentE1RMs.slice(-4);
  const variance = calculateVariance(recent);
  const avgE1RM = recent.reduce((a, b) => a + b, 0) / recent.length;
  
  // Less than 2% variance over 4 exposures = plateau
  if (variance / avgE1RM < 0.02) {
    return {
      isPlateau: true,
      reason: `e1RM has been flat at ~${Math.round(avgE1RM)}lbs for ${recent.length} sessions.`,
    };
  }
  
  return { isPlateau: false };
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

export function generatePlateauIntervention(
  exercise: Exercise,
  patternStrength: PatternStrength
): { type: string; description: string; exercises?: string[] } {
  const interventions = [
    {
      type: 'backoff',
      description: `Take a backoff set: reduce weight by 10-15% and do 2 extra reps.`,
    },
    {
      type: 'rep_change',
      description: `Switch rep scheme: if doing 5x5, try 3x8. Different stimulus same muscle.`,
    },
    {
      type: 'variation_swap',
      description: `Try a variation: ${exercise.variations.slice(0, 2).join(' or ')}.`,
      exercises: exercise.variations.slice(0, 2),
    },
    {
      type: 'deload',
      description: `Mini-deload: reduce volume by 40% this week, then return to normal.`,
    },
  ];
  
  // Pick based on how long plateau has been going
  const index = Math.min(patternStrength.exposures % interventions.length, interventions.length - 1);
  return interventions[index];
}

// ============================================
// Minimum Effective Dose Workouts
// ============================================

export function generateMinimalDoseWorkout(
  context: GeneratorContext
): WorkoutTemplate {
  return generateWorkout(
    {
      duration: 20,
      equipmentContext: 'minimal',
      intensity: 'moderate',
      isMinimalDose: true,
    },
    context
  );
}

// ============================================
// Exercise Substitution
// ============================================

export function findSubstitute(
  exercise: Exercise,
  availableEquipment: Equipment[],
  excludeIds: string[] = []
): Exercise | null {
  // Find exercises with same primary muscles and movement pattern
  const candidates = exercises.filter(e => 
    e.id !== exercise.id &&
    !excludeIds.includes(e.id) &&
    e.primaryMuscles.some(m => exercise.primaryMuscles.includes(m)) &&
    e.movementPattern === exercise.movementPattern &&
    e.equipment.some(eq => availableEquipment.includes(eq))
  );
  
  if (candidates.length === 0) {
    // Fallback: same muscles, any pattern
    const fallbackCandidates = exercises.filter(e =>
      e.id !== exercise.id &&
      !excludeIds.includes(e.id) &&
      e.primaryMuscles.some(m => exercise.primaryMuscles.includes(m)) &&
      e.equipment.some(eq => availableEquipment.includes(eq))
    );
    return fallbackCandidates[0] || null;
  }
  
  // Score by similarity
  const scored = candidates.map(c => ({
    exercise: c,
    score: 
      (c.difficulty === exercise.difficulty ? 2 : 0) +
      (c.category === exercise.category ? 2 : 0) +
      c.primaryMuscles.filter(m => exercise.primaryMuscles.includes(m)).length,
  }));
  
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.exercise || null;
}
