import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { blink } from '@/lib/blink';
import { LandingPage } from '@/components/LandingPage';
import { OnboardingFlow, type OnboardingData } from '@/components/onboarding/OnboardingFlow';
import { Dashboard } from '@/components/Dashboard';
import { WorkoutGeneratorPage } from '@/components/workout/WorkoutGeneratorPage';
import { WorkoutSessionView } from '@/components/workout/WorkoutSession';
import { WorkoutSummary } from '@/components/workout/WorkoutSummary';
import { CalendarPlanning } from '@/components/workout/CalendarPlanning';
import { Spinner } from '@/components/ui/spinner';
import type { UserProfile, WorkoutTemplate, WorkoutSession, WorkoutPlan } from '@/types';

type AppView = 
  | 'landing' 
  | 'onboarding' 
  | 'dashboard' 
  | 'generate-workout' 
  | 'workout-session' 
  | 'workout-summary'
  | 'calendar-planning';

function App() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const [view, setView] = useState<AppView>('landing');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Workout state
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutTemplate | null>(null);
  const [completedSession, setCompletedSession] = useState<WorkoutSession | null>(null);

  // Load user profile when authenticated
  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated || !user) {
        setProfile(null);
        return;
      }

      setProfileLoading(true);
      try {
        // Try to fetch existing profile
        const profiles = await blink.db.userProfiles.list({
          where: { userId: user.id },
          limit: 1,
        });

        if (profiles && profiles.length > 0) {
          // Parse the profile data
          const profileData = profiles[0];
          setProfile({
            ...profileData,
            equipment: typeof profileData.equipment === 'string' 
              ? JSON.parse(profileData.equipment) 
              : profileData.equipment,
            constraints: typeof profileData.constraints === 'string'
              ? JSON.parse(profileData.constraints)
              : profileData.constraints,
            estimatedMaxes: profileData.estimatedMaxes
              ? (typeof profileData.estimatedMaxes === 'string' 
                ? JSON.parse(profileData.estimatedMaxes) 
                : profileData.estimatedMaxes)
              : undefined,
          } as UserProfile);
          setView('dashboard');
        } else {
          // No profile, show onboarding
          setView('onboarding');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setView('onboarding');
      } finally {
        setProfileLoading(false);
      }
    }

    loadProfile();
  }, [isAuthenticated, user]);

  // Handle getting started from landing page
  const handleGetStarted = () => {
    if (isAuthenticated) {
      setView(profile ? 'dashboard' : 'onboarding');
    } else {
      login();
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return;

    try {
      const newProfile: Omit<UserProfile, 'id'> = {
        userId: user.id,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        goal: data.goal!,
        experience: data.experience!,
        trainingDaysPerWeek: data.trainingDaysPerWeek,
        sessionDurationMinutes: data.sessionDurationMinutes,
        equipment: data.equipment,
        constraints: data.constraints,
        bodyweight: data.bodyweight,
        estimatedMaxes: data.estimatedMaxes,
        onboardingCompleted: true,
        subscriptionTier: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to database with JSON stringified complex fields
      const saved = await blink.db.userProfiles.create({
        ...newProfile,
        equipment: JSON.stringify(newProfile.equipment),
        constraints: JSON.stringify(newProfile.constraints),
        estimatedMaxes: newProfile.estimatedMaxes 
          ? JSON.stringify(newProfile.estimatedMaxes) 
          : null,
      } as unknown as Record<string, unknown>);

      setProfile({ ...newProfile, id: saved.id } as UserProfile);
      setView('dashboard');
      toast.success('Profile created! Let\'s generate your first workout.');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setProfile(null);
    setCurrentWorkout(null);
    setCompletedSession(null);
    setView('landing');
  };

  // Handle generate workout click from dashboard
  const handleGenerateWorkout = () => {
    setView('generate-workout');
  };

  // Handle start workout from generator
  const handleStartWorkout = (workout: WorkoutTemplate) => {
    setCurrentWorkout(workout);
    setView('workout-session');
  };

  // Handle workout session completion
  const handleWorkoutComplete = async (session: WorkoutSession) => {
    try {
      // Save session to database
      await blink.db.workoutSessions.create({
        ...session,
        exercises: JSON.stringify(session.exercises),
        muscleVolume: JSON.stringify(session.muscleVolume),
        prs: JSON.stringify(session.prs),
      } as unknown as Record<string, unknown>);
      
      setCompletedSession(session);
      setView('workout-summary');
      toast.success('Workout saved!');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
      setCompletedSession(session);
      setView('workout-summary');
    }
  };

  // Handle exit workout session
  const handleExitWorkout = () => {
    setCurrentWorkout(null);
    setView('dashboard');
  };

  // Handle go back to dashboard from summary
  const handleGoHome = () => {
    setCompletedSession(null);
    setCurrentWorkout(null);
    setView('dashboard');
  };

  // Handle start workout from plan
  const handleStartPlan = (plan: WorkoutPlan) => {
    if (plan.template) {
      setCurrentWorkout(plan.template);
      setView('workout-session');
    } else {
      // If template not loaded, maybe it's just an ID
      toast.error('Workout details not found. Try generating a new one.');
    }
  };

  // Loading state
  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner className="w-8 h-8 mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {view === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}

      {view === 'onboarding' && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {view === 'dashboard' && profile && (
        <Dashboard
          profile={profile}
          user={user}
          onLogout={handleLogout}
          onGenerateWorkout={handleGenerateWorkout}
          onViewCalendar={() => setView('calendar-planning')}
          onStartPlan={handleStartPlan}
        />
      )}

      {view === 'generate-workout' && profile && (
        <WorkoutGeneratorPage
          profile={profile}
          onBack={() => setView('dashboard')}
          onStartWorkout={handleStartWorkout}
        />
      )}

      {view === 'workout-session' && currentWorkout && (
        <WorkoutSessionView
          workout={currentWorkout}
          onComplete={handleWorkoutComplete}
          onExit={handleExitWorkout}
        />
      )}

      {view === 'workout-summary' && completedSession && (
        <WorkoutSummary
          session={completedSession}
          onGoHome={handleGoHome}
          onScheduleNext={() => setView('generate-workout')}
        />
      )}

      {view === 'calendar-planning' && profile && (
        <CalendarPlanning
          profile={profile}
          onBack={() => setView('dashboard')}
          onEditWorkout={(template) => {
            // In a real app, we'd navigate to an editor
            setCurrentWorkout(template);
            setView('generate-workout');
          }}
        />
      )}

      <Toaster />
    </>
  );
}

export default App;
