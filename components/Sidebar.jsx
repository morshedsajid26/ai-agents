"use client";

import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { useToast } from "./Toast";
import { useDashboard } from "./DashboardContext";
import {
  BotIcon,
  PromptIcon,
  TrainingIcon,
  HistoryIcon,
} from "./Icons";

export default function Sidebar({
  activeTab,
  isOpen,
  setIsOpen,
}) {
  const { addToast } = useToast();
  const { setActiveTab, history, setPromptText, profile } = useDashboard();

  const menuItems = [
    { id: "system-prompt", label: "System Prompt", icon: PromptIcon, href: "/" },
  ];

  if (profile?.role === "SYSTEM_OWNER") {
    menuItems.push(
      { id: "agent-training", label: "Agent Training", icon: TrainingIcon, href: "/agent-training" },
      { id: "user-management", label: "User Management", icon: Users, href: "/user-management" }
    );
  }

  const handleItemClick = (itemId) => {
    if (itemId === "system-prompt") {
      setActiveTab("system-prompt");
    }
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
        isOpen ? "px-6" : "justify-center px-2"
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
      </div>

      {/* Navigation Links */}
      <nav className={`py-6 space-y-2 overflow-y-auto ${
        activeTab === "system-prompt" && isOpen ? "" : "flex-1"
      } ${
        isOpen ? "px-3" : "px-2 flex flex-col items-center"
      }`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "system-prompt"
            ? (activeTab !== "agent-training" && activeTab !== "user-management" && activeTab !== "settings")
            : activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleItemClick(item.id)}
              title={!isOpen ? item.label : ""}
              className={`flex items-center rounded-lg text-sm font-medium tracking-wide transition-all duration-200 relative group cursor-pointer ${
                isOpen
                  ? "w-full gap-3.5 px-4 py-3 justify-start"
                  : "w-11 h-11 justify-center"
              } ${
                isActive
                  ? "bg-[#eef2ff] text-[#3b82f6] dark:bg-[#1e293b] dark:text-[#3b82f6]"
                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-205"
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

      {/* Recents list styled like ChatGPT */}
      {isOpen && activeTab === "system-prompt" && (
        <div className="mx-3 mb-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex-1 flex flex-col min-h-0 overflow-hidden select-none animate-fade-in">
          <div className="mb-3 px-3 text-slate-400 dark:text-slate-500 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider">
              Recents
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-1 space-y-1 scrollbar-thin">
            {history && history.map((rev) => (
              <button
                key={rev.id}
                onClick={() => {
                  setPromptText(rev.text);
                  addToast("Prompt loaded into editor!", "info");
                }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-[#eef2ff] dark:text-slate-350 dark:hover:bg-[#1e293b] hover:text-[#3b82f6] dark:hover:text-[#3b82f6] transition-all duration-150 text-left truncate cursor-pointer"
                title={rev.text}
              >
                <span className="truncate flex-1 font-medium">{rev.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Profile Section - Static display */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 shrink-0">
        <div
          className={`flex items-center gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
            isOpen ? "px-4" : "justify-center"
          }`}
        >
          <img
            src={profile.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120"}
            alt="User profile"
            className="w-8 h-8 rounded-full object-cover border border-slate-200/60 dark:border-slate-800 shadow-xs"
          />
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {profile.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium">
                {profile.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
