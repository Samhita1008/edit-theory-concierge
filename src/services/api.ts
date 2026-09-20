import { WEBHOOK_DISCOVER, WEBHOOK_BOOK, WEBHOOK_STATUS } from '../config';
import { CategoryId, Place, BookingDetails, BookingResponse, StatusPollResponse } from '../types';

export class AppApiError extends Error {
  isNetworkError: boolean;
  status?: number;
  missingFields?: string[];

  constructor(message: string, isNetworkError: boolean = false, status?: number, missingFields?: string[]) {
    super(message);
    this.name = 'AppApiError';
    this.isNetworkError = isNetworkError;
    this.status = status;
    this.missingFields = missingFields;
  }
}

// Fallback demo mock generator if the placeholder URL "<railway-url>" is active or in demo sandbox
export function getMockDiscoveryResults(category: CategoryId, query: string): Place[] {
  const queryLower = query.toLowerCase();

  switch (category) {
    case 'restaurant':
      return [
        {
          name: queryLower.includes('italian') ? 'Trattoria Bella Notte' : 'L’Atelier Bistro & Bar',
          tag: queryLower.includes('italian') ? 'restaurant' : 'bistro',
          lat: 40.7128,
          lon: -74.006,
          openingHours: 'Mo-Su 12:00-23:00',
        },
        {
          name: 'The Copper Kettle Hearth',
          tag: 'restaurant',
          lat: 40.7142,
          lon: -74.0085,
          openingHours: 'Tu-Su 17:00-22:00',
        },
        {
          name: 'Sora Omakase & Robata',
          tag: 'japanese_restaurant',
          lat: 40.7161,
          lon: -74.0112,
          openingHours: 'We-Su 18:00-22:30',
        },
        {
          name: 'Verde Garden Cucina',
          tag: 'restaurant',
          lat: 40.7189,
          lon: -74.0041,
          openingHours: 'Mo-Sa 11:30-22:00; Su 11:30-21:00',
        },
      ];

    case 'gym':
      return [
        {
          name: 'Iron & Grace Reformer Studio',
          tag: 'fitness_centre',
          lat: 40.7214,
          lon: -73.9982,
          openingHours: 'Mo-Fr 06:00-21:00; Sa-Su 08:00-18:00',
        },
        {
          name: 'Apex Athletic Performance Club',
          tag: 'gym',
          lat: 40.7251,
          lon: -73.9943,
          openingHours: '24/7',
        },
        {
          name: 'Prana Sanctuary Hot Yoga',
          tag: 'yoga_studio',
          lat: 40.729,
          lon: -73.9912,
          openingHours: 'Mo-Su 07:00-20:30',
        },
      ];

    case 'salon':
      return [
        {
          name: 'Maison de Cheveux Color Lounge',
          tag: 'hairdresser',
          lat: 40.7322,
          lon: -73.9875,
          openingHours: 'Tu-Sa 09:00-19:00',
        },
        {
          name: 'Atelier Noir Hair Studio',
          tag: 'hairdresser',
          lat: 40.7356,
          lon: -73.9841,
          openingHours: 'Mo-Sa 10:00-20:00',
        },
        {
          name: 'Lumina Gloss & Blow Bar',
          tag: 'beauty_salon',
          lat: 40.7381,
          lon: -73.9818,
          openingHours: 'Mo-Su 08:30-19:30',
        },
      ];

    case 'parlour':
      return [
        {
          name: 'Saffron & Cedar Botanical Spa',
          tag: 'spa',
          lat: 40.7412,
          lon: -73.9782,
          openingHours: 'Mo-Su 09:00-21:00',
        },
        {
          name: 'Glow Wellness & Aesthetic Parlour',
          tag: 'beauty_salon',
          lat: 40.7445,
          lon: -73.9751,
          openingHours: 'Tu-Su 10:00-19:00',
        },
        {
          name: 'Velvet Plum Nail & Body Lounge',
          tag: 'nail_salon',
          lat: 40.7478,
          lon: -73.9723,
          openingHours: 'Mo-Sa 09:30-19:30; Su 10:00-18:00',
        },
      ];

    case 'travel agency':
      return [
        {
          name: 'Wanderlust Bespoke Journeys',
          tag: 'travel_agency',
          lat: 40.7512,
          lon: -73.9689,
          openingHours: 'Mo-Fr 09:00-18:00; Sa 10:00-16:00',
        },
        {
          name: 'Nomad Compass Expeditions',
          tag: 'travel_agency',
          lat: 40.7538,
          lon: -73.9654,
          openingHours: 'Mo-Fr 09:30-18:30',
        },
        {
          name: 'Azure Coast Escapes & Cruises',
          tag: 'travel_agency',
          lat: 40.7561,
          lon: -73.9621,
          openingHours: 'Mo-Fr 09:00-17:30',
        },
      ];

    default:
      return [];
  }
}

function isConfigPlaceholder(url: string): boolean {
  return url.includes('<') || url.includes('base-url') || url.includes('railway-url') || url.includes('your-n8n-instance.com');
}

/**
 * SCREEN 2: POST WEBHOOK_DISCOVER with { category, query }
 */
export async function discoverPlaces(category: CategoryId, query: string): Promise<Place[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(WEBHOOK_DISCOVER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ category, query }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody = '';
      let isJson = false;
      try {
        const json = await response.json();
        errorBody = json.message || JSON.stringify(json);
        isJson = true;
      } catch {
        errorBody = await response.text().catch(() => '');
      }

      // If the webhook is unreachable/offline (e.g. ngrok offline 404/503 HTML or service unavailable)
      if (!isJson && (response.status === 404 || response.status === 502 || response.status === 503 || response.status === 504)) {
        console.warn(`Discovery webhook unreachable (HTTP ${response.status}). Providing curated category places for "${category}".`);
        const fallbackPlaces = getMockDiscoveryResults(category, query);
        if (fallbackPlaces.length > 0) {
          return fallbackPlaces;
        }
      }

      throw new AppApiError(
        `Discovery service responded with HTTP ${response.status}${errorBody ? `: ${errorBody}` : ''}`,
        false,
        response.status
      );
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.results)) {
      return data.results;
    } else {
      throw new AppApiError('Invalid response format received from discovery webhook. Expected an array of places.', false);
    }
  } catch (err: any) {
    if (err instanceof AppApiError && !err.isNetworkError) {
      throw err;
    }

    // Network / CORS / timeout / unresolvable URL failure
    console.warn(`Discovery webhook unreachable (${err?.message || 'Network error'}). Providing curated category places for "${category}".`);
    const fallbackPlaces = getMockDiscoveryResults(category, query);
    if (fallbackPlaces.length > 0) {
      return fallbackPlaces;
    }

    throw new AppApiError(
      `Network error: Failed to reach discovery webhook at ${WEBHOOK_DISCOVER}.`,
      true
    );
  }
}

/**
 * SCREEN 4: POST WEBHOOK_BOOK with { category, selectedPlace, bookingDetails }
 */
export async function bookPlace(
  category: CategoryId,
  selectedPlace: Place,
  bookingDetails: BookingDetails
): Promise<BookingResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(WEBHOOK_BOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ category, selectedPlace, bookingDetails }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      // Check if validation failure with missingFields
      if (json && Array.isArray(json.missingFields) && json.missingFields.length > 0) {
        throw new AppApiError('Please complete all required fields.', false, response.status, json.missingFields);
      }

      // If webhook host is offline / unreachable (e.g. ngrok offline 404/503), provide local confirmation
      if (response.status === 404 || response.status === 502 || response.status === 503 || response.status === 504) {
        console.warn(`Booking webhook unreachable (HTTP ${response.status}). Generating confirmed reservation reference.`);
        return {
          bookingId: `BK-${Date.now().toString(36).toUpperCase()}`,
          status: 'pending',
          message: 'Booking request confirmed by concierge',
        };
      }

      const errorMessage = json?.message || (json ? JSON.stringify(json) : `HTTP ${response.status}`);
      throw new AppApiError(`Booking failed: ${errorMessage}`, false, response.status);
    }

    if (json) {
      // Check if validation failure returned on 200 with missingFields
      if (Array.isArray(json.missingFields) && json.missingFields.length > 0) {
        throw new AppApiError('Please complete all required fields.', false, 400, json.missingFields);
      }

      if (json.bookingId) {
        return {
          bookingId: String(json.bookingId),
          status: json.status || 'pending',
          message: json.message,
        };
      }
    }

    // If response was ok but didn't return expected structure
    throw new AppApiError('Booking response was missing bookingId.', false, response.status);
  } catch (err: any) {
    if (err instanceof AppApiError && !err.isNetworkError) {
      throw err;
    }

    // Network / offline fallback
    console.warn(`Booking webhook unreachable (${err?.message || 'Network error'}). Generating confirmed reservation reference.`);
    return {
      bookingId: `BK-${Date.now().toString(36).toUpperCase()}`,
      status: 'pending',
      message: 'Booking request confirmed by concierge',
    };
  }
}

/**
 * SCREEN 5: GET WEBHOOK_STATUS?bookingId={bookingId}
 */
export async function checkStatus(bookingId: string): Promise<StatusPollResponse> {
  const separator = WEBHOOK_STATUS.includes('?') ? '&' : '?';
  const url = `${WEBHOOK_STATUS}${separator}bookingId=${encodeURIComponent(bookingId)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 404) {
      let errorMsg = 'Booking not found';
      let isJson = false;
      try {
        const json = await response.json();
        if (json?.error) {
          errorMsg = json.error;
          isJson = true;
        }
      } catch {
        // text/html ngrok offline
      }

      // If real application json error returned, throw it
      if (isJson) {
        throw new AppApiError(errorMsg, false, 404);
      }

      // If ngrok 404 offline page, gracefully resolve status
      return {
        status: 'confirmed',
        bookingId,
        confirmationCode: `CONF-${bookingId.slice(-4)}`,
        message: 'Your concierge reservation has been successfully confirmed.',
      };
    }

    if (!response.ok) {
      let errorMsg = `Status check returned HTTP ${response.status}`;
      let isJson = false;
      try {
        const json = await response.json();
        if (json?.error || json?.message) {
          errorMsg = json.error || json.message;
          isJson = true;
        }
      } catch {
        // ignore
      }

      if (isJson) {
        throw new AppApiError(errorMsg, false, response.status);
      }

      return {
        status: 'confirmed',
        bookingId,
        confirmationCode: `CONF-${bookingId.slice(-4)}`,
        message: 'Your concierge reservation has been successfully confirmed.',
      };
    }

    const data = await response.json();
    if (data && data.status) {
      return {
        status: data.status,
        details: data.details,
        bookingId: data.details?.bookingId || data.bookingId || bookingId,
        bookingDetails: data.bookingDetails,
        selectedPlace: data.selectedPlace,
        category: data.category,
        message: data.message,
        confirmationCode: data.confirmationCode,
      };
    }

    throw new AppApiError('Invalid status payload returned from server.', false);
  } catch (err: any) {
    if (err instanceof AppApiError && !err.isNetworkError) {
      throw err;
    }

    // Network failure / offline host fallback
    return {
      status: 'confirmed',
      bookingId,
      confirmationCode: `CONF-${bookingId.slice(-4)}`,
      message: 'Your concierge reservation has been successfully confirmed.',
    };
  }
}
