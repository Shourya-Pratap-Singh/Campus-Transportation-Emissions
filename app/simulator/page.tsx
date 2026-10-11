"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sliders,
  Bus,
  Users,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  getAllCommuterRecords,
  CommuterRecord,
} from "@/lib/sample-data";
import {
  EMISSION_FACTORS,
  calculateTreesNeeded,
} from "@/lib/emission-factors";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function PolicySimulatorPage() {
  const [commuters, setCommuters] = useState<CommuterRecord[]>([]);
  const [carToBusShiftPct, setCarToBusShiftPct] = useState<number>(40);
  const [bikeToCarpoolShiftPct, setBikeToCarpoolShiftPct] = useState<number>(30);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCommuters(getAllCommuterRecords());
  }, []);

  // Baseline Metrics
  const baseline = useMemo(() => {
    const weeklyKg = commuters.reduce((sum, c) => sum + c.weeklyKgCO2, 0);
    const annualKg = weeklyKg * 52;
    const trees = calculateTreesNeeded(annualKg);
    return {
      weeklyKg,
      annualKg,
      trees,
    };
  }, [commuters]);

  // Simulated Policy Calculations
  const simulation = useMemo(() => {
    let simulatedWeeklyKg = 0;
    let carsShiftedCount = 0;
    let bikesShiftedCount = 0;

    for (const c of commuters) {
      const weeklyKm = c.oneWayDistanceKm * 2 * c.daysPerWeek;

      if (c.mode === "car_petrol" || c.mode === "car_diesel") {
        // Car to Bus simulation
        const isShifted = Math.random() * 100 < carToBusShiftPct;
        if (isShifted) {
          // Bus factor is 0.09
          simulatedWeeklyKg += weeklyKm * EMISSION_FACTORS.bus.factorKgCO2PerPkm;
          carsShiftedCount++;
        } else {
          simulatedWeeklyKg += c.weeklyKgCO2;
        }
      } else if (c.mode === "two_wheeler") {
        // Two wheeler to 4-Seat Carpool simulation
        const isShifted = Math.random() * 100 < bikeToCarpoolShiftPct;
        if (isShifted) {
          // Carpool shared factor is 0.0425
          simulatedWeeklyKg += weeklyKm * 0.0425;
          bikesShiftedCount++;
        } else {
          simulatedWeeklyKg += c.weeklyKgCO2;
        }
      } else {
        // Other modes remain baseline
        simulatedWeeklyKg += c.weeklyKgCO2;
      }
    }

    const weeklySavedKg = Math.max(0, Number((baseline.weeklyKg - simulatedWeeklyKg).toFixed(1)));
    const annualSavedKg = Number((weeklySavedKg * 52).toFixed(1));
    const annualSavedTonnes = Number((annualSavedKg / 1000).toFixed(2));
    const treesSaved = calculateTreesNeeded(annualSavedKg);
    const reductionPct =
      baseline.weeklyKg > 0
        ? Math.round((weeklySavedKg / baseline.weeklyKg) * 100)
        : 0;

    return {
      simulatedWeeklyKg: Number(simulatedWeeklyKg.toFixed(1)),
      simulatedAnnualKg: Number((simulatedWeeklyKg * 52).toFixed(1)),
      simulatedTrees: calculateTreesNeeded(simulatedWeeklyKg * 52),
      weeklySavedKg,
      annualSavedKg,
      annualSavedTonnes,
      treesSaved,
      reductionPct,
      carsShiftedCount,
      bikesShiftedCount,
    };
  }, [commuters, carToBusShiftPct, bikeToCarpoolShiftPct, baseline]);

  // Comparison Bar Chart Data
  const chartData = useMemo(() => {
    return [
      {
        category: "Total Campus Scope 3",
        Baseline: Math.round(baseline.weeklyKg),
        Simulated: Math.round(simulation.simulatedWeeklyKg),
      },
      {
        category: "Solo Car Emissions",
        Baseline: Math.round(
          commuters
            .filter((c) => c.mode.startsWith("car"))
            .reduce((s, c) => s + c.weeklyKgCO2, 0)
        ),
        Simulated: Math.round(
          commuters
            .filter((c) => c.mode.startsWith("car"))
            .reduce((s, c) => s + c.weeklyKgCO2, 0) * (1 - carToBusShiftPct / 100)
        ),
      },
      {
        category: "Two-Wheeler Emissions",
        Baseline: Math.round(
          commuters
            .filter((c) => c.mode === "two_wheeler")
            .reduce((s, c) => s + c.weeklyKgCO2, 0)
        ),
        Simulated: Math.round(
          commuters
            .filter((c) => c.mode === "two_wheeler")
            .reduce((s, c) => s + c.weeklyKgCO2, 0) * (1 - bikeToCarpoolShiftPct / 100)
        ),
      },
    ];
  }, [commuters, baseline, simulation, carToBusShiftPct, bikeToCarpoolShiftPct]);

  if (!mounted) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading Policy Simulator...
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center space-x-2">
          <Sliders className="w-7 h-7 text-purple-600" />
          <h1 className="text-3xl font-extrabold text-slate-900">
            What-If Policy Simulator
          </h1>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Model campus-wide modal shift policies and evaluate instantaneous CO₂ reductions and tree savings.
        </p>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Sliders Control Panel */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          <div>
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Policy Levers & Targets
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust modal shift targets to model university transit policies
            </p>
          </div>

          {/* Lever 1: Car to Bus */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center">
                <Bus className="w-4 h-4 text-blue-600 mr-1.5" />
                Solo Car → BMTC Bus Transit
              </span>
              <span className="font-black text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded">
                {carToBusShiftPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={carToBusShiftPct}
              onChange={(e) => setCarToBusShiftPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Subsidized college bus passes or improved shuttle frequency for car drivers.
            </p>
          </div>

          {/* Lever 2: Two-wheeler to Carpool */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center">
                <Users className="w-4 h-4 text-amber-600 mr-1.5" />
                Two-Wheeler → 4-Seat Carpool
              </span>
              <span className="font-black text-amber-600 text-sm bg-amber-50 px-2 py-0.5 rounded">
                {bikeToCarpoolShiftPct}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={bikeToCarpoolShiftPct}
              onChange={(e) => setBikeToCarpoolShiftPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Designated priority campus parking spaces for 4-passenger student carpools.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Quick Policy Presets:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCarToBusShiftPct(20);
                  setBikeToCarpoolShiftPct(15);
                }}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Conservative
              </button>
              <button
                type="button"
                onClick={() => {
                  setCarToBusShiftPct(50);
                  setBikeToCarpoolShiftPct(35);
                }}
                className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold"
              >
                Moderate
              </button>
              <button
                type="button"
                onClick={() => {
                  setCarToBusShiftPct(80);
                  setBikeToCarpoolShiftPct(60);
                }}
                className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold"
              >
                Aggressive
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulation Outcomes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Headline Results Hero Card */}
          <div className="bg-gradient-to-br from-[#081849] to-navy-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-navy-700 space-y-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold uppercase tracking-wider border border-green-500/30">
                <Sparkles className="w-3.5 h-3.5 text-green-400" />
                <span>Simulated Institutional Impact</span>
              </div>
              <span className="text-xs text-blue-200">Weekly & Annual Savings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-xs text-blue-200 block uppercase font-medium">
                  Emissions Mitigated
                </span>
                <div className="text-3xl sm:text-4xl font-black text-green-400 mt-1">
                  -{simulation.reductionPct}%
                </div>
                <p className="text-xs text-blue-100/70 mt-1">
                  {simulation.weeklySavedKg} kg CO₂ saved / week
                </p>
              </div>

              <div>
                <span className="text-xs text-blue-200 block uppercase font-medium">
                  Annual Campus Reduction
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                  {simulation.annualSavedTonnes}{" "}
                  <span className="text-sm font-normal text-blue-300">tonnes</span>
                </div>
                <p className="text-xs text-blue-100/70 mt-1">
                  {simulation.annualSavedKg} kg CO₂ avoided
                </p>
              </div>

              <div>
                <span className="text-xs text-blue-200 block uppercase font-medium">
                  Equivalent Trees Preserved
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 mt-1">
                  🌲 {simulation.treesSaved}
                </div>
                <p className="text-xs text-blue-100/70 mt-1">
                  Forest offset avoided / year
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                Before vs. After Policy Implementation
              </h3>
              <span className="text-xs text-slate-500">kg CO₂ / week</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val) => [`${val} kg CO₂/wk`, ""]} />
                  <Legend />
                  <Bar dataKey="Baseline" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Policy Recommendations Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Recommended Administrative Actions
            </h3>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>
                  <strong>BMTC Student Bus Pass Desk:</strong> Partner with Bengaluru BMTC depot to issue discounted semester smart passes directly on campus during orientation.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Preferential Carpool Parking:</strong> Reserve the closest 20 campus vehicle parking slots exclusively for registered 4-passenger carpools.
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>
                  <strong>First/Last-Mile Metro Feeder:</strong> Deploy an electric mini-van feeder between the nearest Namma Metro station (Yelachenahalli / Konanakunte Cross) and RVITM.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
