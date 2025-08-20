import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type Venue, type InsertUserVisited } from "@shared/schema";

export function useVisited() {
  const { data: visited = [], isLoading } = useQuery({
    queryKey: ["/api/visited"],
    retry: false,
  });

  return {
    visited,
    isLoading,
  };
}

export function useAddVisited() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (venue: Venue) => {
      const visitedData: Omit<InsertUserVisited, 'userId'> = {
        venueId: venue.id,
        venueName: venue.name,
        venueType: venue.type,
        venueLat: venue.lat,
        venueLng: venue.lng,
      };
      
      const response = await apiRequest("POST", "/api/visited", visitedData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visited"] });
      toast({
        title: "Marked as visited",
        description: "This place has been added to your visited list.",
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
        description: "Failed to mark as visited. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveVisited() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (venueId: string) => {
      const response = await apiRequest("DELETE", `/api/visited/${venueId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visited"] });
      toast({
        title: "Removed from visited",
        description: "This place has been removed from your visited list.",
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
        description: "Failed to remove from visited. Please try again.",
        variant: "destructive",
      });
    },
  });
}