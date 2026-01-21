import { Baby, User, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExperienceStepProps {
  value: 'beginner' | 'intermediate' | 'advanced' | null;
  onChange: (exp: 'beginner' | 'intermediate' | 'advanced') => void;
}

const levels = [
  {
    id: 'beginner' as const,
    title: 'Beginner',
    description: 'New to strength training or returning after a long break.',
    icon: Baby,
    timeframe: 'Less than 1 year',
    approach: 'Focus on form, build habits, progressive introduction to exercises',
  },
  {
    id: 'intermediate' as const,
    title: 'Intermediate',
    description: 'Consistent training experience with good form on major lifts.',
    icon: User,
    timeframe: '1-3 years',
    approach: 'Progressive overload, varied programming, exercise variety',
  },
  {
    id: 'advanced' as const,
    title: 'Advanced',
    description: 'Extensive experience, close to genetic potential on major lifts.',
    icon: Trophy,
    timeframe: '3+ years',
    approach: 'Periodization, advanced techniques, fine-tuned programming',
  },
];

export function ExperienceStep({ value, onChange }: ExperienceStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">What's your experience level?</h1>
        <p className="text-muted-foreground">
          We'll adjust exercise selection and progression based on your background.
        </p>
      </div>

      <div className="space-y-3">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
              'hover:border-primary/50 hover:bg-secondary/50',
              value === level.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            )}
          >
            <div className="flex gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  value === level.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                <level.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold tracking-tight">{level.title}</h3>
                  <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">
                    {level.timeframe}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{level.description}</p>
                <p className="text-xs text-muted-foreground/80 mt-2 italic">
                  {level.approach}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
