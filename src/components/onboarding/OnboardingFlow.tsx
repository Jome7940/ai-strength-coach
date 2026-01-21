import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoalStep } from './steps/GoalStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { EquipmentStep } from './steps/EquipmentStep';
import { ConstraintsStep } from './steps/ConstraintsStep';
import { ReviewStep } from './steps/ReviewStep';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Dumbbell } from 'lucide-react';
import type { Equipment, UserConstraints } from '@/types';

export interface OnboardingData {
  goal: 'strength' | 'hypertrophy' | 'general_fitness' | null;
  experience: 'beginner' | 'intermediate' | 'advanced' | null;
  trainingDaysPerWeek: number;
  sessionDurationMinutes: number;
  equipment: Equipment[];
  constraints: UserConstraints;
  bodyweight?: number;
  estimatedMaxes?: {
    bench?: number;
    squat?: number;
    deadlift?: number;
    overheadPress?: number;
  };
}

const STEPS = ['goal', 'experience', 'schedule', 'equipment', 'constraints', 'review'] as const;

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    goal: null,
    experience: null,
    trainingDaysPerWeek: 4,
    sessionDurationMinutes: 45,
    equipment: [],
    constraints: {
      excludedExercises: [],
      excludedMovements: [],
      injuries: [],
      preferences: [],
    },
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(data);
  };

  const canProceed = () => {
    switch (STEPS[currentStep]) {
      case 'goal':
        return data.goal !== null;
      case 'experience':
        return data.experience !== null;
      case 'schedule':
        return data.trainingDaysPerWeek >= 2 && data.sessionDurationMinutes >= 20;
      case 'equipment':
        return data.equipment.length > 0;
      case 'constraints':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'goal':
        return <GoalStep value={data.goal} onChange={(goal) => updateData({ goal })} />;
      case 'experience':
        return <ExperienceStep value={data.experience} onChange={(experience) => updateData({ experience })} />;
      case 'schedule':
        return (
          <ScheduleStep
            days={data.trainingDaysPerWeek}
            duration={data.sessionDurationMinutes}
            onDaysChange={(trainingDaysPerWeek) => updateData({ trainingDaysPerWeek })}
            onDurationChange={(sessionDurationMinutes) => updateData({ sessionDurationMinutes })}
          />
        );
      case 'equipment':
        return <EquipmentStep value={data.equipment} onChange={(equipment) => updateData({ equipment })} />;
      case 'constraints':
        return (
          <ConstraintsStep
            value={data.constraints}
            bodyweight={data.bodyweight}
            estimatedMaxes={data.estimatedMaxes}
            onChange={(constraints) => updateData({ constraints })}
            onBodyweightChange={(bodyweight) => updateData({ bodyweight })}
            onMaxesChange={(estimatedMaxes) => updateData({ estimatedMaxes })}
          />
        );
      case 'review':
        return <ReviewStep data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button variant="ghost" size="icon" onClick={prevStep} className="shrink-0">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold tracking-tight">AI Strength Coach</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <Progress value={progress} className="h-1" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={STEPS[currentStep]}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/80 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleComplete} className="w-full h-12 text-base font-medium" size="lg">
              Start Training
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              Continue
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
