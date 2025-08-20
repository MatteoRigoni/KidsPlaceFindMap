import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Heart, Check, MapPin as MapPinIcon } from "lucide-react";
import { useVenues } from "@/hooks/useVenues";
import { useAuth } from "@/hooks/useAuth";
import { useAddFavorite, useRemoveFavorite } from "@/hooks/useFavorites";
import { useAddVisited, useRemoveVisited } from "@/hooks/useVisited";
import { useVenueStatus } from "@/hooks/useVenueStatus";
import { type Location, type VenueType, type Venue, VENUE_TYPE_CONFIG } from "@shared/schema";
import * as LucideIcons from "lucide-react";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  currentLocation: Location;
  activeFilters: Set<VenueType>;
}

// Component to update map view when location changes
function MapUpdater({ location }: { location: Location }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([location.lat, location.lng], 13);
  }, [location, map]);
  
  return null;
}

// Create custom marker icon
const createMarkerIcon = (venueType: VenueType) => {
  const config = VENUE_TYPE_CONFIG[venueType];
  
  return L.divIcon({
    html: `
      <div class="custom-marker w-8 h-8 flex items-center justify-center" 
           style="background-color: ${config.color};">
        <div class="w-4 h-4 text-white flex items-center justify-center">
          •
        </div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Venue popup component
function VenuePopup({ venue }: { venue: Venue }) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, isVisited, isLoading: statusLoading } = useVenueStatus(venue.id);
  
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const addVisited = useAddVisited();
  const removeVisited = useRemoveVisited();
  
  const IconComponent = getIcon(VENUE_TYPE_CONFIG[venue.type].icon);
  
  const handleFavoriteClick = () => {
    if (isFavorite) {
      removeFavorite.mutate(venue.id);
    } else {
      addFavorite.mutate(venue);
    }
  };
  
  const handleVisitedClick = () => {
    if (isVisited) {
      removeVisited.mutate(venue.id);
    } else {
      addVisited.mutate(venue);
    }
  };
  
  return (
    <div className="p-3 min-w-64">
      <h3 className="font-semibold text-text-dark mb-2">{venue.name}</h3>
      <div className="flex items-center mb-2">
        <IconComponent 
          className="w-4 h-4 mr-2" 
          style={{ color: VENUE_TYPE_CONFIG[venue.type].color }}
        />
        <span className="text-sm text-gray-600">
          {VENUE_TYPE_CONFIG[venue.type].name}
        </span>
      </div>
      {venue.address && (
        <p className="text-sm text-gray-600 mb-2">
          <MapPinIcon className="w-3 h-3 inline mr-1" />
          {venue.address}
        </p>
      )}
      {venue.description && (
        <p className="text-sm text-gray-700 mb-3">{venue.description}</p>
      )}
      
      {/* Action buttons for authenticated users */}
      {isAuthenticated && (
        <div className="flex space-x-2 pt-2 border-t border-gray-100">
          <Button
            onClick={handleFavoriteClick}
            variant={isFavorite ? "default" : "outline"}
            size="sm"
            className="flex-1"
            disabled={statusLoading || addFavorite.isPending || removeFavorite.isPending}
          >
            <Heart 
              className={`w-4 h-4 mr-1 ${isFavorite ? 'fill-current' : ''}`} 
            />
            {isFavorite ? 'Favorited' : 'Favorite'}
          </Button>
          <Button
            onClick={handleVisitedClick}
            variant={isVisited ? "default" : "outline"}
            size="sm"
            className="flex-1"
            disabled={statusLoading || addVisited.isPending || removeVisited.isPending}
          >
            <Check 
              className={`w-4 h-4 mr-1`} 
            />
            {isVisited ? 'Visited' : 'Mark Visited'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MapView({ currentLocation, activeFilters }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  
  const { data: venues = [], isLoading, refetch } = useVenues(
    currentLocation,
    Array.from(activeFilters)
  );

  // Refetch venues when filters or location changes
  useEffect(() => {
    refetch();
  }, [activeFilters, currentLocation, refetch]);

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      users: LucideIcons.Users,
      trees: LucideIcons.Trees,
      building: LucideIcons.Building,
      palette: LucideIcons.Palette,
      atom: LucideIcons.Atom,
      globe: LucideIcons.Globe,
      waves: LucideIcons.Waves,
    };
    return iconMap[iconName] || LucideIcons.MapPin;
  };

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-map-blue mb-4"></div>
            <p className="text-text-dark font-medium">Loading kid-friendly places...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        ref={mapRef}
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="w-full h-full"
        zoomControl={false}
        whenReady={() => {
          // Force map to resize after it's ready
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
            }
          }, 100);
        }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater location={currentLocation} />
        
        {venues.map((venue: Venue) => {
          return (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={createMarkerIcon(venue.type)}
            >
              <Popup>
                <VenuePopup venue={venue} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
