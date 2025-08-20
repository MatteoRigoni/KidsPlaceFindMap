import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useVenues } from "@/hooks/useVenues";
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
      baby: LucideIcons.Baby,
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
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater location={currentLocation} />
        
        {venues.map((venue: Venue) => {
          const IconComponent = getIcon(VENUE_TYPE_CONFIG[venue.type].icon);
          
          return (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={createMarkerIcon(venue.type)}
            >
              <Popup>
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
                      <LucideIcons.MapPin className="w-3 h-3 inline mr-1" />
                      {venue.address}
                    </p>
                  )}
                  {venue.description && (
                    <p className="text-sm text-gray-700">{venue.description}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
