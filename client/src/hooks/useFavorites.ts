import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type Venue, type InsertUserFavorite } from "@shared/schema";

export function useFavorites() {
  const { toast } = useToast();
  
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["/api/favorites"],
    retry: false,
  });

  return {
    favorites,
    isLoading,
  };
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (venue: Venue) => {
      const favoriteData: Omit<InsertUserFavorite, 'userId'> = {
        venueId: venue.id,
        venueName: venue.name,
        venueType: venue.type,
        venueLat: venue.lat,
        venueLng: venue.lng,
      };
      
      const response = await apiRequest("POST", "/api/favorites", favoriteData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites",
        description: "This place has been saved to your favorites.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (venueId: string) => {
      const response = await apiRequest("DELETE", `/api/favorites/${venueId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "This place has been removed from your favorites.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error", 
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
  });
}