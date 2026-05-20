"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("light");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar on mobile/tablet screens initially after loading on client
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Sync dark mode class on html tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Determine activeTab depending on pathname
  const getActiveTab = () => {
    if (pathname === "/") return "fiverr-bot";
    if (pathname.startsWith("/service-guide")) return "service-guide";
    if (pathname.startsWith("/alternative-guide")) return "alternative-guide";
    if (pathname.startsWith("/system-prompt")) return "system-prompt";
    return "fiverr-bot";
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] dark:bg-[#070a13] font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      {/* Mobile Sidebar backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 xl:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main panel */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Topbar header */}
        <Topbar
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Main page body - fixed height container with inner scrolling */}
        <main className="flex-1 overflow-hidden px-4 pt-4 pb-2 sm:px-8 sm:pt-6 sm:pb-3 bg-[#f8fafc] dark:bg-[#070a13] transition-colors duration-300 flex flex-col min-h-0">
          <div className="mx-auto w-full flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
