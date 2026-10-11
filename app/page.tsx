import Link from "next/link";
import {
  PlusCircle,
  User,
  LayoutDashboard,
  Users,
  Sliders,
  Leaf,
  MapPin,
  TrendingDown,
  ArrowRight,
  Car,
  TreePine,
} from "lucide-react";
import { CAMPUS_CONFIG } from "@/lib/campus-config";
import { BENCHMARK_COMMUTERS } from "@/lib/sample-data";

export default function HomePage() {
  const totalCommuters = BENCHMARK_COMMUTERS.length;
  const totalWeeklyEmissions = BENCHMARK_COMMUTERS.reduce((acc, c) => acc + c.weeklyKgCO2, 0);
  const totalAnnualEmissions = BENCHMARK_COMMUTERS.reduce((acc, c) => acc + c.annualKgCO2, 0);
  const totalTrees = BENCHMARK_COMMUTERS.reduce((acc, c) => acc + c.treesNeeded, 0);
  const avgWeeklyPerPerson = (totalWeeklyEmissions / totalCommuters).toFixed(1);

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#081849] via-navy-800 to-navy-900 text-white p-8 sm:p-12 shadow-xl border border-navy-700">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold tracking-wide uppercase">
            <Leaf className="w-3.5 h-3.5 text-green-400" />
            <span>Scope 3 Commuter Decarbonization Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Monitor, Mitigate & Decarbonize Campus Commutes.
          </h1>

          <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed">
            Designed specifically for universities to calculate round-trip transportation emissions,
            connect students for 4-seat shared carpools, and equip administrators with real-time policy
            simulations at <span className="font-semibold text-amber-300">{CAMPUS_CONFIG.name}</span>.
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <Link
              href="/log"
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Log Your Commute</span>
            </Link>
            <Link
              href="/campus"
              className="inline-flex items-center space-x-2 bg-navy-700 hover:bg-navy-600 text-blue-100 font-semibold px-5 py-3 rounded-xl border border-blue-400/20 transition"
            >
              <LayoutDashboard className="w-5 h-5 text-blue-300" />
              <span>Explore Campus Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Ambient Decorative element */}
        <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-20 w-60 h-60 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </section>

      {/* Campus Summary KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Campus Commuters</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalCommuters}</div>
          <p className="text-xs text-slate-500 mt-1">Seeded baseline cohort</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Weekly Emissions</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalWeeklyEmissions.toFixed(0)} <span className="text-sm font-normal text-slate-500">kg CO₂</span></div>
          <p className="text-xs text-slate-500 mt-1">Avg {avgWeeklyPerPerson} kg CO₂ / commuter</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Campus Total</span>
            <Car className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{(totalAnnualEmissions / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-500">tonnes CO₂</span></div>
          <p className="text-xs text-slate-500 mt-1">Scope 3 indirect footprint</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Trees to Offset</span>
            <TreePine className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalTrees.toFixed(0)} <span className="text-sm font-normal text-slate-500">trees/yr</span></div>
          <p className="text-xs text-slate-500 mt-1">At 21.77 kg CO₂ sequestration</p>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Interactive Modules</h2>
          <p className="text-sm text-slate-600">Access all student, faculty, and administrator tools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Log */}
          <Link
            href="/log"
            className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition">
                Log Your Commute
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Enter your home locality with Bengaluru Nominatim geocoding or quick presets. Instantly
                computes road distance with a 1.3 winding factor and round-trip emissions.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-sm font-semibold text-blue-700">
              <span>Open Commute Logger</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 2: Me */}
          <Link
            href="/me"
            className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition">
                Personal Carbon Card
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Review your weekly and annual kilograms of CO₂, see your equivalent mature trees
                requirement, compare against the campus average, and discover mode-shift savings.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-sm font-semibold text-emerald-700">
              <span>View Personal Card</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 3: Campus */}
          <Link
            href="/campus"
            className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-400 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-700 transition">
                Campus-Wide Dashboard
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Institutional analytics including modal shares, high-emission neighborhood rankings, and an
                interactive Leaflet map sized by geographic carbon generation.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-sm font-semibold text-indigo-700">
              <span>View Analytics & Map</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 4: Carpool */}
          <Link
            href="/carpool"
            className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-amber-700 transition">
                4-Seat Peer Carpool Matcher
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connects peers living within 3 km who arrive within 30 minutes. Computes exact shared-vehicle
                CO₂ savings when replacing 4 solo vehicles with 1 carpool.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-sm font-semibold text-amber-700">
              <span>Find Carpool Matches</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Card 5: Simulator */}
          <Link
            href="/simulator"
            className="group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-400 transition flex flex-col justify-between md:col-span-2 lg:col-span-2"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-purple-700 transition">
                What-If Policy Simulator
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Empower university sustainability officers to test intervention scenarios: simulate shifting
                solo car trips to BMTC bus transit and two-wheelers to carpooling, visualizing real-time emissions
                reductions and tree offsets.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-sm font-semibold text-purple-700">
              <span>Run Scenario Simulation</span>
              <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* Scientific Methodology Note */}
      <section className="bg-slate-100/80 rounded-xl p-6 border border-slate-200/80 text-slate-700">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-navy-800 shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm leading-relaxed">
            <h4 className="font-bold text-slate-900">
              Calculation Methodology & Standards
            </h4>
            <p>
              Distance is computed between origin coordinates and RVITM Bengaluru (12.8797°N, 77.5838°E)
              using the spherical <strong>Haversine formula</strong>, scaled by a <strong>1.3 road winding factor</strong> for
              Bengaluru road networks.
            </p>
            <p>
              Emissions factors follow standard Indian urban commute parameters (e.g., 0.17 kg CO₂/pkm for cars,
              0.10 for two-wheelers, 0.09 for BMTC bus, 0.04 for Namma Metro). Tree offset equivalence assumes
              <strong> 21.77 kg CO₂/year</strong> per mature urban tree.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
