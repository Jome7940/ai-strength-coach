import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, Input, Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { platformBehavior } from '@/constants/platform';
import { blink } from '@/lib/blink';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await blink.auth.login();
      // On success, the listener in RootLayout or index.tsx handles the redirect
    } catch (error: any) {
      if (error.message !== 'canceled') {
        Alert.alert('Login Failed', error.message || 'Could not sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container safeArea padding="lg" background={colors.background}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={platformBehavior.keyboardBehavior}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="fitness" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>AI Strength Coach</Text>
            <Text style={styles.subtitle}>Unified authentication with your web account.</Text>
          </View>

          <View style={styles.form}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
              leftIcon={<Ionicons name="log-in-outline" size={24} color={colors.white} />}
            >
              Sign In to Your Account
            </Button>
            
            <Text style={styles.infoText}>
              Signing in will sync your workouts, plans, and muscle map across all devices.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: spacing.xl,
  },
  infoText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
});
