"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import { SearchIcon, HelpIcon, SunIcon, MoonIcon } from "./Icons";

export default function Topbar({ activeTab, searchQuery, setSearchQuery, onMenuClick }) {
  const { theme, toggleTheme, profile } = useDashboard();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Dynamic search input placeholder based on active tab
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "dashboard":
        return "Search leads, bots, or documentation...";
      case "fiverr-bot":
        return "Search interactions or clients...";
      case "service-guide":
        return "Search service documentation...";
      case "system-prompt":
        return "Search prompts...";
      case "alternative-guide":
        return "Search alternate guides...";
      default:
        return "Search...";
    }
  };

  // Render profile section matching the screenshots dynamically
  const renderProfileSection = () => {
    const avatarUrl = profile.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120";

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200/80 dark:border-slate-800 shrink-0">
            <img
              src={avatarUrl}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800"
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
              {profile.name}
            </span>
          </div>
        );

      case "fiverr-bot":
        return (
          <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200/80 dark:border-slate-800 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">
                {profile.name}
              </p>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                Account Manager
              </p>
            </div>
            <img
              src={avatarUrl}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800"
            />
          </div>
        );

      case "service-guide":
      case "system-prompt":
      default:
        return (
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={avatarUrl}
              alt="User profile"
              className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-850 shadow-xs"
            />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
              {profile.name}
            </span>
          </div>
        );
    }
  };

  return (
    <header className="h-[76px] bg-white dark:bg-[#0b0f19] border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-8 select-none shrink-0 transition-colors duration-300 gap-4">
      
      {/* Left section: Hamburger (mobile) + Search bar */}
      <div className="flex items-center gap-3.5 flex-1 max-w-md">
        {/* Hamburger Menu Icon for Mobile */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <SearchIcon className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full bg-[#f1f5f9] dark:bg-[#161f30] text-slate-800 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-500 text-sm sm:text-sm rounded-lg pl-9 pr-3 py-2 border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-[#0f172a] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Action Icons and Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 relative" ref={dropdownRef}>
        {/* Light/Dark Toggle Button (replacing notification button) */}
        <button
          onClick={toggleTheme}
          className="text-slate-400 dark:text-slate-555 hover:text-slate-705 dark:hover:text-slate-355 p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <SunIcon className="w-5 h-5 text-amber-500 animate-spin-slow" />
          ) : (
            <MoonIcon className="w-5 h-5 text-slate-400 dark:text-slate-550" />
          )}
        </button>

        {/* Help/FAQ Icon - Hidden on very small screens to fit layout */}
        <button className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer hidden xs:block">
          <HelpIcon className="w-5 h-5" />
        </button>

        {/* Dynamic Profile Section */}
        <div 
          onClick={handleDropdownToggle}
          className="cursor-pointer select-none active:scale-95 transition-transform"
        >
          {renderProfileSection()}
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-[52px] z-50 w-44 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-lg dark:border-slate-800/80 dark:bg-[#0f172a] animate-fade-in">
            <Link
              href="/settings"
              onClick={() => setIsDropdownOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Settings</span>
            </Link>
            <hr className="my-1 border-slate-100 dark:border-slate-800" />
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                
                if (typeof window !== "undefined") {
                  localStorage.clear();
                  sessionStorage.clear();
                  document.cookie.split(";").forEach((c) => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                  });
                }
                
                router.push("/login");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50/60 dark:text-rose-455 dark:hover:bg-rose-950/20 transition-colors cursor-pointer text-left"
            >
              <LogOut className="h-4 w-4 text-rose-550" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
