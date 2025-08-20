import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Venue, type VenueSearchRequest, type Location, type VenueType } from "@shared/schema";

export function useVenues(location: Location, venueTypes: VenueType[]) {
  return useQuery({
    queryKey: ['/api/venues/search', location.lat, location.lng, venueTypes.sort().join(',')],
    queryFn: async () => {
      // Calculate bounds around the location (approximately 5km radius)
      const latDelta = 0.045; // roughly 5km
      const lngDelta = 0.045;
      
      const bounds = {
        north: location.lat + latDelta,
        south: location.lat - latDelta,
        east: location.lng + lngDelta,
        west: location.lng - lngDelta
      };

      const requestData: VenueSearchRequest = {
        bounds,
        venueTypes
      };

      const response = await apiRequest("POST", "/api/venues/search", requestData);
      const venues: Venue[] = await response.json();
      return venues;
    },
    enabled: venueTypes.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
