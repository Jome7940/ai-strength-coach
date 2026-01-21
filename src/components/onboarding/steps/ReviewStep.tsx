import { Check, Target, User, Calendar, Clock, Dumbbell, AlertTriangle } from 'lucide-react';
import type { OnboardingData } from '../OnboardingFlow';

interface ReviewStepProps {
  data: OnboardingData;
}

const goalLabels = {
  strength: 'Build Strength',
  hypertrophy: 'Build Muscle',
  general_fitness: 'General Fitness',
};

const experienceLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const equipmentLabels: Record<string, string> = {
  full_gym: 'Full Gym',
  barbell: 'Barbell',
  dumbbells: 'Dumbbells',
  kettlebells: 'Kettlebells',
  machines: 'Machines',
  cables: 'Cables',
  bands: 'Bands',
  bodyweight: 'Bodyweight',
};

export function ReviewStep({ data }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Ready to start!</h1>
        <p className="text-muted-foreground">
          Review your settings. You can always change these later in settings.
        </p>
      </div>

      <div className="space-y-4">
        {/* Goal */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Goal</div>
            <div className="font-semibold">{data.goal ? goalLabels[data.goal] : 'Not set'}</div>
          </div>
          <Check className="w-5 h-5 text-green-500" />
        </div>

        {/* Experience */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Experience</div>
            <div className="font-semibold">
              {data.experience ? experienceLabels[data.experience] : 'Not set'}
            </div>
          </div>
          <Check className="w-5 h-5 text-green-500" />
        </div>

        {/* Schedule */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Schedule</div>
            <div className="font-semibold">
              {data.trainingDaysPerWeek} days/week • {data.sessionDurationMinutes} min sessions
            </div>
            <div className="text-sm text-muted-foreground">
              ~{Math.round((data.trainingDaysPerWeek * data.sessionDurationMinutes) / 60 * 10) / 10} hours/week
            </div>
          </div>
          <Check className="w-5 h-5 text-green-500" />
        </div>

        {/* Equipment */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Equipment</div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {data.equipment.map((eq) => (
                <span
                  key={eq}
                  className="text-xs px-2 py-0.5 bg-secondary rounded-full"
                >
                  {equipmentLabels[eq] || eq}
                </span>
              ))}
            </div>
          </div>
          <Check className="w-5 h-5 text-green-500" />
        </div>

        {/* Constraints (if any) */}
        {(data.constraints.injuries.length > 0 ||
          data.constraints.excludedMovements.length > 0) && (
          <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Limitations</div>
              {data.constraints.injuries.length > 0 && (
                <div className="text-sm mt-1">
                  <span className="text-muted-foreground">Areas to protect: </span>
                  {data.constraints.injuries.join(', ')}
                </div>
              )}
              {data.constraints.excludedMovements.length > 0 && (
                <div className="text-sm mt-1">
                  <span className="text-muted-foreground">Excluded: </span>
                  {data.constraints.excludedMovements.join(', ')}
                </div>
              )}
            </div>
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}

        {/* Optional Stats */}
        {(data.bodyweight || data.estimatedMaxes) && (
          <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Body Stats</div>
              {data.bodyweight && (
                <div className="text-sm">Bodyweight: {data.bodyweight} lbs</div>
              )}
              {data.estimatedMaxes && Object.keys(data.estimatedMaxes).length > 0 && (
                <div className="text-sm text-muted-foreground mt-1">
                  Estimated maxes provided for smart weight suggestions
                </div>
              )}
            </div>
            <Check className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
        <h3 className="font-semibold mb-2">What happens next?</h3>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
            We'll generate your first personalized workout
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
            Track your progress with our visual muscle map
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">3</span>
            AI adapts your training as you progress
          </li>
        </ul>
      </div>
    </div>
  );
}
