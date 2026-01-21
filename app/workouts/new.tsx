import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Container, Button, Input, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISE_TEMPLATES } from '@/constants/exercises';

interface ExerciseTemplate {
  name: string;
  muscleGroups: string[];
}

export default function CreatePlanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleExercise = (ex: ExerciseTemplate) => {
    if (selectedExercises.find(e => e.name === ex.name)) {
      setSelectedExercises(selectedExercises.filter(e => e.name !== ex.name));
    } else {
      setSelectedExercises([...selectedExercises, ex]);
    }
  };

  const handleCreate = async () => {
    if (!name || selectedExercises.length === 0) {
      Alert.alert('Error', 'Please enter a name and select at least one exercise.');
      return;
    }

    setLoading(true);
    try {
      const targetMuscles = Array.from(new Set(selectedExercises.flatMap(ex => ex.muscleGroups)));
      
      await blink.db.workoutPlans.create({
        userId: user?.id,
        name,
        exercises: selectedExercises.map(ex => ({
          name: ex.name,
          id: Math.random().toString(36).substr(2, 9)
        })),
        targetMuscles,
        createdAt: new Date().toISOString()
      });

      Alert.alert('Success', 'Plan created!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container safeArea padding="none" background={colors.background}>
      <Stack.Screen options={{ title: 'New Workout Plan', headerShown: true }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>Plan Name</Text>
          <Input
            placeholder="e.g. Push Day, Leg Power"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Select Exercises</Text>
          <View style={styles.exerciseGrid}>
            {EXERCISE_TEMPLATES.map((ex) => {
              const isSelected = !!selectedExercises.find(e => e.name === ex.name);
              return (
                <TouchableOpacity 
                  key={ex.name}
                  style={[styles.exerciseChip, isSelected && styles.exerciseChipSelected]}
                  onPress={() => toggleExercise(ex)}
                >
                  <Text style={[styles.exerciseChipText, isSelected && styles.exerciseChipTextSelected]}>
                    {ex.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color={colors.white} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Plan Summary</Text>
          <Card variant="flat" style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              {selectedExercises.length} Exercises selected
            </Text>
            <Text style={styles.summaryMuscles}>
              Targeting: {Array.from(new Set(selectedExercises.flatMap(ex => ex.muscleGroups))).join(', ') || 'N/A'}
            </Text>
          </Card>
        </View>

        <Button 
          variant="primary" 
          size="lg" 
          onPress={handleCreate}
          loading={loading}
          style={styles.createButton}
        >
          Create Plan
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  exerciseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    margin: spacing.xs,
  },
  exerciseChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  exerciseChipText: {
    ...typography.captionBold,
    color: colors.text,
  },
  exerciseChipTextSelected: {
    color: colors.white,
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
  summarySection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryCard: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  summaryText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  summaryMuscles: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  createButton: {
    marginTop: spacing.md,
  },
});