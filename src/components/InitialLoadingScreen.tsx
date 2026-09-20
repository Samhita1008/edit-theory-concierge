import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface InitialLoadingScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({
  onComplete,
  minDurationMs = 900,
}) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Snappy, realistic loading timer
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, minDurationMs);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, minDurationMs + 300); // 300ms fade transition

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [minDurationMs, onComplete]);

  return (
    <div
      id="initial-loading-screen"
      onClick={() => onComplete()}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-900 select-none cursor-pointer transition-opacity duration-300 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading Edit Theory Concierge"
    >
      <div className="flex flex-col items-center text-center space-y-4 max-w-xs px-6 animate-fadeIn">
        {/* Minimalist Logo Mark */}
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <Sparkles className="w-4 h-4 text-indigo-300" />
        </div>

        {/* Minimal Title */}
        <div className="space-y-1">
          <h1 className="font-serif font-bold text-lg text-slate-900 tracking-tight">
            Edit Theory
          </h1>
          <p className="text-[11px] uppercase tracking-widest text-slate-500 font-medium font-sans">
            Concierge
          </p>
        </div>

        {/* Subtle, slim hairline progress loader */}
        <div className="w-24 h-0.5 bg-slate-200 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-slate-900 rounded-full w-1/2 animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
