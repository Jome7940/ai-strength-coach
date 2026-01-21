import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Container, Card, Button, Avatar } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { blink } from '@/lib/blink';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch stats summary
  const { data: stats, refetch } = useQuery({
    queryKey: ['profile_stats', user?.id],
    queryFn: async () => {
      const workouts = await blink.db.workoutSessions.count({
        where: { userId: user?.id }
      });
      return { totalWorkouts: workouts };
    },
    enabled: !!user?.id,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <Container safeArea padding="none" background={colors.background}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Avatar 
            source={{ uri: user?.avatarUrl }} 
            name={user?.displayName || 'U'} 
            size="xxl" 
          />
          <Text style={styles.userName}>{user?.displayName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Button 
            variant="outline" 
            size="sm" 
            style={styles.editButton}
            onPress={() => {}}
          >
            Edit Profile
          </Button>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.totalWorkouts || 0}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>PRs</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <MenuItem 
            icon="notifications-outline" 
            label="Notifications" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon="shield-outline" 
            label="Privacy" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon="help-circle-outline" 
            label="Support" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon="information-circle-outline" 
            label="About" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.footer}>
          <Button 
            variant="ghost" 
            size="lg" 
            onPress={handleSignOut}
            textColor={colors.error}
            style={styles.signOutButton}
          >
            Sign Out
          </Button>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </Container>
  );
}

function MenuItem({ icon, label, onPress }: { icon: any, label: string, onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
        <Text style={styles.menuItemLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
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
  title: {
    ...typography.h1,
    color: colors.text,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  editButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    borderRadius: 20,
    marginTop: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  statLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  menuSection: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.md,
  },
  footer: {
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  signOutButton: {
    width: '100%',
  },
  versionText: {
    ...typography.tiny,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
});
