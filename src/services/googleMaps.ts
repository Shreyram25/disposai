/**
 * Google Maps API Service
 * Handles location-based pharmacy searches using Google Maps Places API
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️ VITE_GOOGLE_MAPS_API_KEY not found in environment variables. Google Maps features will not work.');
}

export interface PharmacyLocation {
  id: number;
  name: string;
  address: string;
  distance: string;
  acceptsAll: boolean;
  hours: string;
  placeId?: string;
  rating?: number;
  phoneNumber?: string;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearby pharmacies using Google Maps Places API
 */
export async function findNearbyPharmaciesWithGoogleMaps(
  latitude: number,
  longitude: number,
  radius: number = 5000 // 5km default radius
): Promise<PharmacyLocation[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    // Search for pharmacies near the location
    const searchUrl = `${GOOGLE_PLACES_API_URL}/nearbysearch/json?` +
      `location=${latitude},${longitude}` +
      `&radius=${radius}` +
      `&type=pharmacy` +
      `&keyword=pharmacy` +
      `&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    if (data.results && data.results.length > 0) {
      // Get detailed information for each place
      const pharmacies: PharmacyLocation[] = await Promise.all(
        data.results.slice(0, 5).map(async (place: any, index: number) => {
          const distance = calculateDistance(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          );

          // Get place details for hours and phone
          let hours = 'Check with pharmacy';
          let phoneNumber: string | undefined;

          try {
            const detailsUrl = `${GOOGLE_PLACES_API_URL}/details/json?` +
              `place_id=${place.place_id}` +
              `&fields=opening_hours,formatted_phone_number` +
              `&key=${GOOGLE_MAPS_API_KEY}`;

            const detailsResponse = await fetch(detailsUrl);
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              if (detailsData.result) {
                if (detailsData.result.opening_hours?.weekday_text) {
                  // Format hours (show today's hours if available)
                  const today = new Date().getDay();
                  const weekdayText = detailsData.result.opening_hours.weekday_text;
                  if (weekdayText[today]) {
                    hours = weekdayText[today].replace(/^[^:]+:\s*/, '');
                  }
                }
                phoneNumber = detailsData.result.formatted_phone_number;
              }
            }
          } catch (err) {
            console.warn('Failed to get place details:', err);
          }

          return {
            id: index + 1,
            name: place.name,
            address: place.vicinity || place.formatted_address || 'Address not available',
            distance: `${distance.toFixed(1)} km`,
            acceptsAll: true, // Assume all pharmacies accept medications
            hours,
            placeId: place.place_id,
            rating: place.rating,
            phoneNumber,
          };
        })
      );

      return pharmacies.sort((a, b) => {
        // Sort by distance
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        return distA - distB;
      });
    }

    return [];
  } catch (error) {
    console.error('Google Maps API error:', error);
    throw error;
  }
}

/**
 * Search pharmacies by text query (city/area name)
 */
export async function searchPharmaciesByText(
  query: string,
  city: string = 'Dubai'
): Promise<PharmacyLocation[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const searchQuery = `pharmacy medication disposal ${city} ${query}`;
    const searchUrl = `${GOOGLE_PLACES_API_URL}/textsearch/json?` +
      `query=${encodeURIComponent(searchQuery)}` +
      `&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    if (data.results && data.results.length > 0) {
      return data.results.slice(0, 5).map((place: any, index: number) => ({
        id: index + 1,
        name: place.name,
        address: place.formatted_address || 'Address not available',
        distance: 'N/A', // Can't calculate without user location
        acceptsAll: true,
        hours: 'Check with pharmacy',
        placeId: place.place_id,
        rating: place.rating,
      }));
    }

    return [];
  } catch (error) {
    console.error('Google Maps text search error:', error);
    throw error;
  }
}

