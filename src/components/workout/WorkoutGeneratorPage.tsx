import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Clock,
  Zap,
  RefreshCw,
  ChevronLeft,
  Play,
  Target,
  Info,
  Settings2,
  Sparkles,
  Home,
  Plane,
  Building2,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type {
  UserProfile,
  WorkoutTemplate,
  WorkoutExercise,
  MuscleGroup,
  EquipmentContext,
  PatternStrength,
} from '@/types';
import { generateWorkout, type GeneratorContext, createEmptyMuscleVolume } from '@/lib/workout-generator';

interface WorkoutGeneratorPageProps {
  profile: UserProfile;
  onBack: () => void;
  onStartWorkout: (workout: WorkoutTemplate) => void;
}

const DURATION_OPTIONS = [
  { value: 20, label: '20 min', description: 'Quick & effective' },
  { value: 30, label: '30 min', description: 'Balanced session' },
  { value: 45, label: '45 min', description: 'Full workout' },
  { value: 60, label: '60 min', description: 'Extended session' },
];

const EQUIPMENT_CONTEXTS: { value: EquipmentContext; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'gym', label: 'Full Gym', icon: <Building2 className="w-4 h-4" />, description: 'Access to all equipment' },
  { value: 'home', label: 'Home Gym', icon: <Home className="w-4 h-4" />, description: 'Dumbbells, bands, etc.' },
  { value: 'travel', label: 'Travel', icon: <Plane className="w-4 h-4" />, description: 'Bands & bodyweight' },
  { value: 'minimal', label: 'No Equipment', icon: <Dumbbell className="w-4 h-4" />, description: 'Bodyweight only' },
];

const MUSCLE_GROUPS: { value: MuscleGroup; label: string; category: 'upper' | 'lower' | 'core' }[] = [
  { value: 'chest', label: 'Chest', category: 'upper' },
  { value: 'upper_back', label: 'Upper Back', category: 'upper' },
  { value: 'lats', label: 'Lats', category: 'upper' },
  { value: 'front_delts', label: 'Front Delts', category: 'upper' },
  { value: 'side_delts', label: 'Side Delts', category: 'upper' },
  { value: 'rear_delts', label: 'Rear Delts', category: 'upper' },
  { value: 'biceps', label: 'Biceps', category: 'upper' },
  { value: 'triceps', label: 'Triceps', category: 'upper' },
  { value: 'traps', label: 'Traps', category: 'upper' },
  { value: 'forearms', label: 'Forearms', category: 'upper' },
  { value: 'quads', label: 'Quads', category: 'lower' },
  { value: 'hamstrings', label: 'Hamstrings', category: 'lower' },
  { value: 'glutes', label: 'Glutes', category: 'lower' },
  { value: 'calves', label: 'Calves', category: 'lower' },
  { value: 'adductors', label: 'Adductors', category: 'lower' },
  { value: 'abs', label: 'Abs', category: 'core' },
  { value: 'obliques', label: 'Obliques', category: 'core' },
  { value: 'lower_back', label: 'Lower Back', category: 'core' },
];

export function WorkoutGeneratorPage({
  profile,
  onBack,
  onStartWorkout,
}: WorkoutGeneratorPageProps) {
  const [duration, setDuration] = useState(profile.sessionDurationMinutes);
  const [equipmentContext, setEquipmentContext] = useState<EquipmentContext>('gym');
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'hard'>('moderate');
  const [targetMuscles, setTargetMuscles] = useState<MuscleGroup[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<WorkoutTemplate | null>(null);
  const [generationsCount, setGenerationsCount] = useState(0);

  const isPro = profile.subscriptionTier === 'pro';
  const hasReachedLimit = !isPro && generationsCount >= 3;

  // Generate workout on mount and when options change
  const handleGenerate = () => {
    if (hasReachedLimit) {
      toast.error('You\'ve reached your free daily limit. Upgrade to Pro for unlimited workouts!');
      return;
    }

    setIsGenerating(true);
    
    // Simulate a brief delay for UI feedback
    setTimeout(() => {
      // Create mock context (in real app, fetch from DB)
      const context: GeneratorContext = {
        profile,
        muscleVolume: createEmptyMuscleVolume(),
        patternStrength: new Map<string, PatternStrength>(),
        recentExercises: [],
        readinessScore: 4, // Default good readiness
      };

      const workout = generateWorkout(
        {
          duration,
          equipmentContext,
          intensity,
          targetMuscles: targetMuscles.length > 0 ? targetMuscles : undefined,
          isMinimalDose: duration <= 20,
        },
        context
      );

      setGenerationsCount(prev => prev + 1);
      setGeneratedWorkout(workout);
      setIsGenerating(false);
    }, 800);
  };

  // Generate on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  const toggleMuscle = (muscle: MuscleGroup) => {
    setTargetMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Generate Workout</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Options */}
        <div className="grid grid-cols-2 gap-4">
          {/* Duration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={duration.toString()}
                onValueChange={(v) => setDuration(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {opt.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Equipment Context */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={equipmentContext}
                onValueChange={(v) => setEquipmentContext(v as EquipmentContext)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_CONTEXTS.map((ctx) => (
                    <SelectItem key={ctx.value} value={ctx.value}>
                      <div className="flex items-center gap-2">
                        {ctx.icon}
                        <span className="font-medium">{ctx.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Intensity Slider */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Intensity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Light</span>
                <span>Moderate</span>
                <span>Hard</span>
              </div>
              <Slider
                value={[intensity === 'light' ? 0 : intensity === 'moderate' ? 50 : 100]}
                onValueChange={(v) => {
                  const val = v[0];
                  setIntensity(val < 33 ? 'light' : val < 67 ? 'moderate' : 'hard');
                }}
                max={100}
                step={50}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground text-center">
                {intensity === 'light' && 'Recovery-focused session with moderate loads'}
                {intensity === 'moderate' && 'Balanced effort for consistent progress'}
                {intensity === 'hard' && 'Push your limits with heavier loads'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Advanced Options
              </span>
              <span className="text-xs text-muted-foreground">
                {showAdvanced ? 'Hide' : 'Show'}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Target Muscles (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  Select specific muscles to focus on. Leave empty for AI to auto-balance.
                </p>
                <div className="space-y-4">
                  {(['upper', 'lower', 'core'] as const).map((category) => (
                    <div key={category}>
                      <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">
                        {category === 'upper' ? 'Upper Body' : category === 'lower' ? 'Lower Body' : 'Core'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {MUSCLE_GROUPS.filter(m => m.category === category).map((muscle) => (
                          <Button
                            key={muscle.value}
                            variant={targetMuscles.includes(muscle.value) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleMuscle(muscle.value)}
                            className="text-xs h-8"
                          >
                            {muscle.label}
                            {targetMuscles.includes(muscle.value) && (
                              <Check className="w-3 h-3 ml-1" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {targetMuscles.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4 text-xs"
                    onClick={() => setTargetMuscles([])}
                  >
                    Clear Selection
                  </Button>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="w-full h-12 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              {generatedWorkout ? 'Regenerate Workout' : 'Generate Workout'}
            </>
          )}
        </Button>

        {/* Generated Workout */}
        <AnimatePresence mode="wait">
          {generatedWorkout && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WorkoutPreview
                workout={generatedWorkout}
                onStart={() => onStartWorkout(generatedWorkout)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Workout Preview Component
function WorkoutPreview({
  workout,
  onStart,
}: {
  workout: WorkoutTemplate;
  onStart: () => void;
}) {
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const warmupExercises = workout.exercises.filter(e => e.isWarmup);
  const mainExercises = workout.exercises.filter(e => !e.isWarmup);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b border-primary/20 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                AI Generated
              </Badge>
              <Badge variant="outline" className="text-xs">
                {workout.intensity} intensity
              </Badge>
            </div>
            <h2 className="text-xl font-bold">{workout.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {workout.description}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {workout.estimatedDuration} min
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {workout.exercises.length} exercises
            </div>
          </div>
        </div>

        {/* Target Muscles */}
        <div className="flex flex-wrap gap-1.5">
          {workout.targetMuscles.slice(0, 6).map((muscle) => (
            <span
              key={muscle}
              className="text-xs px-2 py-1 bg-background rounded-full capitalize"
            >
              {muscle.replace('_', ' ')}
            </span>
          ))}
          {workout.targetMuscles.length > 6 && (
            <span className="text-xs px-2 py-1 bg-background rounded-full">
              +{workout.targetMuscles.length - 6} more
            </span>
          )}
        </div>
      </div>

      {/* AI Rationale */}
      {workout.rationale.length > 0 && (
        <div className="px-6 py-4 bg-secondary/30 border-b border-border">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <div>
              <h4 className="text-sm font-medium mb-1">Why this workout?</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {workout.rationale.map((reason, i) => (
                  <li key={i}>• {reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Exercise List */}
      <CardContent className="p-0">
        {/* Warmup Section */}
        {warmupExercises.length > 0 && (
          <div className="border-b border-border">
            <div className="px-6 py-3 bg-secondary/20">
              <h3 className="text-sm font-medium text-muted-foreground">
                Warm-Up ({warmupExercises.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {warmupExercises.map((exercise) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  isExpanded={expandedExercise === exercise.id}
                  onToggle={() =>
                    setExpandedExercise(
                      expandedExercise === exercise.id ? null : exercise.id
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Exercises */}
        <div>
          <div className="px-6 py-3 bg-secondary/20 border-b border-border">
            <h3 className="text-sm font-medium text-muted-foreground">
              Main Workout ({mainExercises.length})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {mainExercises.map((exercise, index) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                index={index + 1}
                isExpanded={expandedExercise === exercise.id}
                onToggle={() =>
                  setExpandedExercise(
                    expandedExercise === exercise.id ? null : exercise.id
                  )
                }
              />
            ))}
          </div>
        </div>
      </CardContent>

      {/* Start Button */}
      <div className="p-6 border-t border-border bg-background">
        <Button onClick={onStart} size="lg" className="w-full gap-2">
          <Play className="w-5 h-5" />
          Start Workout
        </Button>
      </div>
    </Card>
  );
}

// Exercise Row Component
function ExerciseRow({
  exercise,
  index,
  isExpanded,
  onToggle,
}: {
  exercise: WorkoutExercise;
  index?: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const e = exercise.exercise;

  return (
    <div className="hover:bg-secondary/30 transition-colors">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center gap-4 text-left"
      >
        {/* Index or Warmup Icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          exercise.isWarmup ? 'bg-secondary' : 'bg-primary/10'
        }`}>
          {exercise.isWarmup ? (
            <Zap className="w-4 h-4 text-muted-foreground" />
          ) : (
            <span className="text-sm font-medium">{index}</span>
          )}
        </div>

        {/* Exercise Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{e.name}</h4>
          <p className="text-sm text-muted-foreground">
            {exercise.sets} × {exercise.targetReps}
            {exercise.targetWeight && ` @ ${exercise.targetWeight}lbs`}
            {!exercise.isWarmup && ` • RPE ${exercise.targetRpe}`}
          </p>
        </div>

        {/* Rest Time */}
        <div className="text-sm text-muted-foreground shrink-0">
          {exercise.restSeconds}s rest
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 pl-18">
              <div className="ml-12 p-4 bg-secondary/50 rounded-lg space-y-3">
                {/* Muscles */}
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Muscles:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {e.primaryMuscles.map(m => (
                      <Badge key={m} variant="default" className="text-xs">
                        {m.replace('_', ' ')}
                      </Badge>
                    ))}
                    {e.secondaryMuscles.map(m => (
                      <Badge key={m} variant="outline" className="text-xs">
                        {m.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Instructions:
                  </span>
                  <p className="text-sm mt-1">{e.instructions}</p>
                </div>

                {/* Cues */}
                {e.cues.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Cues:
                    </span>
                    <ul className="text-sm mt-1 space-y-0.5">
                      {e.cues.map((cue, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function
function createEmptyMuscleVolume(): Record<MuscleGroup, number> {
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
