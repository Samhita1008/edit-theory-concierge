import React from 'react';
import { Check } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  canNavigateBackTo?: (step: number) => boolean;
}

const STEPS = [
  { number: 1, title: 'Category', short: 'Category' },
  { number: 2, title: 'Discovery', short: 'Search' },
  { number: 3, title: 'Venue List', short: 'Select' },
  { number: 4, title: 'Booking', short: 'Details' },
  { number: 5, title: 'Confirmation', short: 'Status' },
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onStepClick,
  canNavigateBackTo,
}) => {
  return (
    <nav id="step-progress-bar" aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = Boolean(onStepClick && canNavigateBackTo && canNavigateBackTo(step.number) && step.number < currentStep);

          return (
            <li key={step.number} className="flex-1 flex items-center">
              <button
                type="button"
                id={`step-indicator-${step.number}`}
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick && onStepClick(step.number)}
                className={`w-full group flex flex-col items-center sm:items-start text-left transition-all py-1.5 px-1 rounded-lg ${
                  isClickable ? 'cursor-pointer hover:bg-slate-100/70' : 'cursor-default'
                }`}
              >
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                      isCompleted
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-indigo-100'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <div className="hidden sm:block flex-1 min-w-0">
                    <p
                      className={`text-[11px] uppercase tracking-wider font-semibold truncate ${
                        isCurrent
                          ? 'text-slate-900 font-bold'
                          : isCompleted
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      Step {step.number}
                    </p>
                    <p
                      className={`text-xs truncate font-medium ${
                        isCurrent ? 'text-indigo-600 font-semibold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>

                {/* Mobile bar indicator */}
                <div className="w-full mt-1.5 h-1 sm:hidden rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isCompleted || isCurrent ? 'bg-indigo-600 w-full' : 'w-0'
                    }`}
                  />
                </div>
              </button>

              {idx < STEPS.length - 1 && (
                <div className="hidden sm:block w-3 sm:w-6 h-[2px] bg-slate-200 mx-1 shrink-0">
                  <div
                    className={`h-full transition-all ${
                      step.number < currentStep ? 'bg-indigo-600' : 'bg-transparent'
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
