"use client";

import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CAMPUS_CONFIG } from "@/lib/campus-config";
import { CommuterRecord } from "@/lib/sample-data";

interface CampusMapClientProps {
  commuters: CommuterRecord[];
}

export default function CampusMapClient({ commuters }: CampusMapClientProps) {
  // Campus destination custom SVG icon
  const campusIcon = useMemo(() => {
    return L.divIcon({
      className: "custom-campus-pin",
      html: `
        <div style="background-color: #081849; color: white; border: 2px solid #eab308; border-radius: 9999px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-weight: bold; font-size: 14px;">
          🎓
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }, []);

  // Aggregate commuter emissions by neighborhood
  const neighborhoodAggregates = useMemo(() => {
    const map = new Map<
      string,
      {
        neighborhood: string;
        lat: number;
        lng: number;
        commutersCount: number;
        totalWeeklyKg: number;
        totalAnnualKg: number;
        treesNeeded: number;
        primaryModes: Record<string, number>;
      }
    >();

    for (const c of commuters) {
      const existing = map.get(c.neighborhood);
      if (!existing) {
        map.set(c.neighborhood, {
          neighborhood: c.neighborhood,
          lat: c.lat,
          lng: c.lng,
          commutersCount: 1,
          totalWeeklyKg: c.weeklyKgCO2,
          totalAnnualKg: c.annualKgCO2,
          treesNeeded: c.treesNeeded,
          primaryModes: { [c.mode]: 1 },
        });
      } else {
        existing.commutersCount += 1;
        existing.totalWeeklyKg += c.weeklyKgCO2;
        existing.totalAnnualKg += c.annualKgCO2;
        existing.treesNeeded += c.treesNeeded;
        existing.primaryModes[c.mode] = (existing.primaryModes[c.mode] || 0) + 1;
      }
    }

    return Array.from(map.values());
  }, [commuters]);

  return (
    <div className="w-full h-[480px] rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={[CAMPUS_CONFIG.latitude, CAMPUS_CONFIG.longitude]}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Campus Location Marker */}
        <Marker
          position={[CAMPUS_CONFIG.latitude, CAMPUS_CONFIG.longitude]}
          icon={campusIcon}
        >
          <Popup>
            <div className="p-1">
              <span className="font-bold text-navy-900 block text-sm">
                {CAMPUS_CONFIG.name}
              </span>
              <p className="text-xs text-slate-600 mt-1">
                Central Campus Hub ({CAMPUS_CONFIG.city})
              </p>
              <div className="mt-2 inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-semibold">
                Destination Point
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Neighborhood Circle Markers */}
        {neighborhoodAggregates.map((item) => {
          // Circle radius proportional to weekly emissions (clamped between 8 and 30 px)
          const radius = Math.min(30, Math.max(10, Math.round(item.totalWeeklyKg / 4)));
          // Color based on emission intensity
          const color =
            item.totalWeeklyKg > 100
              ? "#dc2626" // Red high
              : item.totalWeeklyKg > 40
              ? "#ea580c" // Orange medium
              : "#16a34a"; // Green lower

          return (
            <CircleMarker
              key={item.neighborhood}
              center={[item.lat, item.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-1 text-slate-800">
                  <span className="font-bold text-sm block border-b pb-1 mb-1">
                    {item.neighborhood}
                  </span>
                  <div className="space-y-1 text-xs">
                    <p>
                      <strong>Commuters:</strong> {item.commutersCount}
                    </p>
                    <p>
                      <strong>Weekly CO2:</strong>{" "}
                      <span className="text-red-600 font-semibold">
                        {item.totalWeeklyKg.toFixed(1)} kg
                      </span>
                    </p>
                    <p>
                      <strong>Annual CO2:</strong>{" "}
                      {item.totalAnnualKg.toFixed(1)} kg
                    </p>
                    <p>
                      <strong>Trees to Offset:</strong>{" "}
                      <span className="text-emerald-700 font-semibold">
                        🌲 {item.treesNeeded.toFixed(0)} trees/yr
                      </span>
                    </p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
