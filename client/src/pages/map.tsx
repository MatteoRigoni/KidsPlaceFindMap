import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MapView from "@/components/MapView";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { type VenueType, type Location } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<VenueType>>(
    new Set(['playground', 'park', 'museum', 'gallery', 'science_center', 'planetarium', 'swimming_pool'] as VenueType[])
  );
  const [currentLocation, setCurrentLocation] = useState<Location>({
    query: "Rome",
    lat: 41.9028,
    lng: 12.4964,
    displayName: "Rome, Italy"
  });
  
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleFilter = (venueType: VenueType) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(venueType)) {
      newFilters.delete(venueType);
    } else {
      newFilters.add(venueType);
    }
    setActiveFilters(newFilters);
  };

  const handleLocationSelect = (location: Location) => {
    setCurrentLocation(location);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-light-bg">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-30 h-full
        ${isMobile ? 'fixed' : 'relative'}
        ${isMobile && sidebarOpen ? 'translate-x-0' : ''}
        ${isMobile && !sidebarOpen ? '-translate-x-full' : ''}
        ${!isMobile ? 'translate-x-0' : ''}
      `}>
        <Sidebar 
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          onClose={() => setSidebarOpen(false)}
          showCloseButton={isMobile}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 relative h-full">
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-40 bg-white text-text-dark hover:bg-gray-100 shadow-lg"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Search bar - centered horizontally outside left panel */}
        <div className={`absolute top-4 z-[1000] w-full max-w-md ${isMobile ? 'left-1/2 transform -translate-x-1/2 px-4' : 'left-1/2 transform -translate-x-1/2 ml-40'}`}>
          <SearchBar onLocationSelect={handleLocationSelect} />
        </div>

        {/* Map */}
        <MapView 
          currentLocation={currentLocation}
          activeFilters={activeFilters}
        />
      </div>
    </div>
  );
}
