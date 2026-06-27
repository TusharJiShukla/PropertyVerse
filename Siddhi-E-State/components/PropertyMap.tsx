"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
import L from "leaflet";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Dynamically import react-leaflet components so they don't run on the server
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// MapUpdater component to automatically fly to new center when filters change
function MapUpdater({ center }: { center: [number, number] }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, map.getZoom(), {
      animate: true,
      duration: 1.5
    });
  }, [center, map]);
  
  return null;
}

import MapMarkerPopup from "./MapMarkerPopup";

type Property = any;

export default function PropertyMap({ properties }: { properties: Property[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-[500px] bg-gray-200 animate-pulse rounded-xl"></div>;
  }

  // Filter properties that actually have coordinates
  const validProperties = properties.filter((p) => p.coordinates && p.coordinates.lat && p.coordinates.lng);

  // Default center (Mumbai)
  const defaultCenter: [number, number] = [19.0760, 72.8777];
  
  const center = validProperties.length > 0 
    ? [validProperties[0].coordinates.lat, validProperties[0].coordinates.lng] as [number, number]
    : defaultCenter;

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg border-4 border-white z-0 relative">
      <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%", zIndex: 0 }}>
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validProperties.map((property) => (
          <Marker key={property._id} position={[property.coordinates.lat, property.coordinates.lng]}>
            <Popup>
              <MapMarkerPopup property={property} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
