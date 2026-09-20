import { CategoryInfo, CategoryId } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'restaurant',
    label: 'Restaurants & Dining',
    shortLabel: 'Restaurant',
    tagline: 'Table reservations, fine dining, bistros & cafes',
    description: 'Find top-rated local dining, romantic spots, brunch spots, and chef tastings.',
    exampleQueries: ['Italian bistro with outdoor seating', 'Omakase sushi bar', 'Cozy cocktail lounge', 'Farm-to-table dinner for 4'],
    iconName: 'UtensilsCrossed',
    color: 'emerald',
  },
  {
    id: 'gym',
    label: 'Gyms & Fitness Studios',
    shortLabel: 'Gym',
    tagline: 'Personal training, HIIT, yoga, pilates & wellness',
    description: 'Book day passes, specialty boutique classes, personal training, and wellness clubs.',
    exampleQueries: ['Reformer pilates beginner class', 'High-intensity interval training studio', 'Olympic lifting gym with day pass', 'Hot vinyasa yoga'],
    iconName: 'Dumbbell',
    color: 'indigo',
  },
  {
    id: 'salon',
    label: 'Hair & Beauty Salons',
    shortLabel: 'Salon',
    tagline: 'Cuts, custom coloring, balayage, blowouts & styling',
    description: 'Connect with master stylists, color artists, and premium hair studios.',
    exampleQueries: ['Balayage specialist salon', 'Keratin smoothing treatment', 'Precision haircut & blowdry', 'Bridal hair consultation'],
    iconName: 'Scissors',
    color: 'rose',
  },
  {
    id: 'parlour',
    label: 'Parlours & Day Spas',
    shortLabel: 'Parlour',
    tagline: 'Massages, facials, skin rejuvenation & nail lounges',
    description: 'Pamper yourself with holistic body treatments, deep tissue massage, and aesthetics.',
    exampleQueries: ['Deep tissue 90min massage spa', 'Hydrafacial and skin detox', 'Organic manicure & pedicure parlour', 'Aromatherapy sauna package'],
    iconName: 'Sparkles',
    color: 'amber',
  },
  {
    id: 'travel agency',
    label: 'Travel Agencies & Tours',
    shortLabel: 'Travel Agency',
    tagline: 'Custom vacation itineraries, weekend getaways & flights',
    description: 'Consult certified travel concierges for tailored holidays, luxury cruises, and trips.',
    exampleQueries: ['Weekend getaway to Napa Valley', 'Custom 10-day Japan itinerary', 'All-inclusive Amalfi coast resort', 'Alps ski holiday planning'],
    iconName: 'Plane',
    color: 'sky',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryInfo> = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {} as Record<CategoryId, CategoryInfo>);
