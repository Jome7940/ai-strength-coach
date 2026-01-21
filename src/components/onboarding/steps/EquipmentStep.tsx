import { Check, Building2, Home, Backpack, Waves, Dumbbell, Weight, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Equipment } from '@/types';

interface EquipmentStepProps {
  value: Equipment[];
  onChange: (equipment: Equipment[]) => void;
}

const equipmentOptions: {
  id: Equipment;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'full_gym',
    title: 'Full Gym Access',
    description: 'Complete access to a commercial gym',
    icon: Building2,
  },
  {
    id: 'barbell',
    title: 'Barbell & Rack',
    description: 'Barbell, plates, and squat rack',
    icon: Weight,
  },
  {
    id: 'dumbbells',
    title: 'Dumbbells',
    description: 'Adjustable or fixed dumbbells',
    icon: Dumbbell,
  },
  {
    id: 'kettlebells',
    title: 'Kettlebells',
    description: 'One or more kettlebells',
    icon: Settings2,
  },
  {
    id: 'machines',
    title: 'Machines',
    description: 'Cable machines and exercise machines',
    icon: Settings2,
  },
  {
    id: 'cables',
    title: 'Cable System',
    description: 'Cable machine or pulley system',
    icon: Settings2,
  },
  {
    id: 'bands',
    title: 'Resistance Bands',
    description: 'Loop bands or tube bands',
    icon: Waves,
  },
  {
    id: 'bodyweight',
    title: 'Bodyweight Only',
    description: 'No equipment needed',
    icon: Home,
  },
];

const quickSetups = [
  {
    name: 'Full Gym',
    equipment: ['full_gym', 'barbell', 'dumbbells', 'machines', 'cables'] as Equipment[],
    icon: Building2,
  },
  {
    name: 'Home Gym',
    equipment: ['barbell', 'dumbbells', 'kettlebells'] as Equipment[],
    icon: Home,
  },
  {
    name: 'Minimal',
    equipment: ['bands', 'bodyweight'] as Equipment[],
    icon: Backpack,
  },
];

export function EquipmentStep({ value, onChange }: EquipmentStepProps) {
  const toggleEquipment = (eq: Equipment) => {
    if (value.includes(eq)) {
      onChange(value.filter((e) => e !== eq));
    } else {
      onChange([...value, eq]);
    }
  };

  const applyQuickSetup = (equipment: Equipment[]) => {
    onChange(equipment);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">What equipment do you have?</h1>
        <p className="text-muted-foreground">
          Select all that apply. We'll generate workouts based on your available equipment.
        </p>
      </div>

      {/* Quick Setup Buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Quick setup</label>
        <div className="flex gap-2">
          {quickSetups.map((setup) => (
            <button
              key={setup.name}
              onClick={() => applyQuickSetup(setup.equipment)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                'hover:border-primary/50 hover:bg-secondary/50',
                JSON.stringify(value.sort()) === JSON.stringify(setup.equipment.sort())
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              <setup.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{setup.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-2 gap-3">
        {equipmentOptions.map((eq) => {
          const isSelected = value.includes(eq.id);
          return (
            <button
              key={eq.id}
              onClick={() => toggleEquipment(eq.id)}
              className={cn(
                'relative p-4 rounded-xl border-2 text-left transition-all duration-200',
                'hover:border-primary/50 hover:bg-secondary/50',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                <eq.icon className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-sm">{eq.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{eq.description}</p>
            </button>
          );
        })}
      </div>

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Select at least one option to continue
        </p>
      )}
    </div>
  );
}
