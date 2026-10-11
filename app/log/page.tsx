"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CheckCircle2,
  TreePine,
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  TransportMode,
  EMISSION_FACTORS,
  calculateRoadDistance,
  calculateWeeklyEmissions,
  calculateAnnualEmissions,
  calculateTreesNeeded,
} from "@/lib/emission-factors";
import {
  CAMPUS_CONFIG,
  POPULAR_BENGALURU_LOCALITIES,
  LocalityOption,
} from "@/lib/campus-config";
import { saveUserCommute } from "@/lib/sample-data";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function LogCommutePage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "faculty" | "staff">("student");
  const [selectedLocality, setSelectedLocality] = useState<LocalityOption>(
    POPULAR_BENGALURU_LOCALITIES[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState<TransportMode>("bus");
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [arrivalTime, setArrivalTime] = useState("08:45");
  const [submitted, setSubmitted] = useState(false);

  // Debounced search for OpenStreetMap Nominatim
  const lastSearchTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      // Respect 1-second query rate-limiting for Nominatim
      const now = Date.now();
      const timeSinceLast = now - lastSearchTimeRef.current;
      if (timeSinceLast < 1000) {
        await new Promise((r) => setTimeout(r, 1000 - timeSinceLast));
      }
      lastSearchTimeRef.current = Date.now();

      setIsSearching(true);
      try {
        const queryWithCity = `${searchQuery.trim()}, Bengaluru, India`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            queryWithCity
          )}&limit=5&addressdetails=1`
        );
        if (res.ok) {
          const data: NominatimResult[] = await res.json();
          setSearchResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Nominatim search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Live Calculations
  const calculatedMetrics = useMemo(() => {
    const oneWayRoadKm = calculateRoadDistance(
      selectedLocality.lat,
      selectedLocality.lng
    );
    const weeklyKg = calculateWeeklyEmissions(oneWayRoadKm, daysPerWeek, mode);
    const annualKg = calculateAnnualEmissions(weeklyKg);
    const trees = calculateTreesNeeded(annualKg);

    return {
      oneWayRoadKm,
      weeklyKg,
      annualKg,
      trees,
    };
  }, [selectedLocality, daysPerWeek, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveUserCommute({
      name: name.trim(),
      role,
      neighborhood: selectedLocality.name.split(",")[0],
      lat: selectedLocality.lat,
      lng: selectedLocality.lng,
      mode,
      daysPerWeek,
      arrivalTime,
      oneWayDistanceKm: calculatedMetrics.oneWayRoadKm,
      weeklyKgCO2: calculatedMetrics.weeklyKg,
      annualKgCO2: calculatedMetrics.annualKg,
      treesNeeded: calculatedMetrics.trees,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl p-8 border border-green-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Commute Logged Successfully!
          </h2>
          <p className="text-slate-600 text-sm">
            Your travel emissions have been recorded and synchronized with the campus dataset.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 gap-4 text-left text-sm">
          <div>
            <span className="text-xs text-slate-500 block">Weekly CO2</span>
            <span className="font-bold text-slate-900 text-lg">
              {calculatedMetrics.weeklyKg} kg
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Annual Footprint</span>
            <span className="font-bold text-slate-900 text-lg">
              {calculatedMetrics.annualKg} kg
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Trees to Offset</span>
            <span className="font-bold text-green-700 text-lg">
              🌲 {calculatedMetrics.trees} trees
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">One-Way Road Distance</span>
            <span className="font-bold text-slate-900 text-lg">
              {calculatedMetrics.oneWayRoadKm} km
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => router.push("/me")}
            className="inline-flex items-center justify-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl font-medium transition"
          >
            <span>View My Footprint Card</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setName("");
            }}
            className="inline-flex items-center justify-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl font-medium transition"
          >
            <span>Log Another Trip</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Log Your Daily Commute</h1>
        <p className="text-sm text-slate-600 mt-1">
          Record your typical journey to {CAMPUS_CONFIG.name}. Real-time road distance and emissions are calculated automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
        >
          {/* Commuter Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Name / Alias *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Rao"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Campus Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "student" | "faculty" | "staff")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="staff">Campus Staff</option>
              </select>
            </div>
          </div>

          {/* Home Locality Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Home Neighborhood / Locality (Origin)
            </label>

            {/* Popular Presets Dropdown */}
            <div>
              <span className="text-xs text-slate-500 block mb-1">Choose a common Bengaluru locality:</span>
              <select
                value={selectedLocality.name}
                onChange={(e) => {
                  const match = POPULAR_BENGALURU_LOCALITIES.find(
                    (p) => p.name === e.target.value
                  );
                  if (match) setSelectedLocality(match);
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                {POPULAR_BENGALURU_LOCALITIES.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* OpenStreetMap Nominatim Live Search */}
            <div className="relative pt-2">
              <span className="text-xs text-slate-500 block mb-1">
                Or search any specific address (OpenStreetMap Geocoding):
              </span>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search locality (e.g. Koramangala 4th Block, HSR Layout)..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {isSearching && (
                  <div className="absolute right-3 top-2.5 text-xs text-blue-600 animate-pulse font-medium">
                    Searching...
                  </div>
                )}
              </div>

              {/* Nominatim Results Popup */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {searchResults.map((res) => (
                    <button
                      key={res.place_id}
                      type="button"
                      onClick={() => {
                        setSelectedLocality({
                          name: res.display_name,
                          lat: parseFloat(res.lat),
                          lng: parseFloat(res.lon),
                        });
                        setShowDropdown(false);
                        setSearchQuery("");
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-red-500 inline mr-1.5" />
                      {res.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Location Pill */}
            <div className="pt-1 flex items-center text-xs text-slate-600 space-x-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Selected Origin:</strong> {selectedLocality.name} (
                {selectedLocality.lat.toFixed(4)}°N, {selectedLocality.lng.toFixed(4)}°E)
              </span>
            </div>
          </div>

          {/* Primary Travel Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Primary Transportation Mode *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(EMISSION_FACTORS).map((meta) => {
                const isSelected = mode === meta.id;
                return (
                  <button
                    key={meta.id}
                    type="button"
                    onClick={() => setMode(meta.id)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 block leading-tight">
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {meta.category}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] font-mono font-medium text-slate-600">
                      {meta.factorKgCO2PerPkm === 0
                        ? "0.00 kg/km"
                        : `${meta.factorKgCO2PerPkm} kg/km`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days per week & Typical Arrival */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Days Commuting Per Week
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDaysPerWeek(num)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                      daysPerWeek === num
                        ? "bg-navy-900 text-white border-navy-900"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Campus Arrival Window
              </label>
              <select
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="08:00">08:00 AM</option>
                <option value="08:15">08:15 AM</option>
                <option value="08:30">08:30 AM</option>
                <option value="08:45">08:45 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:15">09:15 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="09:45">09:45 AM</option>
                <option value="10:00">10:00 AM</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <span>Record Commute & Update Footprint</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Live Calculation Sidebar Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Live Calculation Preview
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">One-Way Road Distance</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {calculatedMetrics.oneWayRoadKm}
                  </span>
                  <span className="text-xs text-slate-500">km (Haversine × 1.3)</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Weekly Distance (Round Trip)</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg font-bold text-slate-800">
                    {(calculatedMetrics.oneWayRoadKm * 2 * daysPerWeek).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">km / week</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 block">Weekly CO2 Generation</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-red-600">
                    {calculatedMetrics.weeklyKg}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">kg CO₂</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Annual Projected Emissions</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xl font-bold text-slate-900">
                    {calculatedMetrics.annualKg}
                  </span>
                  <span className="text-xs text-slate-500">kg CO₂ (52 weeks)</span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                  <TreePine className="w-4 h-4 text-emerald-600" />
                  <span>Mature Trees Needed:</span>
                </div>
                <div className="text-2xl font-black text-emerald-700">
                  {calculatedMetrics.trees}{" "}
                  <span className="text-xs font-normal">trees/year</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 leading-tight">
                  Based on EPA standard urban sequestration rate of 21.77 kg CO₂/tree/year.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tip Box */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-xs text-blue-900 space-y-1">
            <span className="font-bold block">💡 Did You Know?</span>
            <p className="leading-relaxed">
              Switching from a solo petrol car (0.17 kg/km) to a BMTC bus (0.09 kg/km) or a 4-person carpool (~0.042 kg/km) cuts your commute footprint by nearly 50% to 75%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
