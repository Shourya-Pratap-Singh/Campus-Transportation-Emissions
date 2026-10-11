import { CAMPUS_CONFIG } from "./campus-config";

export type TransportMode =
  | "car_petrol"
  | "car_diesel"
  | "two_wheeler"
  | "auto"
  | "bus"
  | "metro"
  | "ev_car"
  | "ev_two_wheeler"
  | "bicycle"
  | "walk";

export interface ModeMetadata {
  id: TransportMode;
  label: string;
  category: "Private Vehicle" | "Public Transit" | "Electric" | "Active Travel";
  factorKgCO2PerPkm: number;
  source: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export const EMISSION_FACTORS: Record<TransportMode, ModeMetadata> = {
  car_petrol: {
    id: "car_petrol",
    label: "Car (Petrol)",
    category: "Private Vehicle",
    factorKgCO2PerPkm: 0.17,
    source: "Indian sub-compact/compact petrol passenger cars with average occupancy",
    color: "#dc2626", // Red
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
  },
  car_diesel: {
    id: "car_diesel",
    label: "Car (Diesel)",
    category: "Private Vehicle",
    factorKgCO2PerPkm: 0.17,
    source: "Indian compact diesel passenger cars with average occupancy",
    color: "#b91c1c", // Dark Red
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
  },
  two_wheeler: {
    id: "two_wheeler",
    label: "Motorcycle / Scooter",
    category: "Private Vehicle",
    factorKgCO2PerPkm: 0.10,
    source: "Indian two-wheeler ICE average commute emissions",
    color: "#f97316", // Orange
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
  },
  auto: {
    id: "auto",
    label: "Auto-Rickshaw",
    category: "Public Transit",
    factorKgCO2PerPkm: 0.08,
    source: "Indian urban three-wheeler average passenger-km",
    color: "#eab308", // Yellow
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
  },
  bus: {
    id: "bus",
    label: "BMTC City Bus",
    category: "Public Transit",
    factorKgCO2PerPkm: 0.09,
    source: "Urban city bus with typical passenger load factors (40–60 passengers)",
    color: "#3b82f6", // Blue
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
  },
  metro: {
    id: "metro",
    label: "Namma Metro",
    category: "Public Transit",
    factorKgCO2PerPkm: 0.04,
    source: "Bengaluru electric rail using India Central Electricity Authority grid factor",
    color: "#8b5cf6", // Purple
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
  },
  ev_car: {
    id: "ev_car",
    label: "EV Car",
    category: "Electric",
    factorKgCO2PerPkm: 0.09,
    source: "Battery electric passenger car accounting for India grid generation mix",
    color: "#06b6d4", // Cyan
    badgeBg: "bg-cyan-100",
    badgeText: "text-cyan-800",
  },
  ev_two_wheeler: {
    id: "ev_two_wheeler",
    label: "EV Scooter / Two-Wheeler",
    category: "Electric",
    factorKgCO2PerPkm: 0.03,
    source: "Lightweight battery electric scooter with India grid generation mix",
    color: "#10b981", // Emerald
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
  bicycle: {
    id: "bicycle",
    label: "Bicycle",
    category: "Active Travel",
    factorKgCO2PerPkm: 0.00,
    source: "Active non-motorized transport (Zero Direct Emissions)",
    color: "#22c55e", // Green
    badgeBg: "bg-green-100",
    badgeText: "text-green-800",
  },
  walk: {
    id: "walk",
    label: "Walk / Pedestrian",
    category: "Active Travel",
    factorKgCO2PerPkm: 0.00,
    source: "Active non-motorized transport (Zero Direct Emissions)",
    color: "#16a34a", // Deep green
    badgeBg: "bg-green-100",
    badgeText: "text-green-800",
  },
};

/**
 * Calculates straight line distance using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Computes estimated road distance multiplying by urban winding factor (1.3)
 */
export function calculateRoadDistance(
  lat1: number,
  lon1: number,
  lat2: number = CAMPUS_CONFIG.latitude,
  lon2: number = CAMPUS_CONFIG.longitude,
  factor: number = CAMPUS_CONFIG.roadWindingFactor
): number {
  const haversine = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  return Number((haversine * factor).toFixed(2));
}

/**
 * Weekly round-trip distance (2 trips per day * D road km * N days)
 */
export function calculateWeeklyDistance(
  oneWayRoadKm: number,
  daysPerWeek: number
): number {
  return Number((2 * oneWayRoadKm * daysPerWeek).toFixed(2));
}

/**
 * Weekly CO2 emissions in kg
 */
export function calculateWeeklyEmissions(
  oneWayRoadKm: number,
  daysPerWeek: number,
  mode: TransportMode
): number {
  const weeklyKm = calculateWeeklyDistance(oneWayRoadKm, daysPerWeek);
  const factor = EMISSION_FACTORS[mode]?.factorKgCO2PerPkm ?? 0.17;
  return Number((weeklyKm * factor).toFixed(2));
}

/**
 * Annual CO2 emissions (Weekly * 52 weeks)
 */
export function calculateAnnualEmissions(weeklyKgCO2: number): number {
  return Number((weeklyKgCO2 * 52).toFixed(2));
}

/**
 * Equivalent number of mature trees required for annual carbon sequestration
 * Formula: Annual CO2 (kg) / 21.77
 */
export function calculateTreesNeeded(annualKgCO2: number): number {
  return Number(
    (annualKgCO2 / CAMPUS_CONFIG.treeSequestrationPerYearKg).toFixed(1)
  );
}

/**
 * Calculates emissions savings when switching from a baseline mode to an alternative
 */
export function calculatePotentialSavings(
  oneWayRoadKm: number,
  daysPerWeek: number,
  baselineMode: TransportMode,
  targetMode: TransportMode
): {
  weeklySavedKg: number;
  annualSavedKg: number;
  treesSaved: number;
  percentageReduction: number;
} {
  const currentWeekly = calculateWeeklyEmissions(oneWayRoadKm, daysPerWeek, baselineMode);
  const targetWeekly = calculateWeeklyEmissions(oneWayRoadKm, daysPerWeek, targetMode);
  const weeklySavedKg = Math.max(0, Number((currentWeekly - targetWeekly).toFixed(2)));
  const annualSavedKg = Number((weeklySavedKg * 52).toFixed(2));
  const treesSaved = calculateTreesNeeded(annualSavedKg);
  const percentageReduction =
    currentWeekly > 0 ? Math.round((weeklySavedKg / currentWeekly) * 100) : 0;

  return {
    weeklySavedKg,
    annualSavedKg,
    treesSaved,
    percentageReduction,
  };
}
