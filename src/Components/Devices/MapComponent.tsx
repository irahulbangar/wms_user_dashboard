import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapComponentProps {
  height?: string;
  className?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  hwid?: string;
  deviceName: string | undefined;
}

const MapComponent: React.FC<MapComponentProps> = ({
  height = "60",
  className = `${height}`,
  latitude = 0.0,
  longitude = 0.0,
  address = "Location",
  hwid = "0000000000000000",
  deviceName,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const isValidCoordinates =
    !isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude === 0 ||
      longitude === 0
    ) {
      return;
    }

    const map = L.map(mapRef.current).setView([latitude, longitude], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const locations = [
      {
        address: `${deviceName} (${address})`,
        coords: [latitude, longitude],
        hwid: hwid,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ff0000" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
      },
    ];

    locations.forEach((location) => {
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          color: white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
        ">${location.icon}</div>`,
        iconSize: [35, 35],
        iconAnchor: [17.5, 17.5],
      });

      const marker = L.marker(location.coords as [number, number], {
        icon: customIcon,
      }).addTo(map);

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #333; font-weight: 600;">${location.address}</h3>
          <p style="margin: 0; color: #666; font-size: 12px;">
            Latitude : ${location.coords[0]}
          </p>
          <p style="margin: 0; color: #666; font-size: 12px;">
            Longitude : ${location.coords[1]}
          </p>
          <div style="margin-top: 2px; padding: 4px 0px; border-radius: 4px; display: inline-block;">
            HWID : ${location.hwid}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent).openPopup();
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`${className}`}>
      <div
        ref={mapRef}
        className={`${height} w-full rounded-lg border border-border-primary overflow-hidden`}
        style={{ zIndex: 1 }}
      >
        {!isValidCoordinates && (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 font-roboto">
            <div className="text-center">
              <div className="text-lg mb-2">📍</div>
              <div>No location data available</div>
              <div className="text-sm mt-1">
                Coordinates: {latitude}, {longitude}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
