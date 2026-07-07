import { create } from 'zustand';
import { apiFetch, Paginated } from '../services/api';

export type VenueCategory = 'Kafe' | 'Restoran' | 'Bar' | 'Pub' | 'Tatlıcı' | string;

type BackendVenue = {
  id: string;
  name: string;
  category: { name: string };
  google_rating: number | null;
  address?: string;
  city: string;
  district: string;
  phone?: string;
  website?: string;
  opening_hours?: Record<string, unknown>;
  image_url: string;
  is_sponsored: boolean;
  sponsor_discount: string;
  sponsor_perks?: string[];
  safety_score: number;
  safety_criteria?: Record<string, boolean>;
};

export type Venue = {
  id: string;
  name: string;
  category: VenueCategory;
  rating: number;
  address: string;
  phone: string;
  website: string;
  openingHours: string;
  distanceKm: number;
  image: string;
  sponsored: boolean;
  discount?: string;
  perks?: string[];
  safetyScore: number;
  safetyFeatures: string[];
};

type VenueState = {
  venues: Venue[];
  categories: VenueCategory[];
  safeDateSpots: Venue[];
  fetchVenues: (params?: { lat?: number; lng?: number; radiusKm?: number }) => Promise<Venue[]>;
  fetchSafeDateSpots: (params?: { lat?: number; lng?: number; radiusKm?: number }) => Promise<Venue[]>;
  fetchVenueDetail: (venueId: string) => Promise<Venue | undefined>;
};

function query(params?: { lat?: number; lng?: number; radiusKm?: number }) {
  if (!params?.lat || !params?.lng || !params?.radiusKm) return '';
  return `?lat=${params.lat}&lng=${params.lng}&radius_km=${params.radiusKm}`;
}

function mapVenue(venue: BackendVenue): Venue {
  const safetyFeatures = venue.safety_criteria
    ? Object.entries(venue.safety_criteria)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([key]) => key)
    : [];
  return {
    id: venue.id,
    name: venue.name,
    category: venue.category?.name ?? 'Mekan',
    rating: venue.google_rating ?? 0,
    address: venue.address ?? `${venue.district}, ${venue.city}`,
    phone: venue.phone ?? '',
    website: venue.website ?? '',
    openingHours: venue.opening_hours ? JSON.stringify(venue.opening_hours) : '',
    distanceKm: 0,
    image: venue.image_url || venue.name,
    sponsored: venue.is_sponsored,
    discount: venue.sponsor_discount || undefined,
    perks: venue.sponsor_perks ?? [],
    safetyScore: venue.safety_score,
    safetyFeatures,
  };
}

export const useVenueStore = create<VenueState>((set, get) => ({
  venues: [],
  categories: ['Kafe', 'Restoran', 'Bar', 'Pub', 'Tatlıcı'],
  safeDateSpots: [],
  fetchVenues: async (params) => {
    const response = await apiFetch<Paginated<BackendVenue>>(`/venues/${query(params)}`);
    const venues = response.results.map(mapVenue);
    set({ venues });
    return venues;
  },
  fetchSafeDateSpots: async (params) => {
    const response = await apiFetch<Paginated<BackendVenue>>(`/venues/safe-date-spots/${query(params)}`);
    const safeDateSpots = response.results.map(mapVenue);
    set({ safeDateSpots });
    return safeDateSpots;
  },
  fetchVenueDetail: async (venueId) => {
    const cached = get().venues.find((venue) => venue.id === venueId) ?? get().safeDateSpots.find((venue) => venue.id === venueId);
    if (cached) return cached;
    const venue = await apiFetch<BackendVenue>(`/venues/${venueId}/`);
    return mapVenue(venue);
  },
}));
