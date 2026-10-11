import Link from "next/link";
import { Leaf, MapPin, ShieldCheck } from "lucide-react";
import { CAMPUS_CONFIG } from "@/lib/campus-config";

export default function Footer() {
  return (
    <footer className="bg-[#081849] text-blue-100 border-t border-navy-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center border border-green-400/30">
                <Leaf className="w-5 h-5 text-green-400" />
              </div>
              <span className="font-bold text-lg text-white">CampusCommute</span>
            </div>
            <p className="text-sm text-blue-200/80 max-w-md leading-relaxed">
              Decarbonizing university transportation through data-driven student & faculty travel logging,
              peer carpool clustering, and actionable Scope 3 institutional policy simulation.
            </p>
            <div className="flex items-center text-xs text-blue-300 space-x-2 pt-1">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{CAMPUS_CONFIG.name} — {CAMPUS_CONFIG.latitude}°N, {CAMPUS_CONFIG.longitude}°E</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/log" className="hover:text-white transition">
                  Log My Commute
                </Link>
              </li>
              <li>
                <Link href="/me" className="hover:text-white transition">
                  Personal Carbon Card
                </Link>
              </li>
              <li>
                <Link href="/campus" className="hover:text-white transition">
                  Campus-Wide Dashboard
                </Link>
              </li>
              <li>
                <Link href="/carpool" className="hover:text-white transition">
                  4-Seat Carpool Matcher
                </Link>
              </li>
              <li>
                <Link href="/simulator" className="hover:text-white transition">
                  Policy What-If Simulator
                </Link>
              </li>
            </ul>
          </div>

          {/* Benchmark Standards */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-3">
              Emission Factors
            </h4>
            <p className="text-xs text-blue-200/70 mb-2 leading-relaxed">
              Factors calibrated to Indian urban vehicular emission factors, BMTC diesel transit benchmarks,
              and Central Electricity Authority grid factors.
            </p>
            <div className="inline-flex items-center text-xs text-amber-300 bg-navy-800 px-2.5 py-1 rounded border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Tree Sequestration: 21.77 kg/yr</span>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/70">
          <p>© {new Date().getFullYear()} CampusCommute. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Built for sustainable academic institutions</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
