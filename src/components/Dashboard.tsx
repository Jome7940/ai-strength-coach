import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  Play, 
  ChevronRight,
  Zap,
  Clock,
  Target,
  Settings,
  LogOut,
  User,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MuscleMap } from '@/components/MuscleMap';
import { blink } from '@/lib/blink';
import type { UserProfile, WorkoutSession, MuscleGroup, WorkoutPlan } from '@/types';
import type { BlinkUser } from '@blinkdotnew/sdk';
import { format, startOfWeek, endOfWeek, isSameDay } from 'date-fns';

interface DashboardProps {
  profile: UserProfile;
  user: BlinkUser | null;
  onLogout: () => void;
  onGenerateWorkout: () => void;
  onViewCalendar?: () => void;
  onStartPlan?: (plan: WorkoutPlan) => void;
}

export function Dashboard({ profile, user, onLogout, onGenerateWorkout, onViewCalendar, onStartPlan }: DashboardProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const now = new Date();
        const start = startOfWeek(now, { weekStartsOn: 1 });
        const end = endOfWeek(now, { weekStartsOn: 1 });

        // Load sessions for this week
        const sessionData = await blink.db.workoutSessions.list({
          where: { 
            userId: profile.userId,
          },
          // In a real app, we'd filter by date in the query if supported, 
          // but for now we'll filter in JS or just get recent.
          limit: 20,
        });

        const weekSessions = (sessionData || []).filter(s => {
          const date = new Date(s.startedAt);
          return date >= start && date <= end;
        }).map(s => ({
          ...s,
          exercises: typeof s.exercises === 'string' ? JSON.parse(s.exercises) : s.exercises,
          muscleVolume: typeof s.muscleVolume === 'string' ? JSON.parse(s.muscleVolume) : s.muscleVolume,
          prs: typeof s.prs === 'string' ? JSON.parse(s.prs) : s.prs,
        }));

        setSessions(weekSessions as WorkoutSession[]);

        // Load plans for this week
        const planData = await blink.db.workoutPlans.list({
          where: { userId: profile.userId },
          limit: 20,
        });
        
        const weekPlans = (planData || []).filter(p => {
          const date = new Date(p.scheduledDate);
          return date >= start && date <= end;
        });

        setPlans(weekPlans as WorkoutPlan[]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [profile.userId]);

  const handleMuscleClick = (muscle: MuscleGroup) => {
    setSelectedMuscle(selectedMuscle === muscle ? null : muscle);
  };

  // Calculate weekly stats
  const workoutsCompleted = sessions.length;
  const workoutsPlanned = Math.max(profile.trainingDaysPerWeek, plans.length);
  const totalVolume = sessions.reduce((sum, s) => sum + s.totalVolume, 0);
  const totalPrs = sessions.reduce((sum, s) => sum + s.prs.length, 0);
  
  // Calculate muscle balance
  const muscleBalance: Record<MuscleGroup, { sets: number; intensity: number }> = sessions.reduce((acc, session) => {
    Object.entries(session.muscleVolume).forEach(([muscle, sets]) => {
      if (!acc[muscle as MuscleGroup]) {
        acc[muscle as MuscleGroup] = { sets: 0, intensity: 0 };
      }
      acc[muscle as MuscleGroup].sets += sets as number;
    });
    return acc;
  }, {} as Record<MuscleGroup, { sets: number; intensity: number }>);

  // Normalize intensity (0-3 scale)
  Object.keys(muscleBalance).forEach(m => {
    const muscle = m as MuscleGroup;
    const sets = muscleBalance[muscle].sets;
    if (sets >= 10) muscleBalance[muscle].intensity = 3;
    else if (sets >= 6) muscleBalance[muscle].intensity = 2;
    else if (sets >= 2) muscleBalance[muscle].intensity = 1;
    else muscleBalance[muscle].intensity = 0;
  });

  const todayPlan = plans.find(p => isSameDay(new Date(p.scheduledDate), new Date()));
  const nextPlan = plans.filter(p => new Date(p.scheduledDate) > new Date()).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0];

  const isPro = profile.subscriptionTier === 'pro';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI Strength Coach</span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isPro && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 mr-2 hidden sm:flex">
                Free Tier
              </Badge>
            )}
            
            {/* Google Connection Indicator */}
            {user?.email && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border mr-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Connected with Google</span>
              </div>
            )}

            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
            
            <div className="relative ml-2">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.displayName || 'User'} 
                  className="w-9 h-9 rounded-full border-2 border-background ring-2 ring-primary/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background ring-2 ring-primary/20">
                  <User className="w-4 h-4" />
                </div>
              )}
              {/* Google provider icon overlay */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-border shadow-sm">
                <svg viewBox="0 0 24 24" className="w-2.5 h-2.5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back{profile.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground">
              {workoutsCompleted} of {workoutsPlanned} workouts completed this week
            </p>
          </div>
          <Button size="lg" onClick={onGenerateWorkout} className="gap-2 shadow-lg shadow-primary/20">
            <Zap className="w-5 h-5" />
            Generate Today's Workout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-green-500/5 border-green-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalPrs}</div>
                  <div className="text-sm text-muted-foreground">New PRs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{(totalVolume / 1000).toFixed(1)}k</div>
                  <div className="text-sm text-muted-foreground">Volume (lbs)</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{workoutsCompleted}/{workoutsPlanned}</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Readiness Section */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Pre-Workout Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="text-sm font-medium">Sleep Quality</div>
                <div className="flex justify-center md:justify-start gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} className="w-8 h-8 rounded bg-background border border-border hover:border-primary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-center md:text-left">
                <div className="text-sm font-medium">Energy Level</div>
                <div className="flex justify-center md:justify-start gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} className="w-8 h-8 rounded bg-background border border-border hover:border-primary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-center md:text-left">
                <div className="text-sm font-medium">Muscle Soreness</div>
                <div className="flex justify-center md:justify-start gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} className="w-8 h-8 rounded bg-background border border-border hover:border-primary">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Estimated Readiness</div>
                  <div className="text-2xl font-bold text-amber-500">8.5/10</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Muscle Map */}
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Weekly Muscle Balance</span>
                <Button variant="ghost" size="sm" className="gap-1">
                  Details <ChevronRight className="w-4 h-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Muscle utilization based on effective sets this week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MuscleMap
                data={muscleBalance}
                onMuscleClick={handleMuscleClick}
                selectedMuscle={selectedMuscle}
              />
              <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border/50">
                {selectedMuscle ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-primary rounded-full" />
                        <span className="font-bold capitalize text-xl tracking-tight">
                          {selectedMuscle.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge variant="secondary" className="px-3 py-1 text-sm">
                        {muscleBalance[selectedMuscle]?.sets || 0} Effective Sets
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Weekly Goal Progress</span>
                        <span className="font-medium">{(muscleBalance[selectedMuscle]?.sets || 0)} / 10 sets</span>
                      </div>
                      <Progress value={((muscleBalance[selectedMuscle]?.sets || 0) / 10) * 100} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-background border border-border/50 text-center">
                        <div className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Trend</div>
                        <div className="flex items-center justify-center gap-1 text-green-500 font-bold">
                          <TrendingUp className="w-4 h-4" />
                          +12%
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-background border border-border/50 text-center">
                        <div className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Status</div>
                        <div className={`font-bold ${(muscleBalance[selectedMuscle]?.sets || 0) < 6 ? 'text-amber-500' : 'text-green-500'}`}>
                          {(muscleBalance[selectedMuscle]?.sets || 0) < 6 ? 'Lagging' : 'Optimal'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Coaching Action</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {(muscleBalance[selectedMuscle]?.sets || 0) < 6 
                          ? `AI Coach: Volume is low for your ${selectedMuscle.replace('_', ' ')}. I've flagged this for your next session to ensure balanced hypertrophy.` 
                          : `AI Coach: Great work. Your ${selectedMuscle.replace('_', ' ')} stimulus is optimal. I'll maintain this volume to support progressive overload.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                      <Target className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Muscle Group Insights</p>
                      <p className="text-xs text-muted-foreground max-w-[200px]">
                        Tap any muscle region on the map to see detailed volume and coaching suggestions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Workout Preview */}
          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>{todayPlan ? 'Today\'s Session' : 'Up Next'}</span>
                {todayPlan && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" /> {todayPlan.targetDuration}m
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {todayPlan ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">Hypertrophy: Push A</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Focus on primary push patterns and progressive overload.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Chest</Badge>
                    <Badge variant="outline">Front Delts</Badge>
                    <Badge variant="outline">Triceps</Badge>
                  </div>
                  <Button className="w-full gap-2 h-12 text-lg" onClick={() => onStartPlan?.(todayPlan)}>
                    <Play className="w-5 h-5 fill-current" /> Resume Workout
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Dumbbell className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">No workout scheduled for today</h3>
                    <p className="text-sm text-muted-foreground">
                      Want to get a session in? AI can generate one based on your current balance.
                    </p>
                  </div>
                  <Button variant="outline" onClick={onGenerateWorkout} className="gap-2">
                    <Zap className="w-4 h-4" /> Generate Workout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* This Week Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Training Schedule</span>
                <Button variant="ghost" size="sm" className="gap-1" onClick={onViewCalendar}>
                  Calendar <Calendar className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {plans.length > 0 ? (
                  plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        plan.status === 'completed'
                          ? 'bg-green-500/5 border-green-500/10'
                          : isSameDay(new Date(plan.scheduledDate), new Date())
                            ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20'
                            : 'bg-secondary/30 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center ${
                          plan.status === 'completed' ? 'bg-green-500 text-white' : 'bg-muted'
                        }`}>
                          <span className="text-[10px] font-bold uppercase">{format(new Date(plan.scheduledDate), 'EEE')}</span>
                          <span className="text-xs font-bold leading-none">{format(new Date(plan.scheduledDate), 'd')}</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {plan.status === 'completed' ? 'Session Complete' : 'Strength Session'}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {plan.equipmentContext} Context • {plan.targetDuration}m
                          </div>
                        </div>
                      </div>
                      {plan.status === 'completed' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No sessions planned for this week.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights & Cloud Sync */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-gradient-to-br from-secondary/50 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Coaching Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background border border-border shadow-sm">
                  <div className="flex items-center gap-2 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Muscle Imbalance
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your rear delts and lower back are trailing. I've adjusted your next 3 sessions to include higher volume for these areas.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border shadow-sm">
                  <div className="flex items-center gap-2 font-medium mb-2 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    Progression Spike
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your Bench Press e1RM has increased by 4.2% in the last 14 days. This indicates your current recovery and intensity are perfectly dialed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                Cloud Sync
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-border shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">Google Connected</div>
                  <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Mobile & Web Parity</span>
                  <Badge variant="outline" className="text-[10px] py-0 h-4 border-green-500/20 text-green-500 bg-green-500/5">Active</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Your workouts, plans, and muscle maps are synced in near real-time between your web dashboard and mobile app.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
