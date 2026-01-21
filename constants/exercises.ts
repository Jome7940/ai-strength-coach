export interface ExerciseInfo {
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

export const EXERCISE_DATABASE: Record<string, ExerciseInfo> = {
  'Bench Press': {
    name: 'Bench Press',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['front_delts', 'triceps'],
  },
  'Squats': {
    name: 'Squats',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'hamstrings', 'lower_back'],
  },
  'Deadlift': {
    name: 'Deadlift',
    primaryMuscles: ['glutes', 'hamstrings'],
    secondaryMuscles: ['lower_back', 'traps', 'forearms'],
  },
  'Overhead Press': {
    name: 'Overhead Press',
    primaryMuscles: ['front_delts'],
    secondaryMuscles: ['side_delts', 'triceps', 'traps'],
  },
  'Pull Ups': {
    name: 'Pull Ups',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'upper_back', 'rear_delts'],
  },
  'Bicep Curls': {
    name: 'Bicep Curls',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
  },
  'Tricep Extensions': {
    name: 'Tricep Extensions',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
  },
  'Leg Press': {
    name: 'Leg Press',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'adductors'],
  },
  'Rows': {
    name: 'Rows',
    primaryMuscles: ['upper_back', 'lats'],
    secondaryMuscles: ['biceps', 'rear_delts', 'traps'],
  },
  'Lateral Raises': {
    name: 'Lateral Raises',
    primaryMuscles: ['side_delts'],
    secondaryMuscles: ['traps'],
  },
  'Leg Curls': {
    name: 'Leg Curls',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
  },
  'Calf Raises': {
    name: 'Calf Raises',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
  },
  'Plank': {
    name: 'Plank',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques', 'shoulders'],
  },
};
