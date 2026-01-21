import { motion } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  Dumbbell,
  Clock,
  Target,
  ChevronRight,
  Share2,
  Home,
  Calendar,
  Zap,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MuscleMap } from '@/components/MuscleMap';
import type { WorkoutSession, MuscleGroup } from '@/types';

interface WorkoutSummaryProps {
  session: WorkoutSession;
  onGoHome: () => void;
  onScheduleNext?: () => void;
}

export function WorkoutSummary({
  session,
  onGoHome,
  onScheduleNext,
}: WorkoutSummaryProps) {
  // Convert muscle volume to map format
  const muscleMapData = Object.entries(session.muscleVolume).reduce(
    (acc, [muscle, sets]) => {
      let intensity: 0 | 1 | 2 | 3 = 0;
      if (sets >= 6) intensity = 3;
      else if (sets >= 4) intensity = 2;
      else if (sets >= 1) intensity = 1;
      acc[muscle as MuscleGroup] = { sets, intensity };
      return acc;
    },
    {} as Record<MuscleGroup, { sets: number; intensity: number }>
  );

  // Get top muscles worked
  const topMuscles = Object.entries(session.muscleVolume)
    .filter(([_, sets]) => sets > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 border-b border-primary/20">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-primary" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold mb-2"
          >
            Workout Complete!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground"
          >
            {session.name}
          </motion.p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{session.totalSets}</div>
              <div className="text-xs text-muted-foreground">Total Sets</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold">
                {(session.totalVolume / 1000).toFixed(1)}k
              </div>
              <div className="text-xs text-muted-foreground">Volume (lbs)</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold">{session.duration}</div>
              <div className="text-xs text-muted-foreground">Minutes</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PRs Section (if any) */}
        {session.prs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  New Personal Records!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {session.prs.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background"
                  >
                    <span className="font-medium">{pr.exerciseId}</span>
                    <Badge variant="secondary">
                      {pr.type}: {pr.value}
                      {pr.previousValue && (
                        <span className="text-green-500 ml-1">
                          (+{(pr.value - pr.previousValue).toFixed(1)})
                        </span>
                      )}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Muscles Worked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Muscles Worked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MuscleMap data={muscleMapData} />
              
              {/* Top Muscles List */}
              <div className="mt-6 space-y-3">
                {topMuscles.map(([muscle, sets], index) => (
                  <div key={muscle} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {muscle.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {sets} effective sets
                        </span>
                      </div>
                      <Progress value={(sets / 10) * 100} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Exercise Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Exercise Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.exercises
                .filter((e) => e.sets.length > 0)
                .map((exercise) => {
                  const totalVolume = exercise.sets.reduce(
                    (sum, set) => sum + set.weight * set.reps,
                    0
                  );
                  const bestSet = exercise.sets.reduce(
                    (best, set) =>
                      set.weight * set.reps > best.weight * best.reps
                        ? set
                        : best,
                    exercise.sets[0]
                  );

                  return (
                    <div
                      key={exercise.id}
                      className="p-3 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{exercise.exercise.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {exercise.sets.length} sets
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span>
                          Best: {bestSet.weight}lbs × {bestSet.reps}
                        </span>
                        <span>•</span>
                        <span>Volume: {totalVolume.toLocaleString()}lbs</span>
                      </div>
                      {exercise.notes && (
                        <p className="text-xs italic text-muted-foreground border-l-2 border-primary/20 pl-2 mt-1">
                          "{exercise.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm">
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Great volume!
                  </span>{' '}
                  You hit {session.totalSets} sets across {session.exercises.length} exercises.
                  This is solid work for muscle growth.
                </p>
              </div>
              {topMuscles.length > 0 && (
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-sm">
                    <span className="font-medium">Primary focus:</span>{' '}
                    {topMuscles
                      .slice(0, 3)
                      .map(([m]) => m.replace('_', ' '))
                      .join(', ')}
                    . Consider targeting other muscle groups next session for balance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-3 pb-6"
        >
          <Button onClick={onGoHome} size="lg" className="w-full gap-2">
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Button>
          
          {onScheduleNext && (
            <Button
              onClick={onScheduleNext}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <Calendar className="w-5 h-5" />
              Schedule Next Workout
            </Button>
          )}

          <Button variant="ghost" size="lg" className="w-full gap-2">
            <Share2 className="w-5 h-5" />
            Share Workout
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
