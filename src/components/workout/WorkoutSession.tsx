import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Minus,
  Plus,
  Timer,
  Dumbbell,
  Zap,
  Flag,
  MoreVertical,
  Edit2,
  SkipForward,
  Trophy,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type {
  WorkoutTemplate,
  WorkoutExercise,
  WorkoutSession as WorkoutSessionType,
  SessionExercise,
  SetLog,
  MuscleGroup,
} from '@/types';

interface WorkoutSessionProps {
  workout: WorkoutTemplate;
  onComplete: (session: WorkoutSessionType) => void;
  onExit: () => void;
}

export function WorkoutSessionView({
  workout,
  onComplete,
  onExit,
}: WorkoutSessionProps) {
  // Exercise navigation
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  
  // Session data
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    () => initializeSessionExercises(workout.exercises)
  );
  const [startTime] = useState(new Date().toISOString());
  
  // Rest timer
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(0);
  
  // Current set input
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [rpe, setRpe] = useState(7);
  const [exerciseNotes, setExerciseNotes] = useState('');
  
  // Dialogs
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showRationale, setShowRationale] = useState(false);
  
  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const progress = ((currentExerciseIndex + currentSetIndex / currentExercise.sets) / totalExercises) * 100;

  // Initialize weight/reps from current exercise
  useEffect(() => {
    if (currentExercise) {
      setWeight(currentExercise.targetWeight || 0);
      const [minReps] = currentExercise.targetReps.split('-').map(Number);
      setReps(minReps || 10);
      setRpe(currentExercise.targetRpe || 7);
    }
  }, [currentExerciseIndex, currentExercise]);

  // Rest timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTime > 0) {
      interval = setInterval(() => {
        setRestTime((t) => {
          if (t <= 1) {
            setIsResting(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTime]);

  // Log a set
  const logSet = useCallback(() => {
    const setLog: SetLog = {
      id: generateId(),
      setNumber: currentSetIndex + 1,
      weight,
      reps,
      rpe,
      isWarmup: currentExercise.isWarmup,
      isDropSet: false,
      completedAt: new Date().toISOString(),
    };

    setSessionExercises((prev) => {
      const updated = [...prev];
      updated[currentExerciseIndex].sets.push(setLog);
      updated[currentExerciseIndex].notes = exerciseNotes;
      return updated;
    });

    // Auto-suggest next set targets
    const [minReps, maxReps] = currentExercise.targetReps.split('-').map(Number);
    const isSuccess = reps >= (maxReps || minReps);
    const isEasy = rpe <= 7;

    // Check if this was the last set
    if (currentSetIndex >= currentExercise.sets - 1) {
      // Move to next exercise
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex((i) => i + 1);
        setCurrentSetIndex(0);
        setExerciseNotes(''); // Reset notes for next exercise
      } else {
        // Workout complete
        setShowCompleteDialog(true);
        return;
      }
    } else {
      // Move to next set
      setCurrentSetIndex((s) => s + 1);
      
      // Auto-regulation logic for the next set
      if (isSuccess && isEasy && !currentExercise.isWarmup) {
        // If it was too easy, suggest a small bump for the next set
        setWeight(w => w + 5);
        toast.success('Nice work! Increasing weight for the next set.', {
          icon: '🚀',
        });
      }
    }

    // Start rest timer
    setRestDuration(currentExercise.restSeconds);
    setRestTime(currentExercise.restSeconds);
    setIsResting(true);
  }, [currentExerciseIndex, currentSetIndex, weight, reps, rpe, exerciseNotes, currentExercise, totalExercises]);

  // Skip rest
  const skipRest = () => {
    setIsResting(false);
    setRestTime(0);
  };

  // Complete workout
  const completeWorkout = () => {
    const session: WorkoutSessionType = {
      id: generateId(),
      userId: workout.userId,
      templateId: workout.id,
      name: workout.name,
      startedAt: startTime,
      completedAt: new Date().toISOString(),
      exercises: sessionExercises,
      totalVolume: calculateTotalVolume(sessionExercises),
      totalSets: sessionExercises.reduce((sum, e) => sum + e.sets.length, 0),
      duration: Math.floor((Date.now() - new Date(startTime).getTime()) / 1000 / 60),
      muscleVolume: calculateMuscleVolume(sessionExercises, workout.exercises),
      prs: [], // Would be calculated by comparing to history
      notes: '',
    };
    onComplete(session);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => setShowExitDialog(true)}>
              <X className="w-4 h-4 mr-1" />
              Exit
            </Button>
            <div className="text-center">
              <div className="font-semibold text-sm">{workout.name}</div>
              <button 
                onClick={() => setShowRationale(true)}
                className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 mx-auto"
              >
                <Info className="w-3 h-3" />
                Why this workout?
              </button>
            </div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Workout Overview</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-8 space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{workout.exercises.length} Exercises</span>
                    <span>~{workout.estimatedDuration} min</span>
                  </div>
                  <div className="space-y-2">
                    {workout.exercises.map((e, i) => (
                      <div 
                        key={e.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          i === currentExerciseIndex 
                            ? 'border-primary bg-primary/5' 
                            : i < currentExerciseIndex 
                              ? 'border-green-500/20 bg-green-500/5' 
                              : 'border-border'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          i <= currentExerciseIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{e.exercise.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {e.sets} sets • {e.targetReps} reps
                          </div>
                        </div>
                        {i < currentExerciseIndex && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        {i === currentExerciseIndex && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={() => setShowCompleteDialog(true)}>
                    <Flag className="w-4 h-4 mr-2" /> Finish Workout Early
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </header>

      {/* Rationale Dialog */}
      <Dialog open={showRationale} onOpenChange={setShowRationale}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Workout Rationale</DialogTitle>
            <DialogDescription>
              Why the AI Coach prescribed this session for you today.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {workout.rationale.map((reason, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm">{reason}</p>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowRationale(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 flex flex-col items-center justify-center"
          >
            <div className="text-center space-y-6">
              <div className="text-6xl font-bold tabular-nums">
                {formatTime(restTime)}
              </div>
              <Progress 
                value={(restTime / restDuration) * 100} 
                className="w-48 h-2 mx-auto"
              />
              <p className="text-muted-foreground">Rest before next set</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setRestTime((t) => Math.max(0, t - 15))}
                >
                  -15s
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setRestTime((t) => t + 15)}
                >
                  +15s
                </Button>
              </div>
              <Button onClick={skipRest} variant="ghost" className="mt-4">
                <SkipForward className="w-4 h-4 mr-2" />
                Skip Rest
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Current Exercise Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant={currentExercise.isWarmup ? 'secondary' : 'default'} className="mb-2">
                  {currentExercise.isWarmup ? 'Warm-Up' : `Set ${currentSetIndex + 1} of ${currentExercise.sets}`}
                </Badge>
                <h2 className="text-xl font-bold">{currentExercise.exercise.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Target: {currentExercise.targetReps} reps
                  {currentExercise.targetWeight && ` @ ${currentExercise.targetWeight}lbs`}
                  {!currentExercise.isWarmup && ` • RPE ${currentExercise.targetRpe}`}
                </p>
              </div>
            </div>

            {/* Muscle Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {currentExercise.exercise.primaryMuscles.map((m) => (
                <span key={m} className="text-xs px-2 py-1 bg-primary/10 rounded-full capitalize">
                  {m.replace('_', ' ')}
                </span>
              ))}
            </div>

            {/* Set Input */}
            <div className="space-y-6">
              {/* Weight Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Weight (lbs)</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setWeight((w) => Math.max(0, w - 5))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="text-center text-2xl font-bold h-14 w-32"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setWeight((w) => w + 5)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Reps Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Reps</label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setReps((r) => Math.max(1, r - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                    className="text-center text-2xl font-bold h-14 w-32"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setReps((r) => r + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* RPE Slider (for non-warmup sets) */}
              {!currentExercise.isWarmup && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    RPE (Rate of Perceived Exertion): {rpe}
                  </label>
                  <Slider
                    value={[rpe]}
                    onValueChange={([v]) => setRpe(v)}
                    min={5}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Easy</span>
                    <span>Moderate</span>
                    <span>Max Effort</span>
                  </div>
                </div>
              )}

              {/* Exercise Notes */}
              <div className="pt-2">
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Edit2 className="w-3 h-3" />
                  Exercise Notes
                </label>
                <Textarea
                  placeholder="e.g. Felt a bit heavy today, focus on form..."
                  value={exerciseNotes}
                  onChange={(e) => setExerciseNotes(e.target.value)}
                  className="min-h-[80px] text-sm resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previous Sets */}
        {sessionExercises[currentExerciseIndex]?.sets.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-sm font-medium mb-3">Completed Sets</h3>
              <div className="space-y-2">
                {sessionExercises[currentExerciseIndex].sets.map((set, i) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                      <span className="text-sm font-medium">Set {i + 1}</span>
                    </div>
                    <div className="text-sm">
                      {set.weight}lbs × {set.reps} reps
                      {set.rpe && <span className="text-muted-foreground"> • RPE {set.rpe}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Cues */}
        {currentExercise.exercise.cues.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-sm font-medium mb-3">Coaching Cues</h3>
              <ul className="space-y-2">
                {currentExercise.exercise.cues.map((cue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    {cue}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 border-t border-border bg-background p-4 safe-area-bottom">
        <div className="flex gap-3">
          {/* Navigation */}
          <Button
            variant="outline"
            size="icon"
            disabled={currentExerciseIndex === 0 && currentSetIndex === 0}
            onClick={() => {
              if (currentSetIndex > 0) {
                setCurrentSetIndex((s) => s - 1);
              } else if (currentExerciseIndex > 0) {
                setCurrentExerciseIndex((i) => i - 1);
                const prevExercise = workout.exercises[currentExerciseIndex - 1];
                setCurrentSetIndex(prevExercise.sets - 1);
              }
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Log Set Button */}
          <Button className="flex-1 h-12 gap-2" size="lg" onClick={logSet}>
            <Check className="w-5 h-5" />
            Log Set
          </Button>

          {/* Skip Exercise */}
          <Button
            variant="outline"
            size="icon"
            disabled={currentExerciseIndex === totalExercises - 1}
            onClick={() => {
              setCurrentExerciseIndex((i) => i + 1);
              setCurrentSetIndex(0);
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Workout?</DialogTitle>
            <DialogDescription>
              Your progress will be lost if you exit now. Are you sure you want to leave?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowExitDialog(false)}>
              Continue Workout
            </Button>
            <Button variant="destructive" onClick={onExit}>
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Workout Complete!
            </DialogTitle>
            <DialogDescription>
              Great job! You've completed your workout.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-secondary">
                <div className="text-2xl font-bold">
                  {sessionExercises.reduce((sum, e) => sum + e.sets.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Sets</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <div className="text-2xl font-bold">
                  {Math.round(calculateTotalVolume(sessionExercises) / 1000)}k
                </div>
                <div className="text-xs text-muted-foreground">Volume (lbs)</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <div className="text-2xl font-bold">
                  {Math.floor((Date.now() - new Date(startTime).getTime()) / 1000 / 60)}
                </div>
                <div className="text-xs text-muted-foreground">Minutes</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={completeWorkout} className="w-full gap-2">
              <TrendingUp className="w-4 h-4" />
              Save & View Summary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function initializeSessionExercises(exercises: WorkoutExercise[]): SessionExercise[] {
  return exercises.map((e) => ({
    id: generateId(),
    exerciseId: e.exerciseId,
    exercise: e.exercise,
    order: e.order,
    sets: [],
    notes: '',
  }));
}

function calculateTotalVolume(exercises: SessionExercise[]): number {
  return exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => {
      return setTotal + set.weight * set.reps;
    }, 0);
  }, 0);
}

function calculateMuscleVolume(
  sessionExercises: SessionExercise[],
  workoutExercises: WorkoutExercise[]
): Record<MuscleGroup, number> {
  const volume: Record<MuscleGroup, number> = {
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

  sessionExercises.forEach((se, index) => {
    const we = workoutExercises[index];
    if (!we) return;

    const workingSets = se.sets.filter(s => !s.isWarmup).length;
    
    // Primary muscles get full credit
    we.exercise.primaryMuscles.forEach((m) => {
      volume[m] += workingSets;
    });

    // Secondary muscles get half credit
    we.exercise.secondaryMuscles.forEach((m) => {
      volume[m] += workingSets * 0.5;
    });
  });

  return volume;
}
