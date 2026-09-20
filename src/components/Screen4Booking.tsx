import React, { useState } from 'react';
import { ArrowLeft, Loader2, Calendar, Clock, User, Mail, Phone, Users, Activity, Sparkles, MapPin, Plane, CheckCircle2, ExternalLink } from 'lucide-react';
import { CategoryId, Place, BookingDetails, BookingResponse } from '../types';
import { CATEGORY_MAP } from '../data/categories';
import { bookPlace, AppApiError } from '../services/api';
import { DismissibleBanner } from './DismissibleBanner';
import { WEBHOOK_BOOK } from '../config';

interface Screen4BookingProps {
  category: CategoryId;
  selectedPlace: Place;
  bookingDetails: BookingDetails;
  onBookingDetailsChange: (details: BookingDetails) => void;
  onBookingSuccess: (bookingId: string, details: BookingDetails) => void;
  onBackToResults: () => void;
}

export const Screen4Booking: React.FC<Screen4BookingProps> = ({
  category,
  selectedPlace,
  bookingDetails,
  onBookingDetailsChange,
  onBookingSuccess,
  onBackToResults,
}) => {
  const categoryInfo = CATEGORY_MAP[category] || CATEGORY_MAP.restaurant;

  const [formValues, setFormValues] = useState<BookingDetails>(() => ({
    name: bookingDetails.name || '',
    email: bookingDetails.email || '',
    phone: bookingDetails.phone || '',
    date: bookingDetails.date || new Date().toISOString().split('T')[0],
    time: bookingDetails.time || '18:30',
    partySize: bookingDetails.partySize || '2',
    sessionType: bookingDetails.sessionType || '',
    serviceType: bookingDetails.serviceType || '',
    destination: bookingDetails.destination || '',
    travelDates: bookingDetails.travelDates || '',
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof BookingDetails, value: string) => {
    const updated = { ...formValues, [field]: value };
    setFormValues(updated);
    onBookingDetailsChange(updated);

    // Clear individual field error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const isValidEmail = (emailStr: string): boolean => {
    const trimmed = emailStr.trim();
    // Basic email format validation: must contain @ and a domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const validateClientSide = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!formValues.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!formValues.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!isValidEmail(formValues.email)) {
      errors.email = 'Please enter a valid email address (must contain @ and a domain).';
    }

    if (!formValues.phone.trim()) {
      errors.phone = 'Phone number is required.';
    }
    if (!formValues.date.trim()) {
      errors.date = 'Preferred date is required.';
    }
    if (!formValues.time.trim()) {
      errors.time = 'Preferred time is required.';
    }

    if (category === 'restaurant' && !formValues.partySize?.trim()) errors.partySize = 'Party size is required.';
    if (category === 'gym' && !formValues.sessionType?.trim()) errors.sessionType = 'Session type is required.';
    if ((category === 'salon' || category === 'parlour') && !formValues.serviceType?.trim()) errors.serviceType = 'Service type is required.';
    if (category === 'travel agency') {
      if (!formValues.destination?.trim()) errors.destination = 'Destination is required.';
      if (!formValues.travelDates?.trim()) errors.travelDates = 'Travel dates are required.';
    }

    return errors;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Check basic completeness and email format validation
    const errors = validateClientSide();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Build exact payload matching backend contract:
      // All categories require: name, email, phone, date, time
      // Category-specific required fields:
      // - category === "restaurant" -> partySize
      // - category === "gym" -> sessionType
      // - category === "salon" -> serviceType
      // - category === "parlour" -> serviceType
      // - category === "travel agency" -> destination AND travelDates
      const sanitizedBookingDetails: BookingDetails = {
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        date: formValues.date.trim(),
        time: formValues.time.trim(),
      };

      if (category === 'restaurant') {
        sanitizedBookingDetails.partySize = formValues.partySize?.trim() || '2';
      } else if (category === 'gym') {
        sanitizedBookingDetails.sessionType = formValues.sessionType?.trim() || '';
      } else if (category === 'salon' || category === 'parlour') {
        sanitizedBookingDetails.serviceType = formValues.serviceType?.trim() || '';
      } else if (category === 'travel agency') {
        sanitizedBookingDetails.destination = formValues.destination?.trim() || '';
        sanitizedBookingDetails.travelDates = formValues.travelDates?.trim() || '';
      }

      const response: BookingResponse = await bookPlace(category, selectedPlace, sanitizedBookingDetails);
      if (response.bookingId) {
        onBookingSuccess(response.bookingId, sanitizedBookingDetails);
      } else {
        throw new AppApiError('Booking created but no booking reference was returned.');
      }
    } catch (err: any) {
      console.error('Booking submission failure:', err);
      if (err instanceof AppApiError && err.missingFields && err.missingFields.length > 0) {
        // Validation failure response: { missingFields: [...] }
        const errMap: Record<string, string> = {};
        err.missingFields.forEach((f) => {
          errMap[f] = `Missing required field: ${f}`;
        });
        setFieldErrors(errMap);
      } else {
        // Network or HTTP error
        setErrorMessage("We couldn't submit your booking. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isPlaceholderUrl = WEBHOOK_BOOK.includes('<') || WEBHOOK_BOOK.includes('base-url') || WEBHOOK_BOOK.includes('railway-url');

  const handleTestBookingMock = () => {
    // Generate a demo booking id if the user wants to test Screen 5 directly with demo status
    const demoBookingId = `DEMO-BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const sanitizedBookingDetails: BookingDetails = {
      name: formValues.name.trim() || 'Jane Doe',
      email: formValues.email.trim() || 'jane.doe@example.com',
      phone: formValues.phone.trim() || '+1 (555) 234-5678',
      date: formValues.date.trim(),
      time: formValues.time.trim(),
    };
    if (category === 'restaurant') sanitizedBookingDetails.partySize = formValues.partySize || '2';
    if (category === 'gym') sanitizedBookingDetails.sessionType = formValues.sessionType || 'Strength & Conditioning';
    if (category === 'salon' || category === 'parlour') sanitizedBookingDetails.serviceType = formValues.serviceType || 'Signature Cut & Styling';
    if (category === 'travel agency') {
      sanitizedBookingDetails.destination = formValues.destination || 'Kyoto, Japan';
      sanitizedBookingDetails.travelDates = formValues.travelDates || '7-day Explorer';
    }
    onBookingSuccess(demoBookingId, sanitizedBookingDetails);
  };

  return (
    <div id="screen-4-container" className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          id="back-to-screen-3-btn"
          onClick={onBackToResults}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Places
        </button>

        <span className="text-xs font-semibold text-slate-500">
          Booking with <strong className="text-slate-900">{selectedPlace.name}</strong>
        </span>
      </div>

      {/* Selected Venue Snapshot Card */}
      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-2xl shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-400">
            Selected Venue
          </span>
          {selectedPlace.tag && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
              {selectedPlace.tag}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-serif text-white">{selectedPlace.name}</h2>
            {selectedPlace.openingHours && (
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-sans font-semibold text-slate-400">Hours:</span>
                <span>{selectedPlace.openingHours}</span>
              </p>
            )}
          </div>
          {selectedPlace.lat !== undefined && selectedPlace.lon !== undefined && selectedPlace.lat !== '' && selectedPlace.lon !== '' && (
            <a
              href={`https://www.google.com/maps?q=${selectedPlace.lat},${selectedPlace.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline w-fit font-medium"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>View on map</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Dismissible Error Banner */}
      {errorMessage && (
        <div className="space-y-2">
          <DismissibleBanner
            id="screen-4-error-banner"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
            onRetry={() => handleSubmit()}
          />
          {isPlaceholderUrl && (
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Testing preview before connecting live service?</span>
              <button
                type="button"
                onClick={handleTestBookingMock}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              >
                Proceed with Demo Booking
              </button>
            </div>
          )}
        </div>
      )}

      {/* Booking Form Card */}
      <form onSubmit={handleSubmit} id="booking-details-form" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
            Guest & Reservation Details
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide your contact details and preferences so the venue can confirm your reservation.
          </p>
        </div>

        {/* General Fields: Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="booking-name-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="booking-name-input"
                type="text"
                value={formValues.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="e.g. Alex Morgan"
                disabled={isLoading}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                  fieldErrors.name
                    ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <p id="error-name" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="booking-email-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="booking-email-input"
                type="email"
                value={formValues.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="e.g. alex.morgan@example.com"
                disabled={isLoading}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                  fieldErrors.email
                    ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p id="error-email" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                {fieldErrors.email}
              </p>
            )}
          </div>
        </div>

        {/* Contact Phone & Schedule */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="booking-phone-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="booking-phone-input"
                type="tel"
                value={formValues.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+1 (555) 019-2834"
                disabled={isLoading}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                  fieldErrors.phone
                    ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                    : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                }`}
              />
            </div>
            {fieldErrors.phone && (
              <p id="error-phone" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="booking-date-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="booking-date-input"
                type="date"
                value={formValues.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                disabled={isLoading}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                  fieldErrors.date
                    ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                    : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                }`}
              />
            </div>
            {fieldErrors.date && (
              <p id="error-date" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                {fieldErrors.date}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="booking-time-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Time <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <input
                id="booking-time-input"
                type="time"
                value={formValues.time}
                onChange={(e) => handleFieldChange('time', e.target.value)}
                disabled={isLoading}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                  fieldErrors.time
                    ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                    : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                }`}
              />
            </div>
            {fieldErrors.time && (
              <p id="error-time" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                {fieldErrors.time}
              </p>
            )}
          </div>
        </div>

        {/* Category-Specific Fields */}
        <div className="pt-2 border-t border-slate-100 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
            {categoryInfo.shortLabel} Specific Details
          </p>

          {/* Restaurant: Party Size */}
          {category === 'restaurant' && (
            <div>
              <label htmlFor="booking-partysize-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Party Size (Number of Guests) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Users className="w-4 h-4" />
                </div>
                <select
                  id="booking-partysize-input"
                  value={formValues.partySize}
                  onChange={(e) => handleFieldChange('partySize', e.target.value)}
                  disabled={isLoading}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                    fieldErrors.partySize
                      ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                  }`}
                >
                  <option value="1">1 person (Solo table)</option>
                  <option value="2">2 guests</option>
                  <option value="3">3 guests</option>
                  <option value="4">4 guests</option>
                  <option value="5">5 guests</option>
                  <option value="6">6 guests (Large table)</option>
                  <option value="8+">8+ guests (Private party)</option>
                </select>
              </div>
              {fieldErrors.partySize && (
                <p id="error-partySize" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                  {fieldErrors.partySize}
                </p>
              )}
            </div>
          )}

          {/* Gym: Session Type / Class */}
          {category === 'gym' && (
            <div>
              <label htmlFor="booking-sessiontype-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Session Type / Class <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Activity className="w-4 h-4" />
                </div>
                <input
                  id="booking-sessiontype-input"
                  type="text"
                  value={formValues.sessionType}
                  onChange={(e) => handleFieldChange('sessionType', e.target.value)}
                  placeholder="e.g. Reformer Pilates, 1-on-1 PT, HIIT Blast"
                  disabled={isLoading}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                    fieldErrors.sessionType
                      ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                  }`}
                />
              </div>
              {fieldErrors.sessionType && (
                <p id="error-sessionType" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                  {fieldErrors.sessionType}
                </p>
              )}
            </div>
          )}

          {/* Salon / Parlour: Service Type */}
          {(category === 'salon' || category === 'parlour') && (
            <div>
              <label htmlFor="booking-servicetype-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Service Type <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <input
                  id="booking-servicetype-input"
                  type="text"
                  value={formValues.serviceType}
                  onChange={(e) => handleFieldChange('serviceType', e.target.value)}
                  placeholder={
                    category === 'salon'
                      ? 'e.g. Haircut & Balayage Color, Blowout'
                      : 'e.g. 90-min Deep Tissue Massage, HydraFacial'
                  }
                  disabled={isLoading}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                    fieldErrors.serviceType
                      ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                      : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                  }`}
                />
              </div>
              {fieldErrors.serviceType && (
                <p id="error-serviceType" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                  {fieldErrors.serviceType}
                </p>
              )}
            </div>
          )}

          {/* Travel Agency: Destination & Travel Dates */}
          {category === 'travel agency' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-destination-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Destination <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Plane className="w-4 h-4" />
                  </div>
                  <input
                    id="booking-destination-input"
                    type="text"
                    value={formValues.destination}
                    onChange={(e) => handleFieldChange('destination', e.target.value)}
                    placeholder="e.g. Amalfi Coast, Italy"
                    disabled={isLoading}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                      fieldErrors.destination
                        ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                        : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                    }`}
                  />
                </div>
                {fieldErrors.destination && (
                  <p id="error-destination" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                    {fieldErrors.destination}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="booking-traveldates-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Trip Duration / Dates <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    id="booking-traveldates-input"
                    type="text"
                    value={formValues.travelDates}
                    onChange={(e) => handleFieldChange('travelDates', e.target.value)}
                    placeholder="e.g. Oct 12 - Oct 20 (8 days)"
                    disabled={isLoading}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden ${
                      fieldErrors.travelDates
                        ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/20 text-slate-900'
                        : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600'
                    }`}
                  />
                </div>
                {fieldErrors.travelDates && (
                  <p id="error-travelDates" className="text-xs text-rose-600 font-medium mt-1 animate-fadeIn">
                    {fieldErrors.travelDates}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100">
          <button
            id="submit-booking-btn"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Transmitting reservation request...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-indigo-200" />
                <span>Send Booking Request to {selectedPlace.name}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
