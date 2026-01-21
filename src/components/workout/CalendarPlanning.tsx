import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  Lock,
  Unlock,
  MoreVertical,
  Trash2,
  Edit2,
  CalendarDays,
  Sparkles,
  RefreshCw,
  Clock,
  Dumbbell,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { blink } from '@/lib/blink';
import type { UserProfile, WorkoutPlan, WorkoutTemplate } from '@/types';
import { toast } from 'sonner';

interface CalendarPlanningProps {
  profile: UserProfile;
  onBack: () => void;
  onEditWorkout: (template: WorkoutTemplate) => void;
}

export function CalendarPlanning({ profile, onBack, onEditWorkout }: CalendarPlanningProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    loadPlans();
  }, [currentDate]);

  async function loadPlans() {
    setLoading(true);
    try {
      const data = await blink.db.workoutPlans.list({
        where: { userId: profile.userId },
        limit: 50,
      });
      
      // Load templates for each plan
      const plansWithTemplates = await Promise.all((data || []).map(async (plan) => {
        if (plan.templateId) {
          const templates = await blink.db.workoutTemplates.list({
            where: { id: plan.templateId },
            limit: 1
          });
          if (templates && templates[0]) {
            return {
              ...plan,
              template: {
                ...templates[0],
                exercises: typeof templates[0].exercises === 'string' ? JSON.parse(templates[0].exercises) : templates[0].exercises,
                rationale: typeof templates[0].rationale === 'string' ? JSON.parse(templates[0].rationale) : templates[0].rationale,
                targetMuscles: typeof templates[0].targetMuscles === 'string' ? JSON.parse(templates[0].targetMuscles) : templates[0].targetMuscles,
              }
            };
          }
        }
        return plan;
      }));

      setPlans(plansWithTemplates as WorkoutPlan[]);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load training schedule');
    } finally {
      setLoading(false);
    }
  }

  const handleGenerateNextWeek = async () => {
    setIsGenerating(true);
    try {
      // Logic to generate next week's worth of workouts
      // For MVP, we'll simulate creating 3-4 plans for the current week
      const newPlans: Omit<WorkoutPlan, 'id'>[] = [];
      const trainingDays = [1, 3, 5]; // Mon, Wed, Fri
      
      for (const dayOffset of trainingDays) {
        const scheduledDate = addDays(weekStart, dayOffset - 1);
        
        // Skip if already has a plan for this day
        if (plans.some(p => isSameDay(new Date(p.scheduledDate), scheduledDate))) {
          continue;
        }

        newPlans.push({
          userId: profile.userId,
          scheduledDate: scheduledDate.toISOString(),
          equipmentContext: 'gym',
          targetDuration: 45,
          status: 'planned',
          isLocked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      if (newPlans.length > 0) {
        await Promise.all(newPlans.map(p => blink.db.workoutPlans.create(p as any)));
        toast.success(`Generated ${newPlans.length} workouts for the week!`);
        loadPlans();
      } else {
        toast.info('Week is already planned.');
      }
    } catch (error) {
      console.error('Error generating week:', error);
      toast.error('Failed to generate training plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await blink.db.workoutPlans.delete({ id });
      setPlans(prev => prev.filter(p => p.id !== id));
      toast.success('Workout removed from schedule');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to remove workout');
    }
  };

  const handleToggleLock = async (plan: WorkoutPlan) => {
    try {
      await blink.db.workoutPlans.update({
        id: plan.id,
        isLocked: !plan.isLocked,
        updatedAt: new Date().toISOString(),
      });
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isLocked: !p.isLocked } : p));
    } catch (error) {
      console.error('Error locking plan:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">Training Schedule</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="w-32 text-center">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d')}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="flex-1 gap-2 h-11" 
            onClick={handleGenerateNextWeek}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            AI Generate Week
          </Button>
          <Button variant="outline" className="gap-2 h-11">
            <Plus className="w-4 h-4" />
            Add Manual Workout
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-4">
          {days.map((day) => {
            const dayPlans = plans.filter(p => isSameDay(new Date(p.scheduledDate), day));
            
            return (
              <div key={day.toISOString()} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold uppercase ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}>
                      {format(day, 'EEEE')}
                    </span>
                    <span className={`text-xs ${isToday(day) ? 'bg-primary text-primary-foreground px-1.5 py-0.5 rounded' : 'text-muted-foreground'}`}>
                      {format(day, 'MMM d')}
                    </span>
                  </div>
                  {dayPlans.length === 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Rest Day
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {dayPlans.map((plan) => (
                    <WorkoutPlanCard
                      key={plan.id}
                      plan={plan}
                      onDelete={() => handleDeletePlan(plan.id)}
                      onToggleLock={() => handleToggleLock(plan)}
                      onEdit={() => plan.template && onEditWorkout(plan.template)}
                    />
                  ))}
                  {dayPlans.length === 0 && (
                    <div className="h-12 rounded-xl border border-dashed border-border flex items-center justify-center bg-secondary/10">
                      <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-1 hover:bg-transparent">
                        <Plus className="w-3 h-3" /> Add workout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function WorkoutPlanCard({ 
  plan, 
  onDelete, 
  onToggleLock,
  onEdit 
}: { 
  plan: WorkoutPlan; 
  onDelete: () => void;
  onToggleLock: () => void;
  onEdit: () => void;
}) {
  return (
    <Card className={`overflow-hidden ${plan.status === 'completed' ? 'bg-green-500/5 border-green-500/10' : ''}`}>
      <CardContent className="p-0">
        <div className="flex">
          <div className={`w-1.5 ${
            plan.status === 'completed' ? 'bg-green-500' : 'bg-primary'
          }`} />
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{plan.template?.name || 'Scheduled Workout'}</h3>
                  {plan.isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 capitalize">
                    <Dumbbell className="w-3 h-3" /> {plan.equipmentContext}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {plan.targetDuration} min
                  </span>
                  {plan.status === 'completed' && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <Check className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onToggleLock}>
                    {plan.isLocked ? (
                      <><Unlock className="w-4 h-4 mr-2" /> Unlock Plan</>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Lock Plan</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <Trash2 className="w-4 h-4 mr-2" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {plan.template?.targetMuscles && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {plan.template.targetMuscles.slice(0, 4).map((m) => (
                  <Badge key={m} variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                    {m.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
