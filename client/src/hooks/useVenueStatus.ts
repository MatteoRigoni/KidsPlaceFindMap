import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useVenueStatus(venueId: string) {
  const { isAuthenticated } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/venue", venueId, "status"],
    queryFn: async () => {
      const response = await fetch(`/api/venue/${venueId}/status`);
      if (!response.ok) throw new Error('Failed to fetch venue status');
      return response.json();
    },
    enabled: isAuthenticated && !!venueId,
    retry: false,
  });

  return {
    isFavorite: data?.isFavorite || false,
    isVisited: data?.isVisited || false,
    isLoading,
  };
}