import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Container, Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { blink } from '@/lib/blink';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutHistoryDetailScreen() {
  const { id } = useLocalSearchParams();

  const { data: session, isLoading } = useQuery({
    queryKey: ['workout_session', id],
    queryFn: async () => {
      return await blink.db.workoutSessions.get(id as string);
    },
    enabled: !!id,
  });

  if (isLoading) return null;
  if (!session) return <Text>Session not found</Text>;

  return (
    <Container safeArea padding="none" background={colors.background}>
      <Stack.Screen options={{ title: session.name || 'Workout Detail', headerShown: true }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{session.duration} min</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Date</Text>
              <Text style={styles.statValue}>
                {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {session.exercises.map((ex: any, idx: number) => (
            <Card key={idx} variant="flat" style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <View style={styles.setsList}>
                {ex.sets.map((set: any, sIdx: number) => (
                  <View key={sIdx} style={styles.setRow}>
                    <Text style={styles.setText}>Set {sIdx + 1}</Text>
                    <Text style={styles.setDetail}>{set.weight}kg × {set.reps}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseName: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  setsList: {
    marginTop: spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  setText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  setDetail: {
    ...typography.captionBold,
    color: colors.text,
  },
});
