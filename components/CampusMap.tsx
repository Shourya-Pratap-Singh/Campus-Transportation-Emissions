"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CommuterRecord } from "@/lib/sample-data";

interface CampusMapProps {
  commuters: CommuterRecord[];
}

// Dynamically import the real Leaflet component to prevent Next.js SSR window errors
const DynamicMap = dynamic(() => import("./CampusMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500 border border-slate-200">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Initializing Campus Commute Map...</p>
      <span className="text-xs text-slate-400">Loading Bengaluru geographic boundaries & Leaflet tiles</span>
    </div>
  ),
});

export default function CampusMap({ commuters }: CampusMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[450px] bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
        Loading Map View...
      </div>
    );
  }

  return <DynamicMap commuters={commuters} />;
}
