import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Location, type LocationSearchRequest } from "@shared/schema";

interface SearchBarProps {
  onLocationSelect: (location: Location) => void;
}

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string): Promise<Location[]> => {
      const requestData: LocationSearchRequest = { query: searchQuery };
      const response = await apiRequest("POST", "/api/locations/search", requestData);
      return response.json();
    },
    onSuccess: (locations) => {
      if (locations.length > 0) {
        const location = locations[0];
        onLocationSelect(location);
        toast({
          title: "Location found",
          description: `Showing results for ${location.displayName.split(',')[0]}`,
        });
      } else {
        toast({
          title: "No results",
          description: "Location not found. Please try a different search term.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Search failed",
        description: "Failed to search location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    searchMutation.mutate(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search for a city or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pl-12 pr-20 py-3 bg-white rounded-lg shadow-lg border border-gray-200 focus:ring-2 focus:ring-map-blue focus:border-transparent text-text-dark placeholder-gray-500"
          disabled={searchMutation.isPending}
        />
        <Button
          onClick={handleSearch}
          disabled={searchMutation.isPending || !query.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-map-blue text-white hover:bg-blue-600 px-4 py-1.5 h-auto"
        >
          {searchMutation.isPending ? "..." : "Search"}
        </Button>
      </div>
    </div>
  );
}
