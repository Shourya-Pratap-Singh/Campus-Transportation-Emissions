"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  TrendingDown,
  TreePine,
  Car,
  MapPin,
  Info,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  getAllCommuterRecords,
  CommuterRecord,
} from "@/lib/sample-data";
import {
  EMISSION_FACTORS,
  TransportMode,
} from "@/lib/emission-factors";
import { CAMPUS_CONFIG } from "@/lib/campus-config";
import CampusMap from "@/components/CampusMap";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export default function CampusDashboardPage() {
  const [commuters, setCommuters] = useState<CommuterRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCommuters(getAllCommuterRecords());
  }, []);

  // Aggregated Stats
  const totalCommuters = commuters.length;
  const totalWeeklyKg = useMemo(
    () => commuters.reduce((a, b) => a + b.weeklyKgCO2, 0),
    [commuters]
  );
  const totalAnnualTonnes = useMemo(
    () => ((totalWeeklyKg * 52) / 1000).toFixed(1),
    [totalWeeklyKg]
  );
  const totalTreesNeeded = useMemo(
    () => commuters.reduce((a, b) => a + b.treesNeeded, 0),
    [commuters]
  );
  const avgWeeklyPerCommuter = useMemo(
    () => (totalCommuters > 0 ? (totalWeeklyKg / totalCommuters).toFixed(1) : "0"),
    [totalWeeklyKg, totalCommuters]
  );

  // Modal Share Breakdown (for Pie Chart)
  const modalShareData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of commuters) {
      counts[c.mode] = (counts[c.mode] || 0) + 1;
    }

    return Object.entries(counts).map(([mode, count]) => {
      const meta = EMISSION_FACTORS[mode as TransportMode];
      return {
        name: meta?.label || mode,
        value: count,
        percentage: ((count / (totalCommuters || 1)) * 100).toFixed(1),
        color: meta?.color || "#94a3b8",
      };
    });
  }, [commuters, totalCommuters]);

  // Emissions by Mode Breakdown (for Bar Chart)
  const emissionsByModeData = useMemo(() => {
    const modeEmissions: Record<string, number> = {};
    for (const c of commuters) {
      modeEmissions[c.mode] = (modeEmissions[c.mode] || 0) + c.weeklyKgCO2;
    }

    return Object.entries(modeEmissions)
      .map(([mode, weeklyKg]) => {
        const meta = EMISSION_FACTORS[mode as TransportMode];
        return {
          modeLabel: meta?.label || mode,
          weeklyKg: Number(weeklyKg.toFixed(1)),
          annualKg: Number((weeklyKg * 52).toFixed(1)),
          color: meta?.color || "#94a3b8",
        };
      })
      .sort((a, b) => b.weeklyKg - a.weeklyKg);
  }, [commuters]);

  // Neighborhood Rankings
  const topNeighborhoods = useMemo(() => {
    const map = new Map<
      string,
      {
        neighborhood: string;
        commutersCount: number;
        totalWeeklyKg: number;
        avgDistanceKm: number;
        treesNeeded: number;
      }
    >();

    for (const c of commuters) {
      const existing = map.get(c.neighborhood);
      if (!existing) {
        map.set(c.neighborhood, {
          neighborhood: c.neighborhood,
          commutersCount: 1,
          totalWeeklyKg: c.weeklyKgCO2,
          avgDistanceKm: c.oneWayDistanceKm,
          treesNeeded: c.treesNeeded,
        });
      } else {
        existing.commutersCount += 1;
        existing.totalWeeklyKg += c.weeklyKgCO2;
        existing.avgDistanceKm = (existing.avgDistanceKm + c.oneWayDistanceKm) / 2;
        existing.treesNeeded += c.treesNeeded;
      }
    }

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        totalWeeklyKg: Number(item.totalWeeklyKg.toFixed(1)),
        avgDistanceKm: Number(item.avgDistanceKm.toFixed(1)),
        treesNeeded: Number(item.treesNeeded.toFixed(0)),
      }))
      .sort((a, b) => b.totalWeeklyKg - a.totalWeeklyKg);
  }, [commuters]);

  if (!mounted) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading Campus Emissions Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header with Title and Mandatory Sample Data Label */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Campus-Wide Emissions Dashboard
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Aggregated Scope 3 transportation analytics for {CAMPUS_CONFIG.name} ({CAMPUS_CONFIG.city})
          </p>
        </div>

        {/* Required Banner Label per Section 4 */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold shadow-sm">
          <Info className="w-4 h-4 text-amber-700" />
          <span>Sample data for demonstration</span>
        </div>
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Commuters</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalCommuters}</div>
          <p className="text-xs text-slate-500 mt-1">Students, faculty & staff</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Weekly Campus Emissions</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-black text-red-600">
            {totalWeeklyKg.toFixed(0)}{" "}
            <span className="text-sm font-normal text-slate-500">kg CO₂</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Avg {avgWeeklyPerCommuter} kg CO₂ / person</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Carbon Output</span>
            <Car className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {totalAnnualTonnes}{" "}
            <span className="text-sm font-normal text-slate-500">tonnes CO₂</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Equivalent to ~{(Number(totalAnnualTonnes) * 4.2).toFixed(0)} barrels of oil</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Trees Required to Offset</span>
            <TreePine className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-3xl font-black text-green-700">
            {totalTreesNeeded.toFixed(0)}{" "}
            <span className="text-sm font-normal text-slate-500">trees/yr</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Based on 21.77 kg CO₂/tree rate</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Modal Share Donut Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Commute Modal Breakdown</h2>
            </div>
            <span className="text-xs text-slate-500">By commuter count</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modalShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {modalShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [
                    `${value} commuters (${(item as { payload: { percentage: string } }).payload.percentage}%)`,
                    String(name),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2">
            {modalShareData.map((d) => (
              <div key={d.name} className="flex items-center space-x-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-slate-600 truncate">
                  {d.name}: <strong>{d.value}</strong> ({d.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Emissions by Mode Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-slate-900">Emissions by Travel Mode</h2>
            </div>
            <span className="text-xs text-slate-500">kg CO₂ / week</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emissionsByModeData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <XAxis
                  dataKey="modeLabel"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} kg CO₂/week`, "Emissions"]}
                />
                <Bar dataKey="weeklyKg" radius={[4, 4, 0, 0]}>
                  {emissionsByModeData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Leaflet Map Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Geographic Commute Map</h2>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-1 inline-block" /> High Emission
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-amber-500 mr-1 inline-block" /> Medium
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-1 inline-block" /> Low
            </span>
          </div>
        </div>

        <CampusMap commuters={commuters} />
      </div>

      {/* Top High-Emission Neighborhoods Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">High-Emission Neighborhoods</h2>
            <p className="text-xs text-slate-500">
              Target localities for campus shuttle routing and organized carpool pools
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Neighborhood</th>
                <th className="py-3 px-4">Commuters</th>
                <th className="py-3 px-4">Avg Distance</th>
                <th className="py-3 px-4">Weekly Emissions</th>
                <th className="py-3 px-4">Trees to Offset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topNeighborhoods.slice(0, 8).map((nh, idx) => (
                <tr key={nh.neighborhood} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">#{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{nh.neighborhood}</td>
                  <td className="py-3 px-4">{nh.commutersCount} commuters</td>
                  <td className="py-3 px-4">{nh.avgDistanceKm} km</td>
                  <td className="py-3 px-4 font-bold text-red-600">
                    {nh.totalWeeklyKg} kg CO₂
                  </td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">
                    🌲 {nh.treesNeeded} trees/yr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
