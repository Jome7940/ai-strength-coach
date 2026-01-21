import { Target, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalStepProps {
  value: 'strength' | 'hypertrophy' | 'general_fitness' | null;
  onChange: (goal: 'strength' | 'hypertrophy' | 'general_fitness') => void;
}

const goals = [
  {
    id: 'strength' as const,
    title: 'Build Strength',
    description: 'Increase your maximum lifts and overall power. Focus on heavy compound movements.',
    icon: Target,
    details: ['Lower reps, heavier weights', 'Compound-focused', 'Longer rest periods'],
  },
  {
    id: 'hypertrophy' as const,
    title: 'Build Muscle',
    description: 'Maximize muscle growth through volume and progressive overload.',
    icon: TrendingUp,
    details: ['Moderate reps, moderate weight', 'Mix of compounds & isolation', 'Optimal time under tension'],
  },
  {
    id: 'general_fitness' as const,
    title: 'General Fitness',
    description: 'Balanced approach for overall health, strength, and conditioning.',
    icon: Activity,
    details: ['Varied rep ranges', 'Full body focus', 'Flexibility in training'],
  },
];

export function GoalStep({ value, onChange }: GoalStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">What's your primary goal?</h1>
        <p className="text-muted-foreground">
          This helps us tailor your workouts for optimal results.
        </p>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => onChange(goal.id)}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
              'hover:border-primary/50 hover:bg-secondary/50',
              value === goal.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            )}
          >
            <div className="flex gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  value === goal.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                <goal.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold tracking-tight">{goal.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{goal.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {goal.details.map((detail) => (
                    <span
                      key={detail}
                      className="text-xs px-2 py-1 bg-secondary rounded-md text-muted-foreground"
                    >
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
