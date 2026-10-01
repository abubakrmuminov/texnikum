'use client';

import React from 'react';
import { Check, ShieldCheck, Building2, Palette, MapPin, Landmark, UserCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepItem {
  index: number;
  key: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STEP_ITEMS: StepItem[] = [
  { index: 0, key: 'step0', title: 'Xavfsizlik', icon: ShieldCheck },
  { index: 1, key: 'step1', title: 'Muassasa', icon: Building2 },
  { index: 2, key: 'step2', title: 'Brending', icon: Palette },
  { index: 3, key: 'step3', title: 'Aloqa', icon: MapPin },
  { index: 4, key: 'step4', title: 'Rekvizitlar', icon: Landmark },
  { index: 5, key: 'step5', title: 'Admin', icon: UserCheck },
  { index: 6, key: 'step6', title: 'Tasdiqlash', icon: Sparkles },
];

interface SetupStepperProps {
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  maxAccessibleStep: number;
  stepTitles: Record<string, string>;
}

export function SetupStepper({
  currentStep,
  onStepClick,
  maxAccessibleStep,
  stepTitles,
}: SetupStepperProps): JSX.Element {
  return (
    <nav
      aria-label="Oʻrnatish bosqichlari / Шаги установки"
      className="w-full overflow-x-auto py-3 px-2 focus:outline-none"
    >
      <ol className="flex items-center min-w-max justify-between gap-2 md:gap-3">
        {STEP_ITEMS.map((step) => {
          const isCurrent = currentStep === step.index;
          const isDone = currentStep > step.index;
          const isClickable = onStepClick && step.index <= maxAccessibleStep;
          const Icon = step.icon;
          const displayTitle = stepTitles[step.key] || step.title;

          return (
            <li
              key={step.index}
              className="flex items-center gap-2"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step.index)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isCurrent && 'bg-primary text-primary-foreground shadow-sm',
                  isDone &&
                    !isCurrent &&
                    'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30',
                  !isCurrent &&
                    !isDone &&
                    'bg-muted text-muted-foreground opacity-60 cursor-not-allowed',
                )}
                aria-label={`${step.index}-qadam: ${displayTitle}${isDone ? ' (bajarildi)' : ''}${isCurrent ? ' (joriy)' : ''}`}
              >
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
                    isCurrent && 'bg-primary-foreground text-primary',
                    isDone && !isCurrent && 'bg-primary text-primary-foreground',
                    !isCurrent && !isDone && 'bg-muted-foreground/30 text-foreground',
                  )}
                >
                  {isDone ? <Check className="size-3 stroke-[3]" /> : step.index}
                </span>
                <Icon className="size-3.5 hidden sm:inline-block" />
                <span className="truncate max-w-[120px] sm:max-w-none">{displayTitle}</span>
              </button>

              {step.index < STEP_ITEMS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-3 sm:w-6 transition-colors',
                    isDone ? 'bg-primary' : 'bg-muted',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
