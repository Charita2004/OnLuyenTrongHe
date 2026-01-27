import React from 'react';
import { Step } from '../types';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  maxStepAllowed?: number; // Optional: To restrict navigation
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, onStepClick, maxStepAllowed = 5 }) => {
  return (
    <div className="bg-white px-4 sm:px-10 py-8 rounded-xl shadow-sm border border-gray-200 mb-8 overflow-x-auto">
      <div className="flex items-start justify-between w-full min-w-[700px] max-w-5xl mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isLast = index === steps.length - 1;
          
          // Determine if this step is clickable
          const isClickable = stepNumber <= maxStepAllowed;

          return (
            <React.Fragment key={step.id}>
              {/* Step Item */}
              <div 
                className={`flex flex-col items-center z-10 relative ${isClickable ? 'cursor-pointer group' : 'cursor-not-allowed opacity-60'}`}
                onClick={() => isClickable && onStepClick && onStepClick(stepNumber)}
              >
                {/* Circle Indicator */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 box-border
                    ${isCompleted
                      ? 'bg-blue-700 text-white border-2 border-blue-700' // Completed: Solid Blue
                      : isActive
                        ? 'bg-white text-blue-700 border-2 border-blue-700 shadow-md scale-110' // Active: Outlined Blue
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200 group-hover:border-gray-300' // Future: Gray
                    }`}
                >
                  {isCompleted ? (
                    <Check size={20} strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Label */}
                <div className={`mt-3 w-32 sm:w-40 text-center text-sm transition-colors duration-300 leading-tight
                  ${isActive ? 'text-blue-800 font-bold' : isCompleted ? 'text-gray-800 font-medium' : 'text-gray-400 font-medium'}`}
                >
                  {step.label}
                </div>
              </div>

              {/* Connector Arrow */}
              {!isLast && (
                <div className="flex-auto flex items-center justify-center px-2 mt-5">
                    <div className={`w-full h-[2px] relative transition-colors duration-300 ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        {/* Arrow Head (Triangle) */}
                        <div 
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-[2px] w-0 h-0 
                                border-t-[5px] border-t-transparent 
                                border-b-[5px] border-b-transparent 
                                border-l-[8px] transition-colors duration-300
                                ${isCompleted ? 'border-l-blue-600' : 'border-l-gray-200'}
                            `}
                        />
                    </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};