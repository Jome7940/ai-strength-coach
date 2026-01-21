import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Container, Card, Button, Avatar } from '@/components/ui';
import { colors, spacing, typography, shadows } from '@/constants/design';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/useAuth';
import { MuscleMap } from '@/components/muscle-map/MuscleMap';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profile
  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['user_profile', user?.id],
    queryFn: async () => {
      const result = await blink.db.userProfiles.list({
        where: { userId: user?.id }
      });
      return result[0];
    },
    enabled: !!user?.id,
  });

  // Fetch muscle volume data
  const { data: muscleVolume, refetch: refetchVolume } = useQuery({
    queryKey: ['muscle_volume', user?.id],
    queryFn: async () => {
      const result = await blink.db.muscleVolume.list({
        where: { userId: user?.id }
      });
      // Convert list to data object for MuscleMap
      return result.reduce((acc: any, curr: any) => {
        acc[curr.muscleGroup] = curr.score;
        return acc;
      }, {});
    },
    enabled: !!user?.id,
  });

  // Fetch recent workouts
  const { data: recentWorkouts, refetch: refetchWorkouts } = useQuery({
    queryKey: ['recent_workouts', user?.id],
    queryFn: async () => {
      return await blink.db.workoutSessions.list({
        where: { userId: user?.id },
        orderBy: { date: 'desc' },
        limit: 3
      });
    },
    enabled: !!user?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchVolume(), refetchWorkouts()]);
    setRefreshing(false);
  };

  return (
    <Container safeArea padding="none" background={colors.background}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.displayName?.split(' ')[0] || 'Athlete'}</Text>
            <Text style={styles.subGreeting}>Time to push your limits.</Text>
          </View>
          <Avatar 
            source={{ uri: user?.avatarUrl }} 
            name={user?.displayName || 'U'} 
            size="md" 
          />
        </View>

        {/* Muscle Map Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Muscle Recovery</Text>
            <TouchableOpacity onPress={() => router.push('/workouts')}>
              <Text style={styles.sectionAction}>View Details</Text>
            </TouchableOpacity>
          </View>
          <Card variant="flat" style={styles.muscleMapCard}>
            <View style={styles.muscleMapContainer}>
              <MuscleMap data={muscleVolume || {}} side="front" />
              <MuscleMap data={muscleVolume || {}} side="back" />
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryTint }]}>
                <Ionicons name="add" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Log Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/planning')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.backgroundTertiary }]}>
                <Ionicons name="calendar" size={24} color={colors.textSecondary} />
              </View>
              <Text style={styles.actionLabel}>Plan Week</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.backgroundTertiary }]}>
                <Ionicons name="stats-chart" size={24} color={colors.textSecondary} />
              </View>
              <Text style={styles.actionLabel}>Stats</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          {recentWorkouts && recentWorkouts.length > 0 ? (
            recentWorkouts.map((workout: any) => (
              <Card key={workout.id} style={styles.workoutCard} variant="elevated">
                <View style={styles.workoutInfo}>
                  <View style={styles.workoutIcon}>
                    <Ionicons name="fitness" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.workoutText}>
                    <Text style={styles.workoutTitle}>{workout.name || 'Strength Session'}</Text>
                    <Text style={styles.workoutDate}>
                      {new Date(workout.date).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric' 
                      })} • {workout.duration || 0} min
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>
              </Card>
            ))
          ) : (
            <Card variant="flat" style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent workouts logged.</Text>
              <Button 
                variant="outline" 
                size="sm" 
                onPress={() => router.push('/workouts')}
                style={styles.emptyButton}
              >
                Start First Session
              </Button>
            </Card>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  subGreeting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionAction: {
    ...typography.smallBold,
    color: colors.primary,
  },
  muscleMapCard: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  muscleMapContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionLabel: {
    ...typography.captionBold,
    color: colors.text,
  },
  workoutCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  workoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  workoutText: {
    flex: 1,
  },
  workoutTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  workoutDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyButton: {
    width: '100%',
  },
});
