export type CategoryId = 'restaurant' | 'gym' | 'salon' | 'parlour' | 'travel agency';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  shortLabel: string;
  tagline: string;
  description: string;
  exampleQueries: string[];
  iconName: 'UtensilsCrossed' | 'Dumbbell' | 'Scissors' | 'Sparkles' | 'Plane';
  color: string;
}

export interface Place {
  name: string;
  tag?: string;
  lat?: number | string;
  lon?: number | string;
  openingHours?: string;
}

export interface BookingDetails {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  // Category specific fields:
  partySize?: string;
  sessionType?: string;
  serviceType?: string;
  destination?: string;
  travelDates?: string;
}

export type StatusType = 'pending' | 'confirmed' | 'declined' | 'timeout';

export interface BookingResponse {
  bookingId: string;
  status: StatusType;
  message?: string;
  missingFields?: string[];
}

export interface StatusDetails {
  bookingId?: string;
  category?: string;
  placeName?: string;
  name?: string;
  email?: string;
  date?: string;
  time?: string;
}

export interface StatusPollResponse {
  status: StatusType;
  details?: StatusDetails;
  bookingId?: string;
  bookingDetails?: BookingDetails;
  selectedPlace?: Place;
  category?: CategoryId;
  message?: string;
  confirmationCode?: string;
}
