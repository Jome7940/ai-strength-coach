import { cn } from '@/lib/utils';
import { Calendar, Clock } from 'lucide-react';

interface ScheduleStepProps {
  days: number;
  duration: number;
  onDaysChange: (days: number) => void;
  onDurationChange: (duration: number) => void;
}

const dayOptions = [2, 3, 4, 5, 6];
const durationOptions = [
  { value: 20, label: '20 min', description: 'Quick sessions' },
  { value: 30, label: '30 min', description: 'Efficient training' },
  { value: 45, label: '45 min', description: 'Standard workout' },
  { value: 60, label: '60 min', description: 'Full session' },
];

export function ScheduleStep({ days, duration, onDaysChange, onDurationChange }: ScheduleStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Set your schedule</h1>
        <p className="text-muted-foreground">
          How often and how long can you train? We'll optimize workouts accordingly.
        </p>
      </div>

      {/* Training Days */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Training days per week</h2>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {dayOptions.map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange(d)}
              className={cn(
                'py-4 rounded-xl border-2 font-semibold text-lg transition-all duration-200',
                'hover:border-primary/50 hover:bg-secondary/50',
                days === d
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card'
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {days === 2 && 'Great for beginners or busy schedules. Full body focus.'}
          {days === 3 && 'Popular choice for balanced progress and recovery.'}
          {days === 4 && 'Ideal for most intermediate lifters. Upper/lower or push/pull splits work well.'}
          {days === 5 && 'Allows for focused muscle group training with good recovery.'}
          {days === 6 && 'High frequency training. Best for advanced lifters with good recovery.'}
        </p>
      </div>

      {/* Session Duration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Preferred session length</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {durationOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onDurationChange(opt.value)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all duration-200',
                'hover:border-primary/50 hover:bg-secondary/50',
                duration === opt.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              <div className="font-semibold text-lg">{opt.label}</div>
              <div className="text-sm text-muted-foreground">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
        <div className="text-sm text-muted-foreground mb-1">Weekly commitment</div>
        <div className="text-2xl font-bold tracking-tight">
          {Math.round((days * duration) / 60 * 10) / 10} hours/week
        </div>
        <div className="text-sm text-muted-foreground">
          {days} days × {duration} minutes
        </div>
      </div>
    </div>
  );
}
