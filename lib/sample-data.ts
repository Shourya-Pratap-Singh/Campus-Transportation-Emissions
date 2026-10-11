import {
  TransportMode,
  calculateRoadDistance,
  calculateWeeklyEmissions,
  calculateAnnualEmissions,
  calculateTreesNeeded,
} from "./emission-factors";
import { POPULAR_BENGALURU_LOCALITIES } from "./campus-config";

export interface CommuterRecord {
  id: string;
  name: string;
  role: "student" | "faculty" | "staff";
  neighborhood: string;
  lat: number;
  lng: number;
  mode: TransportMode;
  daysPerWeek: number;
  arrivalTime: string; // HH:mm
  oneWayDistanceKm: number;
  weeklyKgCO2: number;
  annualKgCO2: number;
  treesNeeded: number;
  createdAt: string;
  isUserLog?: boolean;
}

// Generates realistic 100 commuter benchmark dataset
function generateBenchmarkData(): CommuterRecord[] {
  const modalDistribution: { mode: TransportMode; count: number }[] = [
    { mode: "bus", count: 30 },            // 30% BMTC bus
    { mode: "two_wheeler", count: 24 },    // 24% Two-wheelers (ICE)
    { mode: "metro", count: 17 },          // 17% Namma Metro
    { mode: "car_petrol", count: 11 },     // 11% Petrol car
    { mode: "car_diesel", count: 4 },      // 4% Diesel car
    { mode: "auto", count: 5 },            // 5% Auto rickshaw
    { mode: "ev_two_wheeler", count: 4 },  // 4% EV scooter
    { mode: "ev_car", count: 2 },          // 2% EV car
    { mode: "bicycle", count: 2 },         // 2% Cycle
    { mode: "walk", count: 1 },            // 1% Walk
  ];

  const firstNames = [
    "Aarav", "Aditi", "Rohan", "Ananya", "Rahul", "Pooja", "Vikram", "Sneha", "Karthik", "Divya",
    "Arjun", "Meera", "Varun", "Kavya", "Siddharth", "Priya", "Nikhil", "Deepika", "Aditya", "Tanvi",
    "Gaurav", "Shruti", "Akash", "Swati", "Manoj", "Bhavna", "Harish", "Neha", "Prashanth", "Ritu",
    "Suresh", "Lakshmi", "Rajesh", "Sunita", "Dinesh", "Kavita", "Anand", "Shilpa", "Vinay", "Archana",
    "Mahesh", "Geeta", "Sanjay", "Padma", "Ramesh", "Usha", "Venkat", "Vidya", "Ashok", "Rekha",
    "Chethan", "Sowmya", "Kiran", "Nandini", "Pavan", "Jyothi", "Tejas", "Chaithra", "Sachin", "Preethi",
    "Abhishek", "Aishwarya", "Vishal", "Keerthi", "Naveen", "Madhuri", "Santosh", "Rashmi", "Ranjith", "Shwetha",
    "Pradeep", "Harini", "Girish", "Manjula", "Srinivas", "Roopa", "Sudhir", "Anusha", "Shankar", "Vandana",
    "Manjunath", "Pavithra", "Mohan", "Gayathri", "Sharath", "Pallavi", "Chandan", "Mamatha", "Prateek", "Meenakshi",
    "Lokesh", "Deepa", "Raghav", "Suma", "Bharath", "Sandhya", "Harsha", "Monika", "Yogesh", "Lavanya"
  ];

  const arrivalTimes = ["08:15", "08:30", "08:45", "09:00", "09:15", "09:30"];
  const roles: ("student" | "faculty" | "staff")[] = ["student", "student", "student", "faculty", "staff"];

  const records: CommuterRecord[] = [];
  let nameIndex = 0;

  for (const group of modalDistribution) {
    for (let i = 0; i < group.count; i++) {
      const locality = POPULAR_BENGALURU_LOCALITIES[(nameIndex + i * 3) % POPULAR_BENGALURU_LOCALITIES.length];
      // small jitter for coordinates
      const latJitter = (Math.sin(nameIndex * 11) * 0.008);
      const lngJitter = (Math.cos(nameIndex * 7) * 0.008);
      const lat = locality.lat + latJitter;
      const lng = locality.lng + lngJitter;

      const oneWayKm = calculateRoadDistance(lat, lng);
      // students 5-6 days, faculty 5 days
      const daysPerWeek = group.mode === "walk" ? 6 : (5 + (nameIndex % 2));
      const weeklyKg = calculateWeeklyEmissions(oneWayKm, daysPerWeek, group.mode);
      const annualKg = calculateAnnualEmissions(weeklyKg);
      const trees = calculateTreesNeeded(annualKg);
      const arrival = arrivalTimes[(nameIndex * 2 + i) % arrivalTimes.length];
      const role = roles[nameIndex % roles.length];

      records.push({
        id: `bench-${nameIndex + 1}`,
        name: firstNames[nameIndex % firstNames.length],
        role,
        neighborhood: locality.name.split(",")[0],
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        mode: group.mode,
        daysPerWeek,
        arrivalTime: arrival,
        oneWayDistanceKm: oneWayKm,
        weeklyKgCO2: weeklyKg,
        annualKgCO2: annualKg,
        treesNeeded: trees,
        createdAt: "2026-10-01T08:00:00.000Z",
      });

      nameIndex++;
    }
  }

  return records;
}

export const BENCHMARK_COMMUTERS: CommuterRecord[] = generateBenchmarkData();

const LOCAL_STORAGE_KEY = "campus_commute_user_logs_v1";

export function getStoredUserCommutes(): CommuterRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read user logs from localStorage", e);
    return [];
  }
}

export function saveUserCommute(record: Omit<CommuterRecord, "id" | "createdAt" | "isUserLog">): CommuterRecord {
  const newRecord: CommuterRecord = {
    ...record,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
    isUserLog: true,
  };

  if (typeof window !== "undefined") {
    try {
      const current = getStoredUserCommutes();
      const updated = [newRecord, ...current];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save commute to localStorage", e);
    }
  }

  return newRecord;
}

export function getAllCommuterRecords(): CommuterRecord[] {
  const userRecords = getStoredUserCommutes();
  return [...userRecords, ...BENCHMARK_COMMUTERS];
}
