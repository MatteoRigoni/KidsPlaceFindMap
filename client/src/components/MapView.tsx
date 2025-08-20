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
  
  // Get the SVG for the icon
  const getIconSvg = (iconName: string) => {
    const iconMap: Record<string, string> = {
      users: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-3-3m0 0a6 6 0 1 0-6-6c0 3.18 2.51 5.76 5.64 5.98"/></svg>`,
      trees: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="m12 19 8.3-8.3c.7-.7 1.7-.7 2.4 0 .7.7.7 1.7 0 2.4L14.4 21.6c-.7.7-1.7.7-2.4 0-.7-.7-.7-1.7 0-2.4Z"/></svg>`,
      building: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
      palette: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
      atom: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/></svg>`,
      globe: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
      waves: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`
    };
    return iconMap[iconName] || `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
  };
  
  return L.divIcon({
    html: `
      <div class="custom-marker w-7 h-7 flex items-center justify-center rounded-full border-2 border-white shadow-lg" 
           style="background-color: ${config.color};">
        <div class="w-4 h-4 text-white flex items-center justify-center">
          ${getIconSvg(config.icon)}
        </div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
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
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
