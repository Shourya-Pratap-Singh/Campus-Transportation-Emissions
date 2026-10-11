"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  PlusCircle,
  User,
  LayoutDashboard,
  Users,
  Sliders,
  Menu,
  X,
  Leaf,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Overview", icon: Compass },
  { href: "/log", label: "Log Commute", icon: PlusCircle },
  { href: "/me", label: "My Footprint", icon: User },
  { href: "/campus", label: "Campus Dashboard", icon: LayoutDashboard },
  { href: "/carpool", label: "Peer Carpool", icon: Users },
  { href: "/simulator", label: "Policy Simulator", icon: Sliders },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#081849] text-white shadow-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-400/30 group-hover:bg-green-500/30 transition">
              <Leaf className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-tight">
                CampusCommute
              </span>
              <span className="text-xs text-blue-200 block font-normal">
                RVITM Bengaluru • Scope 3 Tracker
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-navy-700 text-white shadow-inner border border-blue-400/30"
                      : "text-blue-100 hover:bg-navy-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 text-blue-300" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-blue-200 hover:text-white hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900 border-b border-navy-700 px-4 pt-2 pb-4 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-navy-700 text-white border-l-4 border-green-400"
                    : "text-blue-100 hover:bg-navy-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 text-blue-300" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
