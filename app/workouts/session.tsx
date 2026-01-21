import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Container, Card, Button, Input } from '@/components/ui';
import { colors, spacing, typography, shadows } from '@/constants/design';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

interface Set {
  weight: string;
  reps: string;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export default function WorkoutSessionScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams();
  const { user } = useAuth();
  const [sessionName, setSessionName] = useState('Strength Session');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch plan details to initialize session
  const { data: plan } = useQuery({
    queryKey: ['plan', planId],
    queryFn: async () => {
      return await blink.db.workoutPlans.get(planId as string);
    },
    enabled: !!planId,
  });

  useEffect(() => {
    if (plan) {
      setSessionName(plan.name);
      const initialExercises = plan.exercises.map((ex: any) => ({
        id: ex.id || Math.random().toString(36).substr(2, 9),
        name: ex.name,
        sets: [{ weight: '', reps: '', completed: false }]
      }));
      setExercises(initialExercises);
    }
  }, [plan]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setTimer(prev => prev + 1);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    const lastSet = newExercises[exerciseIndex].sets[newExercises[exerciseIndex].sets.length - 1];
    newExercises[exerciseIndex].sets.push({ 
      weight: lastSet?.weight || '', 
      reps: lastSet?.reps || '', 
      completed: false 
    });
    setExercises(newExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof Set, value: any) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex].completed = !newExercises[exerciseIndex].sets[setIndex].completed;
    setExercises(newExercises);
  };

  const finishWorkout = async () => {
    const hasIncomplete = exercises.some(ex => ex.sets.some(s => !s.completed));
    if (hasIncomplete) {
      Alert.alert(
        'Finish Workout?',
        'You have some incomplete sets. Do you want to finish anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Finish', onPress: saveWorkout }
        ]
      );
    } else {
      saveWorkout();
    }
  };

  const saveWorkout = async () => {
    try {
      await blink.db.workoutSessions.create({
        userId: user?.id,
        name: sessionName,
        date: new Date().toISOString(),
        duration: Math.floor(timer / 60),
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets.filter(s => s.completed).map(s => ({
            weight: parseFloat(s.weight),
            reps: parseInt(s.reps)
          }))
        }))
      });
      
      // Update muscle mapping scores (simplified logic)
      // In a real app, this would calculate volume per muscle group
      
      Alert.alert('Success', 'Workout logged successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout.');
    }
  };

  return (
    <Container safeArea padding="none" background={colors.background}>
      <Stack.Screen options={{ 
        title: sessionName,
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={() => setIsPaused(!isPaused)}>
            <Ionicons name={isPaused ? "play" : "pause"} size={24} color={colors.primary} />
          </TouchableOpacity>
        )
      }} />

      <View style={styles.timerBar}>
        <View style={styles.timerInfo}>
          <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
        <Text style={styles.statusText}>{isPaused ? 'Paused' : 'Active'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {exercises.map((ex, exIdx) => (
          <Card key={ex.id} variant="flat" style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{ex.name}</Text>
            
            <View style={styles.setHeaders}>
              <Text style={[styles.setHeader, { flex: 0.5 }]}>Set</Text>
              <Text style={[styles.setHeader, { flex: 1.5 }]}>Weight (kg)</Text>
              <Text style={[styles.setHeader, { flex: 1.5 }]}>Reps</Text>
              <Text style={[styles.setHeader, { flex: 1, textAlign: 'center' }]}>Done</Text>
            </View>

            {ex.sets.map((set, setIdx) => (
              <View key={setIdx} style={[styles.setRow, set.completed && styles.completedRow]}>
                <Text style={[styles.setText, { flex: 0.5 }]}>{setIdx + 1}</Text>
                <View style={{ flex: 1.5, paddingHorizontal: 4 }}>
                  <Input
                    placeholder="0"
                    value={set.weight}
                    onChangeText={(val) => updateSet(exIdx, setIdx, 'weight', val)}
                    keyboardType="numeric"
                    size="sm"
                    disabled={set.completed}
                  />
                </View>
                <View style={{ flex: 1.5, paddingHorizontal: 4 }}>
                  <Input
                    placeholder="0"
                    value={set.reps}
                    onChangeText={(val) => updateSet(exIdx, setIdx, 'reps', val)}
                    keyboardType="numeric"
                    size="sm"
                    disabled={set.completed}
                  />
                </View>
                <TouchableOpacity 
                  style={[styles.checkButton, set.completed && styles.checkButtonActive, { flex: 1 }]}
                  onPress={() => toggleSetCompleted(exIdx, setIdx)}
                >
                  <Ionicons 
                    name={set.completed ? "checkmark-circle" : "ellipse-outline"} 
                    size={28} 
                    color={set.completed ? colors.white : colors.borderDark} 
                  />
                </TouchableOpacity>
              </View>
            ))}

            <Button 
              variant="outline" 
              size="sm" 
              onPress={() => addSet(exIdx)}
              style={styles.addSetButton}
              leftIcon={<Ionicons name="add" size={16} />}
            >
              Add Set
            </Button>
          </Card>
        ))}

        <Button 
          variant="primary" 
          size="lg" 
          onPress={finishWorkout}
          style={styles.finishButton}
        >
          Finish Workout
        </Button>
        <Button 
          variant="ghost" 
          size="md" 
          onPress={() => router.back()}
          style={styles.cancelButton}
          textColor={colors.error}
        >
          Cancel Workout
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  timerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    ...typography.bodyBold,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  statusText: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  exerciseCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  setHeaders: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  setHeader: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  completedRow: {
    opacity: 0.6,
  },
  setText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  checkButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonActive: {
    // Styling handled by icon color
  },
  addSetButton: {
    marginTop: spacing.md,
  },
  finishButton: {
    marginTop: spacing.xl,
  },
  cancelButton: {
    marginTop: spacing.sm,
  },
});
