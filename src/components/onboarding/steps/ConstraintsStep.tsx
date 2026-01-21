import { useState } from 'react';
import { X, Plus, AlertTriangle, Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { UserConstraints } from '@/types';

interface ConstraintsStepProps {
  value: UserConstraints;
  bodyweight?: number;
  estimatedMaxes?: {
    bench?: number;
    squat?: number;
    deadlift?: number;
    overheadPress?: number;
  };
  onChange: (constraints: UserConstraints) => void;
  onBodyweightChange: (weight?: number) => void;
  onMaxesChange: (maxes?: {
    bench?: number;
    squat?: number;
    deadlift?: number;
    overheadPress?: number;
  }) => void;
}

const commonInjuries = [
  'Lower back',
  'Shoulder',
  'Knee',
  'Wrist',
  'Elbow',
  'Hip',
  'Ankle',
];

const commonExclusions = [
  'Deadlifts',
  'Squats',
  'Overhead Press',
  'Bench Press',
  'Pull-ups',
  'Lunges',
  'Barbell Rows',
];

export function ConstraintsStep({
  value,
  bodyweight,
  estimatedMaxes,
  onChange,
  onBodyweightChange,
  onMaxesChange,
}: ConstraintsStepProps) {
  const [newExclusion, setNewExclusion] = useState('');

  const addExclusion = (movement: string) => {
    if (!value.excludedMovements.includes(movement)) {
      onChange({
        ...value,
        excludedMovements: [...value.excludedMovements, movement],
      });
    }
  };

  const removeExclusion = (movement: string) => {
    onChange({
      ...value,
      excludedMovements: value.excludedMovements.filter((m) => m !== movement),
    });
  };

  const toggleInjury = (injury: string) => {
    if (value.injuries.includes(injury)) {
      onChange({
        ...value,
        injuries: value.injuries.filter((i) => i !== injury),
      });
    } else {
      onChange({
        ...value,
        injuries: [...value.injuries, injury],
      });
    }
  };

  const handleCustomExclusion = () => {
    if (newExclusion.trim()) {
      addExclusion(newExclusion.trim());
      setNewExclusion('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Any limitations?</h1>
        <p className="text-muted-foreground">
          Optional: Tell us about injuries or movements you want to avoid.
        </p>
      </div>

      {/* Injuries/Problem Areas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold">Problem areas (optional)</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {commonInjuries.map((injury) => (
            <button
              key={injury}
              onClick={() => toggleInjury(injury)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                value.injuries.includes(injury)
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/50'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {injury}
            </button>
          ))}
        </div>
        {value.injuries.length > 0 && (
          <p className="text-sm text-muted-foreground">
            We'll avoid exercises that stress these areas and suggest safer alternatives.
          </p>
        )}
      </div>

      {/* Excluded Movements */}
      <div className="space-y-4">
        <h2 className="font-semibold">Exercises to avoid (optional)</h2>
        <div className="flex flex-wrap gap-2">
          {commonExclusions.map((movement) => (
            <button
              key={movement}
              onClick={() =>
                value.excludedMovements.includes(movement)
                  ? removeExclusion(movement)
                  : addExclusion(movement)
              }
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                value.excludedMovements.includes(movement)
                  ? 'bg-destructive/20 text-destructive border border-destructive/50'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {movement}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={newExclusion}
            onChange={(e) => setNewExclusion(e.target.value)}
            placeholder="Add custom exclusion..."
            onKeyDown={(e) => e.key === 'Enter' && handleCustomExclusion()}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={handleCustomExclusion}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {value.excludedMovements.filter(m => !commonExclusions.includes(m)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.excludedMovements
              .filter((m) => !commonExclusions.includes(m))
              .map((movement) => (
                <Badge key={movement} variant="secondary" className="gap-1">
                  {movement}
                  <button onClick={() => removeExclusion(movement)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
          </div>
        )}
      </div>

      {/* Optional Stats */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Body stats (optional)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          This helps us calculate relative strength and recommend appropriate starting weights.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bodyweight (lbs)</label>
            <Input
              type="number"
              value={bodyweight || ''}
              onChange={(e) => onBodyweightChange(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="180"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Estimated 1 Rep Maxes (optional)</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Bench Press</label>
              <Input
                type="number"
                value={estimatedMaxes?.bench || ''}
                onChange={(e) =>
                  onMaxesChange({
                    ...estimatedMaxes,
                    bench: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="185"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Squat</label>
              <Input
                type="number"
                value={estimatedMaxes?.squat || ''}
                onChange={(e) =>
                  onMaxesChange({
                    ...estimatedMaxes,
                    squat: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="225"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Deadlift</label>
              <Input
                type="number"
                value={estimatedMaxes?.deadlift || ''}
                onChange={(e) =>
                  onMaxesChange({
                    ...estimatedMaxes,
                    deadlift: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="275"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Overhead Press</label>
              <Input
                type="number"
                value={estimatedMaxes?.overheadPress || ''}
                onChange={(e) =>
                  onMaxesChange({
                    ...estimatedMaxes,
                    overheadPress: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="115"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
