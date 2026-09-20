import React from 'react';
import { Compass, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  currentStep: number;
}

export const Header: React.FC<HeaderProps> = ({ onReset, currentStep }) => {
  return (
    <header id="app-header" className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-slate-900 tracking-tight">
                Edit Theory Concierge
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Universal Booking
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Direct concierge for dining, fitness, salons, spas & travel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button
              id="header-reset-btn"
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

