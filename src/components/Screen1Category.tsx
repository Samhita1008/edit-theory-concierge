import React from 'react';
import { UtensilsCrossed, Dumbbell, Scissors, Sparkles, Plane, ArrowRight } from 'lucide-react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';

interface Screen1CategoryProps {
  selectedCategory: CategoryId | null;
  onSelectCategory: (category: CategoryId) => void;
}

const ICON_MAP = {
  UtensilsCrossed,
  Dumbbell,
  Scissors,
  Sparkles,
  Plane,
};

export const Screen1Category: React.FC<Screen1CategoryProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div id="screen-1-container" className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          What would you like to book today?
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Select a category to discover curated local spots, check availability, and reserve effortlessly.
        </p>
      </div>

      {/* Category Cards Grid */}
      <div id="category-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((category) => {
          const Icon = ICON_MAP[category.iconName];
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              id={`category-card-${category.id.replace(/\s+/g, '-')}`}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`group text-left p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between bg-white relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-600 shadow-md'
                  : 'border-slate-200 hover:border-slate-400 hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 group-hover:text-slate-800">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-sans tracking-tight">
                    {category.label}
                  </h2>
                  <p className="text-xs font-medium text-indigo-600 mt-0.5">
                    {category.tagline}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Sample badges */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
                {category.exampleQueries.slice(0, 2).map((example, i) => (
                  <span
                    key={i}
                    className="inline-block text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium group-hover:bg-slate-200/70 transition-colors"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
