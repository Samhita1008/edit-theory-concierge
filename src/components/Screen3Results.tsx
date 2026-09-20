import React, { useEffect } from 'react';
import { ArrowLeft, MapPin, Tag, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import { Place, CategoryId } from '../types';
import { CATEGORY_MAP } from '../data/categories';

interface Screen3ResultsProps {
  category: CategoryId;
  query: string;
  results: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onBackToDiscovery: () => void;
}

export const Screen3Results: React.FC<Screen3ResultsProps> = ({
  category,
  query,
  results,
  selectedPlace,
  onSelectPlace,
  onBackToDiscovery,
}) => {
  const categoryInfo = CATEGORY_MAP[category] || CATEGORY_MAP.restaurant;

  // Edge case: if results array is empty when this screen is reached directly, redirect to Screen 2
  useEffect(() => {
    if (!results || results.length === 0) {
      onBackToDiscovery();
    }
  }, [results, onBackToDiscovery]);

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div id="screen-3-container" className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Navigation & Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <button
          type="button"
          id="back-to-screen-2-btn"
          onClick={onBackToDiscovery}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">
            {results.length} {results.length === 1 ? 'place' : 'places'} found
          </span>
          <span>•</span>
          <span className="truncate max-w-[200px] text-slate-600 italic">"{query}"</span>
        </div>
      </div>

      {/* Screen Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
          Select a {categoryInfo.shortLabel.toLowerCase()}
        </h1>
        <p className="text-slate-600 text-sm">
          Click any venue below to proceed with your booking details and availability check.
        </p>
      </div>

      {/* Results Cards List */}
      <div id="results-list" className="space-y-3.5">
        {results.map((place, idx) => {
          const isSelected = selectedPlace?.name === place.name;

          return (
            <div
              key={`${place.name}-${idx}`}
              id={`place-card-${idx}`}
              onClick={() => onSelectPlace(place)}
              className={`group p-5 rounded-2xl border bg-white transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-600/60 bg-indigo-50/30'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-indigo-600 transition-colors font-sans">
                    {place.name}
                  </h2>

                  {/* Tag pill */}
                  {place.tag && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      <Tag className="w-2.5 h-2.5 text-slate-500" />
                      {place.tag}
                    </span>
                  )}
                </div>

                {/* Opening Hours */}
                {place.openingHours && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-700 font-sans">Hours:</span>
                    <span className="truncate">{place.openingHours}</span>
                  </div>
                )}

                {/* View on Map link (if lat and lon exist) */}
                {place.lat !== undefined && place.lon !== undefined && place.lat !== '' && place.lon !== '' && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <a
                      href={`https://www.google.com/maps?q=${place.lat},${place.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline w-fit font-medium"
                    >
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>View on map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Button / Arrow */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-xs font-semibold text-slate-500 sm:hidden">
                  Ready to book?
                </span>
                <div className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 group-hover:bg-indigo-600 text-white text-xs font-semibold transition-colors shadow-xs">
                  <span>Select</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
