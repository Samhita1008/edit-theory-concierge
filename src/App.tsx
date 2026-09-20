import React, { useState } from 'react';
import { CategoryId, Place, BookingDetails } from './types';
import { Header } from './components/Header';
import { StepProgressBar } from './components/StepProgressBar';
import { Screen1Category } from './components/Screen1Category';
import { Screen2Discovery } from './components/Screen2Discovery';
import { Screen3Results } from './components/Screen3Results';
import { Screen4Booking } from './components/Screen4Booking';
import { Screen5Status } from './components/Screen5Status';
import { InitialLoadingScreen } from './components/InitialLoadingScreen';

export default function App() {
  // Initial Page Loading State (subtle, minimal entrance)
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Navigation Step: 1 | 2 | 3 | 4 | 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // App Global State
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [discoveryQuery, setDiscoveryQuery] = useState<string>('');
  const [discoveryResults, setDiscoveryResults] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    name: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '18:30',
    partySize: '2',
    sessionType: '',
    serviceType: '',
    destination: '',
    travelDates: '',
  });
  const [bookingId, setBookingId] = useState<string | null>(null);

  // RESET ALL STATE (e.g. from Screen 5 or Header)
  const handleResetAll = () => {
    setCurrentStep(1);
    setCategory(null);
    setDiscoveryQuery('');
    setDiscoveryResults([]);
    setSelectedPlace(null);
    setBookingId(null);
  };

  // SCREEN 1: Select Category
  const handleSelectCategory = (newCat: CategoryId) => {
    // If category is changed, reset query, results, selectedPlace, and bookingId downstream
    if (newCat !== category) {
      setDiscoveryQuery('');
      setDiscoveryResults([]);
      setSelectedPlace(null);
      setBookingId(null);
    }
    setCategory(newCat);
    setCurrentStep(2);
  };

  // SCREEN 2: Discovery Success
  const handleDiscoverySuccess = (results: Place[], query: string) => {
    setDiscoveryResults(results);
    setDiscoveryQuery(query);
    setCurrentStep(3);
  };

  // SCREEN 2: Back to Category Selector
  const handleBackToCategory = () => {
    setCurrentStep(1);
  };

  // SCREEN 3: Select Place
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setCurrentStep(4);
  };

  // SCREEN 3: Back to Discovery
  const handleBackToDiscovery = () => {
    // Preserves last-entered query
    setCurrentStep(2);
  };

  // SCREEN 4: Booking Success
  const handleBookingSuccess = (id: string, details: BookingDetails) => {
    setBookingId(id);
    setBookingDetails(details);
    setCurrentStep(5);
  };

  // SCREEN 4: Back to Results
  const handleBackToResults = () => {
    // Preserves selected place & form values
    setCurrentStep(3);
  };

  // SCREEN 5: Pick a Different Place (reusing discovery results)
  const handlePickDifferentPlace = () => {
    setSelectedPlace(null);
    setBookingId(null);
    setCurrentStep(3);
  };

  // Check if step navigation is allowed from the progress bar
  const canNavigateBackTo = (stepNumber: number) => {
    if (currentStep === 5) return false; // No back navigation on Screen 5
    if (stepNumber === 1) return true;
    if (stepNumber === 2 && Boolean(category)) return true;
    if (stepNumber === 3 && discoveryResults.length > 0) return true;
    if (stepNumber === 4 && Boolean(selectedPlace)) return true;
    return false;
  };

  const handleStepBarClick = (stepNumber: number) => {
    if (canNavigateBackTo(stepNumber)) {
      setCurrentStep(stepNumber);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans relative">
      {/* Initial Page Loading Overlay (Minimal & Snappy) */}
      {isInitialLoading && (
        <InitialLoadingScreen onComplete={() => setIsInitialLoading(false)} />
      )}

      {/* Top App Header */}
      <Header onReset={handleResetAll} currentStep={currentStep} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        
        {/* Step Progress Tracker (Shown on Screens 1 through 4) */}
        {currentStep <= 4 && (
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
            <StepProgressBar
              currentStep={currentStep}
              onStepClick={handleStepBarClick}
              canNavigateBackTo={canNavigateBackTo}
            />
          </div>
        )}

        {/* SCREEN 1: Category Selection */}
        {currentStep === 1 && (
          <Screen1Category
            selectedCategory={category}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {/* SCREEN 2: Discovery Form */}
        {currentStep === 2 && category && (
          <Screen2Discovery
            category={category}
            savedQuery={discoveryQuery}
            onQueryChange={setDiscoveryQuery}
            onDiscoverySuccess={handleDiscoverySuccess}
            onBackToCategory={handleBackToCategory}
          />
        )}

        {/* SCREEN 3: Results List */}
        {currentStep === 3 && category && (
          <Screen3Results
            category={category}
            query={discoveryQuery}
            results={discoveryResults}
            selectedPlace={selectedPlace}
            onSelectPlace={handleSelectPlace}
            onBackToDiscovery={handleBackToDiscovery}
          />
        )}

        {/* SCREEN 4: Booking Details Form */}
        {currentStep === 4 && category && selectedPlace && (
          <Screen4Booking
            category={category}
            selectedPlace={selectedPlace}
            bookingDetails={bookingDetails}
            onBookingDetailsChange={setBookingDetails}
            onBookingSuccess={handleBookingSuccess}
            onBackToResults={handleBackToResults}
          />
        )}

        {/* SCREEN 5: Confirmation / Status Screen */}
        {currentStep === 5 && bookingId && category && selectedPlace && (
          <Screen5Status
            bookingId={bookingId}
            category={category}
            selectedPlace={selectedPlace}
            bookingDetails={bookingDetails}
            onPickDifferentPlace={handlePickDifferentPlace}
            onBookSomethingElse={handleResetAll}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Edit Theory Concierge. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Restaurants</span>
            <span>•</span>
            <span>Gyms</span>
            <span>•</span>
            <span>Salons</span>
            <span>•</span>
            <span>Spas</span>
            <span>•</span>
            <span>Travel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
