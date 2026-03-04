import React, { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  Polyline,
} from "react-leaflet";
import {
  getAllMapTwins,
  getRoutes,
  getStatusColor,
  type SupplyChainTwin,
  type Route,
} from "@/services/mapService";
import "./Map.css";

interface SupplyChainMapProps {
  selectedTwinId: string | null;
  onSelectTwin: (id: string | null) => void;
}

export default function SupplyChainMap({
  selectedTwinId,
  onSelectTwin,
}: SupplyChainMapProps) {
  const twins = useMemo<SupplyChainTwin[]>(() => getAllMapTwins(), []);
  const routes = useMemo<Route[]>(() => getRoutes(), []);

  // Center and bounds over India
  const center: [number, number] = [22.5, 79];
  const bounds: [[number, number], [number, number]] = [
    [6, 67],
    [37, 98],
  ];

  const getTwinLatLng = (id: string): [number, number] | null => {
    const t = twins.find((tw) => tw.id === id);
    return t ? [t.lat, t.lon] : null;
  };

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={5}
        minZoom={4}
        maxZoom={7}
        maxBounds={bounds}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
        attributionControl={false}
        zoomControl={false}
        worldCopyJump={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          crossOrigin="anonymous"
        />

        {routes.map((route) => {
          const from = getTwinLatLng(route.from);
          const to = getTwinLatLng(route.to);
          if (!from || !to) return null;

          const isConnected =
            selectedTwinId &&
            (route.from === selectedTwinId || route.to === selectedTwinId);

          return (
            <Polyline
              key={route.id}
              positions={[from, to]}
              pathOptions={{
                color: route.color,
                weight: isConnected ? route.strokeWidth + 1 : route.strokeWidth,
                opacity: isConnected ? 1 : 0.5,
                dashArray:
                  route.strokeDasharray === "none"
                    ? undefined
                    : route.strokeDasharray,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          );
        })}

        {twins.map((twin) => {
          const isSelected = twin.id === selectedTwinId;
          const color = getStatusColor(twin.status);

          return (
            <CircleMarker
              key={twin.id}
              center={[twin.lat, twin.lon]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color,
                weight: isSelected ? 3 : 2,
                fillColor: color,
                fillOpacity: isSelected ? 0.9 : 0.7,
              }}
              eventHandlers={{
                click: () => onSelectTwin(isSelected ? null : twin.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -4]} permanent={false} opacity={0.95}>
                <div className="map-tooltip">
                  <div className="tooltip-name">{twin.name}</div>
                  <div className="tooltip-city">{twin.city}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}