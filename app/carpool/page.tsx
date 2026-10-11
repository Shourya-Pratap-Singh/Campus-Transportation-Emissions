"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Car,
  Clock,
  MapPin,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import {
  getAllCommuterRecords,
  CommuterRecord,
} from "@/lib/sample-data";
import {
  calculateHaversineDistance,
  EMISSION_FACTORS,
} from "@/lib/emission-factors";

interface CarpoolGroup {
  id: string;
  neighborhoodHub: string;
  members: CommuterRecord[];
  targetArrival: string;
  baselineWeeklyKg: number;
  sharedWeeklyKg: number;
  weeklySavedKg: number;
  annualSavedKg: number;
  treesSaved: number;
}

export default function CarpoolMatcherPage() {
  const [commuters, setCommuters] = useState<CommuterRecord[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCommuters(getAllCommuterRecords());
  }, []);

  // Algorithm: Match commuters living within 3 km who arrive within 30 minutes
  const carpoolGroups: CarpoolGroup[] = useMemo(() => {
    if (commuters.length === 0) return [];

    // Filter candidate commuters who drive or ride personal vehicles
    const candidates = commuters.filter((c) =>
      ["car_petrol", "car_diesel", "two_wheeler", "auto"].includes(c.mode)
    );

    const visited = new Set<string>();
    const groups: CarpoolGroup[] = [];

    // Helper to convert "HH:mm" to minutes
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    for (let i = 0; i < candidates.length; i++) {
      const leader = candidates[i];
      if (visited.has(leader.id)) continue;

      const groupMembers: CommuterRecord[] = [leader];
      visited.add(leader.id);

      const leaderMins = toMinutes(leader.arrivalTime);

      for (let j = i + 1; j < candidates.length; j++) {
        if (groupMembers.length >= 4) break; // 4-seater carpool capacity

        const candidate = candidates[j];
        if (visited.has(candidate.id)) continue;

        // Condition 1: Distance <= 3 km radius
        const distKm = calculateHaversineDistance(
          leader.lat,
          leader.lng,
          candidate.lat,
          candidate.lng
        );

        // Condition 2: Arrival time within 30 mins
        const candMins = toMinutes(candidate.arrivalTime);
        const timeDiffMins = Math.abs(leaderMins - candMins);

        if (distKm <= 3.5 && timeDiffMins <= 30) {
          groupMembers.push(candidate);
          visited.add(candidate.id);
        }
      }

      // Only groups with 2, 3 or 4 people
      if (groupMembers.length >= 2) {
        // Baseline combined emissions if each person traveled separately
        const baselineWeeklyKg = groupMembers.reduce(
          (sum, m) => sum + m.weeklyKgCO2,
          0
        );

        // Max route distance in the group
        const maxOneWayKm = Math.max(...groupMembers.map((m) => m.oneWayDistanceKm));
        const avgDays = Math.round(
          groupMembers.reduce((sum, m) => sum + m.daysPerWeek, 0) / groupMembers.length
        );

        // When sharing 1 petrol car (0.17 kg CO2/km for the single car covering the route)
        // Shared weekly emissions for the one car doing the trip
        const sharedWeeklyKg = Number((maxOneWayKm * 2 * avgDays * 0.17).toFixed(2));
        const weeklySavedKg = Math.max(0, Number((baselineWeeklyKg - sharedWeeklyKg).toFixed(2)));
        const annualSavedKg = Number((weeklySavedKg * 52).toFixed(2));
        const treesSaved = Number((annualSavedKg / 21.77).toFixed(1));

        groups.push({
          id: `group-${groups.length + 1}`,
          neighborhoodHub: leader.neighborhood,
          members: groupMembers,
          targetArrival: leader.arrivalTime,
          baselineWeeklyKg: Number(baselineWeeklyKg.toFixed(2)),
          sharedWeeklyKg,
          weeklySavedKg,
          annualSavedKg,
          treesSaved,
        });
      }
    }

    return groups;
  }, [commuters]);

  // Unique neighborhoods for filter
  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    carpoolGroups.forEach((g) => set.add(g.neighborhoodHub));
    return ["All", ...Array.from(set)];
  }, [carpoolGroups]);

  const filteredGroups = useMemo(() => {
    if (selectedNeighborhood === "All") return carpoolGroups;
    return carpoolGroups.filter((g) => g.neighborhoodHub === selectedNeighborhood);
  }, [carpoolGroups, selectedNeighborhood]);

  const totalWeeklyCarpoolSavings = useMemo(() => {
    return carpoolGroups.reduce((sum, g) => sum + g.weeklySavedKg, 0);
  }, [carpoolGroups]);

  const totalTreesCarpoolSavings = useMemo(() => {
    return carpoolGroups.reduce((sum, g) => sum + g.treesSaved, 0);
  }, [carpoolGroups]);

  if (!mounted) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading Peer Carpool Matcher...
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold text-slate-900">
              4-Seat Peer Carpool Matcher
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Matching students and faculty within <strong>3 km radius</strong> arriving within <strong>30 minutes</strong> of each other.
          </p>
        </div>

        <Link
          href="/log"
          className="inline-flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-green-400" />
          <span>Add Me To The Pool</span>
        </Link>
      </div>

      {/* Aggregate Match Impact Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-bold uppercase tracking-wider text-amber-100">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Campus Carpool Potential</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            {carpoolGroups.length} Active Carpool Clusters Identified
          </h2>
          <p className="text-sm text-amber-100 leading-relaxed">
            If all matched groups share 1 vehicle instead of commuting separately, campus emissions drop by:
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shrink-0">
          <div>
            <span className="text-xs text-amber-100 block">Weekly Savings</span>
            <span className="text-2xl font-black text-white">
              {totalWeeklyCarpoolSavings.toFixed(0)} kg CO₂
            </span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <span className="text-xs text-amber-100 block">Tree Offset Equivalent</span>
            <span className="text-2xl font-black text-green-200">
              🌲 {totalTreesCarpoolSavings.toFixed(0)} trees/yr
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
            Filter by Neighborhood:
          </span>
          <select
            value={selectedNeighborhood}
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredGroups.length} match groups
        </span>
      </div>

      {/* Carpool Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGroups.map((group, idx) => (
          <div
            key={group.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-amber-400 transition space-y-5 flex flex-col justify-between"
          >
            <div>
              {/* Group Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                      Cluster #{idx + 1}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">
                      {group.neighborhoodHub}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center mt-1 space-x-2">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Arrival ~{group.targetArrival}
                    </span>
                    <span>•</span>
                    <span>{group.members.length} / 4 seats filled</span>
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Car className="w-5 h-5" />
                </div>
              </div>

              {/* Members List */}
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Matched Peers:
                </span>
                <div className="space-y-1.5">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block leading-tight">
                            {member.name}
                          </span>
                          <span className="text-[10px] text-slate-500 capitalize">
                            {member.role} • {member.neighborhood}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-600 block">
                          Current: {EMISSION_FACTORS[member.mode]?.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {member.weeklyKgCO2} kg CO₂/wk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Savings Box */}
            <div className="pt-3 border-t border-slate-100 bg-amber-50/60 -mx-6 -mb-6 p-5 rounded-b-2xl border-t border-amber-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Separate Trips:</span>
                <span className="line-through text-slate-400 font-mono">
                  {group.baselineWeeklyKg} kg/wk
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Shared 4-Seat Car:</span>
                <span className="font-mono">{group.sharedWeeklyKg} kg/wk</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
                <span className="text-xs font-extrabold text-green-700">
                  Weekly Group CO₂ Saved:
                </span>
                <span className="text-sm font-extrabold text-green-700 font-mono">
                  -{group.weeklySavedKg} kg CO₂
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 text-right font-medium">
                🌲 Offsets <strong>{group.treesSaved} trees</strong> annually
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
