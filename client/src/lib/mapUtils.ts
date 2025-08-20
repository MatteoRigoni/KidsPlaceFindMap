import L from "leaflet";

// Utility functions for map operations
export const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `
      <div class="custom-marker w-8 h-8 flex items-center justify-center" 
           style="background-color: ${color};">
        <i class="${icon} text-white text-xs"></i>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

export const calculateBounds = (lat: number, lng: number, radiusKm: number = 5) => {
  // Rough calculation for lat/lng delta based on radius
  const latDelta = radiusKm / 111; // 1 degree lat ≈ 111km
  const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  
  return {
    north: lat + latDelta,
    south: lat - latDelta,
    east: lng + lngDelta,
    west: lng - lngDelta
  };
};

export const formatAddress = (tags: Record<string, string>) => {
  const street = tags['addr:street'];
  const houseNumber = tags['addr:housenumber'];
  const city = tags['addr:city'];
  const postcode = tags['addr:postcode'];
  
  const parts = [];
  if (houseNumber && street) {
    parts.push(`${houseNumber} ${street}`);
  } else if (street) {
    parts.push(street);
  }
  
  if (city) {
    parts.push(city);
  }
  
  if (postcode) {
    parts.push(postcode);
  }
  
  return parts.join(', ') || 'Address not available';
};
