import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  FileText,
  Building2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { CategoryId, Place, BookingDetails, StatusType, StatusPollResponse } from '../types';
import { checkStatus } from '../services/api';
import { WEBHOOK_STATUS } from '../config';

interface Screen5StatusProps {
  bookingId: string;
  category: CategoryId;
  selectedPlace: Place;
  bookingDetails: BookingDetails;
  onPickDifferentPlace: () => void;
  onBookSomethingElse: () => void;
}

export const Screen5Status: React.FC<Screen5StatusProps> = ({
  bookingId,
  category,
  selectedPlace,
  bookingDetails,
  onPickDifferentPlace,
  onBookSomethingElse,
}) => {
  const [status, setStatus] = useState<StatusType>('pending');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(0);
  const [pollError, setPollError] = useState<string | null>(null);
  const [statusPayload, setStatusPayload] = useState<StatusPollResponse | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveFailuresRef = useRef<number>(0);

  const isPlaceholderUrl = WEBHOOK_STATUS.includes('<') || WEBHOOK_STATUS.includes('base-url') || WEBHOOK_STATUS.includes('railway-url');

  // Poll status endpoint
  const executePoll = useCallback(async () => {
    try {
      const data = await checkStatus(bookingId);
      // Reset failure counter on successful request
      consecutiveFailuresRef.current = 0;
      setConsecutiveFailures(0);
      setPollError(null);

      if (data && data.status) {
        setStatusPayload(data);

        if (data.status === 'confirmed' || data.status === 'declined') {
          setStatus(data.status);
          setIsPollingActive(false);
        }
      }
    } catch (err: any) {
      console.error('Status polling failure:', err);
      consecutiveFailuresRef.current += 1;
      setConsecutiveFailures(consecutiveFailuresRef.current);

      // Only show error UI if 3 consecutive failures occur
      // Never render raw error text, URLs, or HTTP status codes in UI
      if (consecutiveFailuresRef.current >= 3) {
        setPollError("We're having trouble getting an update. Please check back shortly.");
        setIsPollingActive(false);
      }
    }
  }, [bookingId]);

  // Elapsed timer & 90s timeout check
  useEffect(() => {
    if (!isPollingActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= 90) {
          // Timeout reached
          setStatus('timeout');
          setIsPollingActive(false);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPollingActive]);

  // Polling every 5 seconds while active and pending
  useEffect(() => {
    if (!isPollingActive || status !== 'pending') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    // Initial immediate poll on mount/resume
    executePoll();

    pollIntervalRef.current = setInterval(() => {
      executePoll();
    }, 5000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isPollingActive, status, executePoll]);

  // Resume polling from timeout or error
  const handleCheckAgain = () => {
    setElapsedSeconds(0);
    consecutiveFailuresRef.current = 0;
    setConsecutiveFailures(0);
    setPollError(null);
    setStatus('pending');
    setIsPollingActive(true);
  };

  // Demo simulation controls for portfolio testing
  const handleSimulateStatus = (mockStatus: 'confirmed' | 'declined') => {
    setStatus(mockStatus);
    setIsPollingActive(false);
    setStatusPayload({
      status: mockStatus,
      bookingId,
      confirmationCode: mockStatus === 'confirmed' ? `CONF-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      message: mockStatus === 'confirmed' ? 'Your reservation is confirmed!' : 'The venue is currently fully booked for this time slot.',
    });
  };

  return (
    <div id="screen-5-container" className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Booking Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* PENDING STATE */}
        {status === 'pending' && !pollError && (
          <div id="status-pending-view" className="text-center py-6 space-y-5">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
                Waiting for {selectedPlace.name} to respond...
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your reservation request has been dispatched. We are actively polling the venue system for confirmation.
              </p>
            </div>

            {/* Polling telemetry indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Polling every 5s • {elapsedSeconds}s / 90s</span>
            </div>

            {/* Demo simulation shortcut if placeholder URL is active */}
            {isPlaceholderUrl && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">Quick Test Simulation Controls:</p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateStatus('confirmed')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                  >
                    Simulate Venue "Confirmed"
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateStatus('declined')}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                  >
                    Simulate Venue "Declined"
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONFIRMED STATE */}
        {status === 'confirmed' && (
          <div id="status-confirmed-view" className="space-y-6 py-2">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">
                  Confirmed & Ready
                </span>
                <h1 className="text-xl font-bold font-serif text-emerald-950">
                  Reservation Confirmed!
                </h1>
                <p className="text-xs text-emerald-800">
                  {selectedPlace.name} has accepted your request.
                </p>
              </div>
            </div>

            {/* Summary Details Card */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-900 text-sm">
                    {statusPayload?.details?.placeName || selectedPlace.name}
                  </span>
                </div>
                <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">
                  {statusPayload?.details?.bookingId || statusPayload?.confirmationCode || `REF-${bookingId.slice(0, 8).toUpperCase()}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Guest Name</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {statusPayload?.details?.name || bookingDetails.name}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Email Address</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{statusPayload?.details?.email || bookingDetails.email || '—'}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Contact Phone</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {bookingDetails.phone}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">Date & Time</span>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {statusPayload?.details?.date || bookingDetails.date} at {statusPayload?.details?.time || bookingDetails.time}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-medium">
                    {selectedPlace.lat !== undefined && selectedPlace.lon !== undefined
                      ? 'Location'
                      : selectedPlace.openingHours
                      ? 'Opening Hours'
                      : 'Venue'}
                  </span>
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                    {selectedPlace.lat !== undefined && selectedPlace.lon !== undefined ? (
                      <a
                        href={`https://www.google.com/maps?q=${selectedPlace.lat},${selectedPlace.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>View on map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : selectedPlace.openingHours ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-xs">{selectedPlace.openingHours}</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{selectedPlace.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category specific details */}
              <div className="pt-3 border-t border-slate-200/80 text-xs flex flex-wrap gap-3">
                {category === 'restaurant' && bookingDetails.partySize && (
                  <div>
                    <span className="text-slate-500">Party Size: </span>
                    <strong className="text-slate-900">{bookingDetails.partySize} guests</strong>
                  </div>
                )}
                {category === 'gym' && bookingDetails.sessionType && (
                  <div>
                    <span className="text-slate-500">Session: </span>
                    <strong className="text-slate-900">{bookingDetails.sessionType}</strong>
                  </div>
                )}
                {(category === 'salon' || category === 'parlour') && bookingDetails.serviceType && (
                  <div>
                    <span className="text-slate-500">Service: </span>
                    <strong className="text-slate-900">{bookingDetails.serviceType}</strong>
                  </div>
                )}
                {category === 'travel agency' && bookingDetails.destination && (
                  <div>
                    <span className="text-slate-500">Trip: </span>
                    <strong className="text-slate-900">{bookingDetails.destination} ({bookingDetails.travelDates})</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DECLINED STATE */}
        {status === 'declined' && (
          <div id="status-declined-view" className="space-y-6 py-2">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <XCircle className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] uppercase tracking-wider font-bold text-rose-700">
                  Venue Unavailable
                </span>
                <h1 className="text-xl font-bold font-serif text-rose-950">
                  Reservation Declined
                </h1>
                <p className="text-xs text-rose-800">
                  {selectedPlace.name} is fully committed for the requested time slot.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed">
                Don't worry! You can instantly return to your search results to select another available venue without re-entering your search query or details.
              </p>
              <button
                type="button"
                id="pick-different-place-btn"
                onClick={onPickDifferentPlace}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pick a Different Place (Keep Search Results)</span>
              </button>
            </div>
          </div>
        )}

        {/* TIMEOUT STATE */}
        {status === 'timeout' && (
          <div id="status-timeout-view" className="space-y-5 text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Clock className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h1 className="text-xl font-serif font-bold text-slate-900">
                Still waiting — check back later
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                The venue has not responded within the initial 90-second window. The booking request is still active in their queue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                type="button"
                id="timeout-check-again-btn"
                onClick={handleCheckAgain}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Check Again
              </button>
            </div>
          </div>
        )}

        {/* NETWORK ERROR STATE (3+ failures) */}
        {pollError && (
          <div id="status-error-view" className="space-y-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-rose-900 leading-relaxed">
                  We're having trouble getting an update. Please check back shortly.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                id="status-check-again-btn"
                onClick={handleCheckAgain}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Check again
              </button>
            </div>
          </div>
        )}

        {/* Global Reset Action */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            id="book-something-else-btn"
            onClick={onBookSomethingElse}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Book Something Else (Start Over)
          </button>

          <span className="text-[11px] text-slate-400 font-mono">
            Booking ID: {bookingId}
          </span>
        </div>
      </div>

      {/* Small, unobtrusive portfolio disclaimer */}
      <div className="text-center">
        <p className="text-[11px] text-slate-400 italic">
          Demo mode — venue contact is simulated for this portfolio project.
        </p>
      </div>
    </div>
  );
};
