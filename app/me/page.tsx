"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  TreePine,
  TrendingDown,
  TrendingUp,
  Bus,
  Users,
  PlusCircle,
  MapPin,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  getStoredUserCommutes,
  CommuterRecord,
  BENCHMARK_COMMUTERS,
} from "@/lib/sample-data";
import {
  EMISSION_FACTORS,
  calculatePotentialSavings,
} from "@/lib/emission-factors";
import { CAMPUS_CONFIG } from "@/lib/campus-config";

export default function MyFootprintPage() {
  const [userCommutes, setUserCommutes] = useState<CommuterRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUserCommutes(getStoredUserCommutes());
  }, []);

  // Most recent user commute record, or fallback to first benchmark student for demonstration if none
  const activeRecord: CommuterRecord = useMemo(() => {
    if (userCommutes.length > 0) return userCommutes[0];
    return {
      id: "demo-user",
      name: "Sample Commuter (Demonstration)",
      role: "student",
      neighborhood: "JP Nagar 7th Phase",
      lat: 12.8912,
      lng: 77.5768,
      mode: "two_wheeler",
      daysPerWeek: 5,
      arrivalTime: "08:45",
      oneWayDistanceKm: 12.4,
      weeklyKgCO2: 12.4,
      annualKgCO2: 644.8,
      treesNeeded: 29.6,
      createdAt: new Date().toISOString(),
      isUserLog: false,
    };
  }, [userCommutes]);

  // Campus average benchmark
  const campusAverageWeekly = useMemo(() => {
    const total = BENCHMARK_COMMUTERS.reduce((a, b) => a + b.weeklyKgCO2, 0);
    return Number((total / BENCHMARK_COMMUTERS.length).toFixed(1));
  }, []);

  const vsCampusDiff = useMemo(() => {
    const diff = activeRecord.weeklyKgCO2 - campusAverageWeekly;
    const pct = Math.abs(Math.round((diff / campusAverageWeekly) * 100));
    return {
      isHigher: diff > 0,
      diffAbs: Math.abs(diff).toFixed(1),
      pct,
    };
  }, [activeRecord, campusAverageWeekly]);

  // Mode Shift Alternative Savings
  const busSavings = useMemo(() => {
    return calculatePotentialSavings(
      activeRecord.oneWayDistanceKm,
      activeRecord.daysPerWeek,
      activeRecord.mode,
      "bus"
    );
  }, [activeRecord]);

  const carpoolSavings = useMemo(() => {
    // 4-person carpool factor is roughly 0.0425 kg CO2/pkm
    const currentWeekly = activeRecord.weeklyKgCO2;
    const carpoolFactor = 0.0425;
    const weeklyKm = activeRecord.oneWayDistanceKm * 2 * activeRecord.daysPerWeek;
    const carpoolWeekly = Number((weeklyKm * carpoolFactor).toFixed(2));
    const weeklySavedKg = Math.max(0, Number((currentWeekly - carpoolWeekly).toFixed(2)));
    const annualSavedKg = Number((weeklySavedKg * 52).toFixed(2));
    const treesSaved = Number((annualSavedKg / 21.77).toFixed(1));
    const pct = currentWeekly > 0 ? Math.round((weeklySavedKg / currentWeekly) * 100) : 0;
    return {
      weeklySavedKg,
      annualSavedKg,
      treesSaved,
      pct,
    };
  }, [activeRecord]);

  if (!mounted) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading your personal footprint card...
      </div>
    );
  }

  const isDemo = userCommutes.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Notification if displaying demo data */}
      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-sm">
          <div>
            <span className="font-bold block">Viewing Demonstration Profile</span>
            <span className="text-amber-800 text-xs">
              You haven&apos;t logged a personal commute yet. Log your commute to see your custom metrics.
            </span>
          </div>
          <Link
            href="/log"
            className="inline-flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log My Commute Now</span>
          </Link>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#081849] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {activeRecord.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900">{activeRecord.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
                {activeRecord.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center space-x-2 mt-1">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {activeRecord.neighborhood}
              </span>
              <span>•</span>
              <span>{activeRecord.oneWayDistanceKm} km one-way</span>
              <span>•</span>
              <span>{activeRecord.daysPerWeek} days/wk</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/log"
            className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Update / Log New</span>
          </Link>
          <Link
            href="/carpool"
            className="inline-flex items-center space-x-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow transition"
          >
            <Users className="w-4 h-4 text-amber-300" />
            <span>Find Carpool Group</span>
          </Link>
        </div>
      </div>

      {/* Hero Footprint Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly & Annual Emissions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Carbon Footprint</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                EMISSION_FACTORS[activeRecord.mode]?.badgeBg
              } ${EMISSION_FACTORS[activeRecord.mode]?.badgeText}`}
            >
              {EMISSION_FACTORS[activeRecord.mode]?.label}
            </span>
          </div>

          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold text-red-600">
                {activeRecord.weeklyKgCO2}
              </span>
              <span className="text-sm font-semibold text-slate-500">kg CO₂ / week</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeRecord.annualKgCO2.toFixed(1)} kg CO₂ projected annually
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Mode Factor:</span>
              <span className="font-semibold text-slate-900">
                {EMISSION_FACTORS[activeRecord.mode]?.factorKgCO2PerPkm} kg/pkm
              </span>
            </div>
            <div className="flex justify-between">
              <span>Weekly Round-Trip:</span>
              <span className="font-semibold text-slate-900">
                {(activeRecord.oneWayDistanceKm * 2 * activeRecord.daysPerWeek).toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        {/* Tree Sequestration Equivalence */}
        <div className="bg-emerald-50/70 rounded-2xl p-6 border border-emerald-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <TreePine className="w-4 h-4 text-emerald-600" />
              <span>Tree Sequestration Requirement</span>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-emerald-800">
                  {activeRecord.treesNeeded}
                </span>
                <span className="text-sm font-semibold text-emerald-700">
                  trees / year
                </span>
              </div>
              <p className="text-xs text-emerald-800/80 mt-1">
                Mature trees required to neutralize your annual commute carbon output.
              </p>
            </div>
          </div>

          <div className="bg-white/80 rounded-xl p-3 border border-emerald-200/60 text-xs text-emerald-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Standard urban tree absorbs <strong>21.77 kg CO₂/year</strong>.
            </span>
          </div>
        </div>

        {/* Campus Benchmark Comparison */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Campus Benchmark</span>
              <Award className="w-4 h-4 text-blue-600" />
            </div>

            <div className="mt-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-slate-900">
                  {campusAverageWeekly}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  kg CO₂ (Campus Avg)
                </span>
              </div>

              <div className="mt-3 flex items-center space-x-2">
                {vsCampusDiff.isHigher ? (
                  <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    {vsCampusDiff.pct}% Higher than Average
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                    <TrendingDown className="w-3.5 h-3.5 mr-1" />
                    {vsCampusDiff.pct}% Greener than Average
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Calculated across {BENCHMARK_COMMUTERS.length} commuters at {CAMPUS_CONFIG.shortName}.
          </p>
        </div>
      </div>

      {/* Mitigation & Mode Shift Potential */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Personal Mode-Shift Opportunities
          </h2>
          <p className="text-sm text-slate-600">
            See how much carbon and trees you can save by switching from your current mode ({EMISSION_FACTORS[activeRecord.mode]?.label})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A: Switch to BMTC City Bus */}
          <div className="rounded-xl p-5 border border-blue-200 bg-blue-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-base">
                <Bus className="w-5 h-5 text-blue-600" />
                <span>Switch to BMTC City Bus</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-semibold">
                0.09 kg CO₂/km
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-800">
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-[11px] text-slate-500 block">Weekly Savings</span>
                <span className="text-lg font-bold text-green-600">
                  {busSavings.weeklySavedKg} kg CO₂
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-[11px] text-slate-500 block">Annual Trees Saved</span>
                <span className="text-lg font-bold text-green-700">
                  🌲 {busSavings.treesSaved} trees
                </span>
              </div>
            </div>

            <p className="text-xs text-blue-900/80 leading-relaxed">
              Bengaluru BMTC buses carry 40–60 passengers, spreading propulsion emissions across thousands of passenger-kilometers.
            </p>
          </div>

          {/* Option B: Join 4-Seat Peer Carpool */}
          <div className="rounded-xl p-5 border border-amber-200 bg-amber-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-base">
                <Users className="w-5 h-5 text-amber-600" />
                <span>Join 4-Seat Carpool</span>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold">
                ~0.0425 kg CO₂/km
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-800">
              <div className="bg-white p-3 rounded-lg border border-amber-100">
                <span className="text-[11px] text-slate-500 block">Weekly Savings</span>
                <span className="text-lg font-bold text-green-600">
                  {carpoolSavings.weeklySavedKg} kg CO₂
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-100">
                <span className="text-[11px] text-slate-500 block">Annual Trees Saved</span>
                <span className="text-lg font-bold text-green-700">
                  🌲 {carpoolSavings.treesSaved} trees
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-amber-900/80">
                Sharing a 4-seater petrol car slashes individual vehicle footprint by 75%.
              </p>
              <Link
                href="/carpool"
                className="text-xs font-bold text-amber-800 hover:text-amber-900 underline shrink-0 ml-2"
              >
                Find Group →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Log History */}
      {userCommutes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">Your Logged Commutes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Neighborhood</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Weekly CO₂</th>
                  <th className="py-2.5 px-3">Trees Needed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userCommutes.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3">{log.neighborhood}</td>
                    <td className="py-2 px-3">
                      <span className="capitalize">{EMISSION_FACTORS[log.mode]?.label}</span>
                    </td>
                    <td className="py-2 px-3">{log.oneWayDistanceKm} km</td>
                    <td className="py-2 px-3 font-semibold text-red-600">
                      {log.weeklyKgCO2} kg
                    </td>
                    <td className="py-2 px-3 text-emerald-700 font-semibold">
                      🌲 {log.treesNeeded}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
