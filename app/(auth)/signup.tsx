import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, Input, Container } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/design';
import { platformBehavior } from '@/constants/platform';
import { blink } from '@/lib/blink';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await blink.auth.signUp({ 
        email, 
        password,
        displayName
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await blink.auth.signInWithGoogle();
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.message !== 'canceled') {
        Alert.alert('Google Sign In Failed', error.message || 'Could not sign in with Google.');
      }
    } finally {
      setGoogleLoading(false);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join AI Strength Coach today.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={displayName}
              onChangeText={setDisplayName}
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
            />
            <View style={styles.spacer} />
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
            />
            <View style={styles.spacer} />
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
            />

            <Button
              variant="primary"
              size="lg"
              onPress={handleSignup}
              loading={loading}
              style={styles.signupButton}
            >
              Sign Up
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              variant="outline"
              size="lg"
              onPress={handleGoogleSignup}
              loading={googleLoading}
              leftIcon={<Ionicons name="logo-google" size={20} color={colors.text} />}
              style={styles.googleButton}
            >
              Continue with Google
            </Button>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.back()}
              >
                Sign In
              </Button>
            </View>
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
    alignItems: 'flex-start',
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typography.display,
    color: colors.text,
    textAlign: 'left',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'left',
  },
  form: {
    width: '100%',
  },
  spacer: {
    height: spacing.md,
  },
  signupButton: {
    marginTop: spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  googleButton: {
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
