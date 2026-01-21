import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Container, Card, Button, Input } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch workout plans
  const { data: plans, isLoading, refetch } = useQuery({
    queryKey: ['workout_plans', user?.id],
    queryFn: async () => {
      return await blink.db.workoutPlans.list({
        where: { userId: user?.id },
        orderBy: { createdAt: 'desc' }
      });
    },
    enabled: !!user?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredPlans = plans?.filter((p: any) => 
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container safeArea padding="none" background={colors.background}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <Button 
          variant="primary" 
          size="sm" 
          onPress={() => router.push('/workouts/new')}
          leftIcon={<Ionicons name="add" size={18} color={colors.white} />}
        >
          New Plan
        </Button>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search plans..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
        />
      </View>

      <FlatList
        data={filteredPlans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={64} color={colors.border} />
              <Text style={styles.emptyTitle}>No Workout Plans</Text>
              <Text style={styles.emptySubtitle}>Create a plan to start logging your sessions.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Card 
            variant="flat" 
            style={styles.planCard}
            onPress={() => router.push(`/workouts/session?planId=${item.id}`)}
          >
            <View style={styles.planInfo}>
              <View style={styles.planDetails}>
                <Text style={styles.planName}>{item.name}</Text>
                <Text style={styles.planMeta}>
                  {item.exercises?.length || 0} exercises • {item.targetMuscles?.join(', ') || 'Full Body'}
                </Text>
              </View>
              <View style={styles.playButton}>
                <Ionicons name="play" size={20} color={colors.white} />
              </View>
            </View>
          </Card>
        )}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  planCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planDetails: {
    flex: 1,
  },
  planName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  planMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xxl,
  },
});
