import React, { useState, useEffect } from 'react';
import { Search, Loader2, ArrowLeft, Sparkles, MapPin } from 'lucide-react';
import { CategoryId, Place } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { discoverPlaces, getMockDiscoveryResults } from '../services/api';
import { DismissibleBanner } from './DismissibleBanner';
import { useDebounce } from '../hooks/useDebounce';
import { WEBHOOK_DISCOVER } from '../config';

interface Screen2DiscoveryProps {
  category: CategoryId;
  savedQuery: string;
  onQueryChange: (query: string) => void;
  onDiscoverySuccess: (results: Place[], query: string) => void;
  onBackToCategory: () => void;
}

export const Screen2Discovery: React.FC<Screen2DiscoveryProps> = ({
  category,
  savedQuery,
  onQueryChange,
  onDiscoverySuccess,
  onBackToCategory,
}) => {
  const categoryInfo = CATEGORY_MAP[category] || CATEGORY_MAP.restaurant;
  const [inputValue, setInputValue] = useState(savedQuery);
  const debouncedQuery = useDebounce(inputValue, 250);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  // Sync debounced value back to parent state
  useEffect(() => {
    onQueryChange(debouncedQuery);
  }, [debouncedQuery, onQueryChange]);

  const handleSubmit = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSearch = (overrideQuery ?? inputValue).trim();

    if (!queryToSearch) {
      setEmptyMessage('Please enter what you are looking for.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setEmptyMessage(null);

    try {
      const results = await discoverPlaces(category, queryToSearch);

      if (!results || results.length === 0) {
        setEmptyMessage('No results found — try a different search or category.');
      } else {
        onDiscoverySuccess(results, queryToSearch);
      }
    } catch (err: any) {
      console.error('Discovery search failure:', err);
      setErrorMessage("We're having trouble searching right now. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setEmptyMessage(null);
    setErrorMessage(null);
    // Submit with clicked suggestion
    handleSubmit(undefined, suggestion);
  };

  const handleUseMockData = () => {
    const mockResults = getMockDiscoveryResults(category, inputValue || categoryInfo.exampleQueries[0]);
    onDiscoverySuccess(mockResults, inputValue || categoryInfo.exampleQueries[0]);
  };

  const isPlaceholderUrl = WEBHOOK_DISCOVER.includes('<') || WEBHOOK_DISCOVER.includes('base-url') || WEBHOOK_DISCOVER.includes('railway-url');

  return (
    <div id="screen-2-container" className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Back to Category selector */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          id="back-to-screen-1-btn"
          onClick={onBackToCategory}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Category
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          {categoryInfo.label}
        </span>
      </div>

      {/* Screen Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Find the perfect {categoryInfo.shortLabel.toLowerCase()}
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
          Describe the vibe, cuisine, specialty, or location you are seeking.
        </p>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="space-y-2">
          <DismissibleBanner
            id="screen-2-error-banner"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
            onRetry={() => handleSubmit()}
          />
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">Testing preview while service is unavailable?</span>
            <button
              type="button"
              id="screen-2-sample-btn"
              onClick={handleUseMockData}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            >
              Load Sample {categoryInfo.shortLabel} Places
            </button>
          </div>
        </div>
      )}

      {/* Search Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} id="discovery-search-form" className="space-y-4">
          <div>
            <label htmlFor="discovery-query-input" className="block text-sm font-semibold text-slate-800 mb-2">
              Discovery search query
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="discovery-query-input"
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setEmptyMessage(null);
                }}
                disabled={isLoading}
                placeholder={`e.g. "${categoryInfo.exampleQueries[0]}"`}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm sm:text-base font-medium transition-all shadow-xs disabled:bg-slate-50 disabled:text-slate-400"
                autoFocus
              />
            </div>

            {/* Inline Empty / Info Message */}
            {emptyMessage && (
              <p id="discovery-empty-message" className="mt-2 text-sm text-indigo-700 font-medium flex items-center gap-1.5 animate-fadeIn">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                {emptyMessage}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            id="discovery-submit-btn"
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Searching local venues...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-indigo-200" />
                <span>Discover Available Places</span>
              </>
            )}
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Popular searches for {categoryInfo.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {categoryInfo.exampleQueries.map((example, idx) => (
              <button
                key={idx}
                type="button"
                id={`suggestion-chip-${idx}`}
                onClick={() => handleSuggestionClick(example)}
                disabled={isLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors font-medium cursor-pointer text-left hover:border-slate-300 disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
