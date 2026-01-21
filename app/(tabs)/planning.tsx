import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Container, Card, Button } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PlanningScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  // Fetch workout plans for the week
  const { data: plans, isLoading, refetch } = useQuery({
    queryKey: ['workout_plans_calendar', user?.id],
    queryFn: async () => {
      // In a real app, we'd fetch plans scheduled for this week
      return await blink.db.workoutPlans.list({
        where: { userId: user?.id }
      });
    },
    enabled: !!user?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <Container safeArea padding="none" background={colors.background}>
      <View style={styles.header}>
        <Text style={styles.title}>Planning</Text>
        <Text style={styles.monthLabel}>
          {selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Week Calendar */}
      <View style={styles.calendarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
          {weekDates.map((date, idx) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.dateCard, isSelected && styles.selectedDateCard]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayName, isSelected && styles.selectedText]}>
                  {date.toLocaleDateString(undefined, { weekday: 'short' })}
                </Text>
                <View style={[styles.dateCircle, isToday && !isSelected && styles.todayCircle, isSelected && styles.selectedDateCircle]}>
                  <Text style={[styles.dateNumber, isSelected && styles.selectedText]}>
                    {date.getDate()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>
            {isSameDay(selectedDate, new Date()) ? 'Today' : selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* Planned Workouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Sessions</Text>
          {plans && plans.length > 0 ? (
            plans.map((plan: any) => (
              <Card key={plan.id} variant="flat" style={styles.planCard}>
                <View style={styles.planContent}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planMeta}>{plan.exercises?.length || 0} exercises</Text>
                  </View>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onPress={() => router.push(`/workouts/session?planId=${plan.id}`)}
                  >
                    Start
                  </Button>
                </View>
              </Card>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Rest day or no workout planned.</Text>
              <Button 
                variant="outline" 
                size="sm" 
                onPress={() => router.push('/(tabs)/workouts')}
                style={styles.emptyButton}
              >
                Schedule Session
              </Button>
            </View>
          )}
        </View>

        {/* Nutritional Goals Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goals</Text>
          <Card variant="flat" style={styles.goalCard}>
            <View style={styles.goalRow}>
              <Ionicons name="flame-outline" size={20} color={colors.warning} />
              <Text style={styles.goalText}>2,400 kcal target</Text>
              <Text style={styles.goalValue}>0 / 2,400</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
          </Card>
          <Card variant="flat" style={styles.goalCard}>
            <View style={styles.goalRow}>
              <Ionicons name="water-outline" size={20} color={colors.info} />
              <Text style={styles.goalText}>3.5L Water target</Text>
              <Text style={styles.goalValue}>0 / 3.5L</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '0%', backgroundColor: colors.info }]} />
            </View>
          </Card>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  monthLabel: {
    ...typography.captionBold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  calendarContainer: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
  },
  calendarScroll: {
    paddingHorizontal: spacing.lg,
  },
  dateCard: {
    alignItems: 'center',
    marginRight: spacing.lg,
    padding: spacing.xs,
    borderRadius: 12,
    width: 50,
  },
  selectedDateCard: {
    backgroundColor: colors.primary,
  },
  dayName: {
    ...typography.tiny,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  dateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selectedDateCircle: {
    backgroundColor: colors.primaryDark,
  },
  dateNumber: {
    ...typography.bodyBold,
    color: colors.text,
  },
  selectedText: {
    color: colors.white,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  dayHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  dayTitle: {
    ...typography.h2,
    color: colors.text,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  planCard: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  planMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyButton: {
    width: '100%',
  },
  goalCard: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.sm,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  goalValue: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 2,
  },
});
