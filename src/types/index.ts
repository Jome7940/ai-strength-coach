// ============================================
// AI Strength Coach - Core Type Definitions
// ============================================

// User Profile & Settings
export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  goal: 'strength' | 'hypertrophy' | 'general_fitness';
  experience: 'beginner' | 'intermediate' | 'advanced';
  trainingDaysPerWeek: number; // 2-6
  sessionDurationMinutes: number; // 20, 30, 45, 60
  equipment: Equipment[];
  constraints: UserConstraints;
  bodyweight?: number;
  estimatedMaxes?: EstimatedMaxes;
  onboardingCompleted: boolean;
  subscriptionTier: 'free' | 'pro';
  createdAt: string;
  updatedAt: string;
}

export type Equipment = 
  | 'full_gym'
  | 'barbell'
  | 'dumbbells'
  | 'kettlebells'
  | 'machines'
  | 'cables'
  | 'bands'
  | 'bodyweight';

export interface UserConstraints {
  excludedExercises: string[];
  excludedMovements: string[];
  injuries: string[];
  preferences: string[];
}

export interface EstimatedMaxes {
  bench?: number;
  squat?: number;
  deadlift?: number;
  overheadPress?: number;
}

// Equipment Context for workout generation
export type EquipmentContext = 'gym' | 'home' | 'travel' | 'minimal';

// ============================================
// Exercise Library
// ============================================

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  movementPattern: MovementPattern;
  equipment: Equipment[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: ExerciseCategory;
  instructions: string;
  cues: string[];
  variations: string[];
  regressions: string[];
  progressions: string[];
  contraindications: string[];
  videoUrl?: string;
  imageUrl?: string;
  defaultSets: number;
  defaultReps: string; // e.g., "8-12"
  defaultRpe: number;
  estimatedTimeSeconds: number;
}

export type MuscleGroup =
  | 'chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'triceps'
  | 'biceps'
  | 'forearms'
  | 'upper_back'
  | 'lats'
  | 'lower_back'
  | 'traps'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'hip_flexors'
  | 'adductors';

export type MovementPattern =
  | 'horizontal_push'
  | 'horizontal_pull'
  | 'vertical_push'
  | 'vertical_pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'carry'
  | 'core'
  | 'isolation';

export type ExerciseCategory =
  | 'compound'
  | 'isolation'
  | 'warmup'
  | 'core'
  | 'cardio'
  | 'mobility';

// ============================================
// Workout Templates & Planning
// ============================================

export interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  estimatedDuration: number;
  targetMuscles: MuscleGroup[];
  movementPatterns: MovementPattern[];
  equipmentContext: EquipmentContext;
  intensity: 'light' | 'moderate' | 'hard';
  rationale: string[];
  generatedAt: string;
  isLocked: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: number;
  targetReps: string;
  targetRpe: number;
  targetWeight?: number;
  restSeconds: number;
  notes: string;
  supersetGroup?: number;
  isWarmup: boolean;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  templateId: string;
  template?: WorkoutTemplate;
  scheduledDate: string;
  equipmentContext: EquipmentContext;
  targetDuration: number;
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Workout Sessions & Logging
// ============================================

export interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string;
  templateId?: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  exercises: SessionExercise[];
  totalVolume: number;
  totalSets: number;
  duration: number;
  muscleVolume: Record<MuscleGroup, number>;
  prs: PersonalRecord[];
  notes: string;
  rating?: number;
  readinessScore?: number;
}

export interface SessionExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  order: number;
  sets: SetLog[];
  notes: string;
}

export interface SetLog {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup: boolean;
  isDropSet: boolean;
  completedAt: string;
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  type: 'weight' | 'reps' | 'volume' | 'e1rm';
  value: number;
  previousValue?: number;
  achievedAt: string;
  sessionId: string;
}

// ============================================
// Progress & Analytics
// ============================================

export interface MuscleVolumeEntry {
  id: string;
  userId: string;
  muscleGroup: MuscleGroup;
  effectiveSets: number;
  weekNumber: number;
  year: number;
  createdAt: string;
}

export interface PatternStrength {
  id: string;
  userId: string;
  exerciseId: string;
  estimatedOneRepMax: number;
  lastWeight: number;
  lastReps: number;
  lastRpe?: number;
  exposures: number;
  trend: 'improving' | 'plateau' | 'declining';
  updatedAt: string;
}

export interface PlateauEvent {
  id: string;
  userId: string;
  exerciseId: string;
  detectedAt: string;
  e1rmAtDetection: number;
  exposuresSinceProgress: number;
  intervention?: Intervention;
  resolved: boolean;
  resolvedAt?: string;
}

export interface Intervention {
  type: 'backoff' | 'rep_change' | 'variation_swap' | 'deload';
  description: string;
  appliedAt: string;
  successful?: boolean;
}

// ============================================
// Readiness & Autoregulation
// ============================================

export interface ReadinessCheck {
  id: string;
  userId: string;
  date: string;
  sleepQuality: number; // 1-5
  energyLevel: number; // 1-5
  soreness: number; // 1-5 (higher = more sore)
  stressLevel: number; // 1-5 (higher = more stress)
  overallScore: number; // computed
  notes?: string;
}

// ============================================
// Periodization
// ============================================

export interface TrainingBlock {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  phase: 'accumulation' | 'intensification' | 'realization' | 'deload';
  weekNumber: number;
  totalWeeks: number;
  focusMuscles: MuscleGroup[];
  notes: string;
}

// ============================================
// UI State Types
// ============================================

export interface WorkoutGeneratorOptions {
  duration: number;
  equipmentContext: EquipmentContext;
  targetMuscles?: MuscleGroup[];
  intensity?: 'light' | 'moderate' | 'hard';
  excludeExercises?: string[];
  isMinimalDose?: boolean;
}

export interface MuscleMapData {
  muscleGroup: MuscleGroup;
  effectiveSets: number;
  targetSets: number;
  intensity: 0 | 1 | 2 | 3 | 'over';
  exercises: string[];
  trend: 'improving' | 'stable' | 'declining';
}

// Utility type for database records
export type DbRecord<T> = Omit<T, 'id'> & { id?: string };
