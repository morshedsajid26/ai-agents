"use client";

import React from "react";
import Link from "next/link";
import { useToast } from "./Toast";
import {
  DashboardIcon,
  BotIcon,
  GuideIcon,
  AlternateIcon,
  PromptIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  TrainingIcon,
} from "./Icons";

export default function Sidebar({
  activeTab,
  theme,
  toggleTheme,
  isOpen,
  setIsOpen,
}) {
  const { addToast } = useToast();
  const menuItems = [
    { id: "system-prompt", label: "System Prompt", icon: PromptIcon, href: "/" },
    { id: "agent-training", label: "Agent Training", icon: TrainingIcon, href: "/agent-training" },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile after selecting an item
    if (isOpen && window.innerWidth < 1280) {
      setIsOpen(false);
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 border-r border-slate-200/70 bg-white dark:bg-[#0b0f19] dark:border-slate-800/80 flex flex-col h-screen shrink-0 select-none transition-all duration-300 xl:static xl:translate-x-0 ${
        isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full xl:translate-x-0 xl:w-20"
      }`}
    >
      {/* Header / Branding (Fixed Logo) */}
      <div className={`h-[76px] flex items-center border-b border-slate-100/50 dark:border-slate-800/50 shrink-0 ${
        isOpen ? "justify-between px-6" : "justify-center px-2"
      }`}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e1726] text-white shadow-sm shrink-0">
              <BotIcon className="h-5 w-5" />
            </div>
            <div className="truncate">
              <h1 className="font-sans text-base font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
                Sales Assistant
              </h1>
              <p className="mt-1 font-sans text-xxs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                AI-Native CRM
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e1726] text-white shadow-sm mx-auto">
            <BotIcon className="h-5 w-5" />
          </div>
        )}

        {/* Close Button / Toggle Button */}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer shrink-0 ml-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 py-6 space-y-2 overflow-y-auto ${
        isOpen ? "px-3" : "px-2 flex flex-col items-center"
      }`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleLinkClick}
              title={!isOpen ? item.label : ""}
              className={`flex items-center rounded-lg text-sm font-medium tracking-wide transition-all duration-200 relative group cursor-pointer ${
                isOpen
                  ? "w-full gap-3.5 px-4 py-3 justify-start"
                  : "w-11 h-11 justify-center"
              } ${
                isActive
                  ? "bg-[#eef2ff] text-[#3b82f6] dark:bg-[#1e293b] dark:text-[#3b82f6]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {isActive && isOpen && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#3b82f6]" />
              )}
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "text-[#3b82f6]" : "text-slate-400 dark:text-slate-500"
                }`}
              />
              {isOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation */}
      <div className={`border-t border-slate-100 dark:border-slate-800/80 shrink-0 space-y-1 ${
        isOpen ? "p-3" : "py-3 px-1.5 flex flex-col items-center"
      }`}>
        <button
          onClick={() => addToast("Settings panel configuration open!", "info")}
          title={!isOpen ? "Settings" : ""}
          className={`flex items-center rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 cursor-pointer ${
            isOpen ? "w-full gap-3.5 px-4 py-3 justify-start" : "w-11 h-11 justify-center"
          }`}
        >
          <SettingsIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          {isOpen && <span>Settings</span>}
        </button>
        <button
          onClick={toggleTheme}
          title={!isOpen ? (theme === "dark" ? "Light Mode" : "Dark Mode") : ""}
          className={`flex items-center rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 transition-all duration-200 cursor-pointer ${
            isOpen ? "w-full gap-3.5 px-4 py-3 justify-start" : "w-11 h-11 justify-center"
          }`}
        >
          {theme === "dark" ? (
            <>
              <SunIcon className="w-5 h-5 text-amber-500 animate-spin-slow" />
              {isOpen && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <MoonIcon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              {isOpen && <span>Light/Dark</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
