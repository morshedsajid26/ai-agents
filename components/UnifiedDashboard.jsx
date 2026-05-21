"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDashboard } from "./DashboardContext";
import { useToast } from "./Toast";
import {
  HistoryIcon,
  LightningIcon,
  PaperclipIcon,
  CollaborateIcon,
  FileIcon,
  QuoteIcon,
  BotIcon,
  GuideIcon,
  AlternateIcon,
  PromptIcon,
} from "./Icons";
import SystemPromptView from "./SystemPromptView";
import FiverrBotView from "./FiverrBotView";
import ServiceGuideView from "./ServiceGuideView";
import AlternativeGuideView from "./AlternativeGuideView";

export default function UnifiedDashboard({ defaultTab }) {
  const { addToast } = useDashboard();
  const chatEndRef = useRef(null);

  const {
    activeTab,
    setActiveTab,
    unreadTabs,
    markTabAsRead,
    promptText,
    setPromptText,
    status,
    statusColor,
    lastSynced,
    showHistory,
    setShowHistory,
    isTyping,
    attachedFiles,
    botStatus,
    history,
    messages,
    handleSaveDraft,
    handleSendMessage,
    handleQuickDeploy,
    attachFile,
  } = useDashboard();

  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  // Sync default tab if passed from individual page loaders
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
      markTabAsRead(defaultTab);
    }
  }, [defaultTab]);

  // Keep scroll focused on the newest messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTab, messages, isTyping]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    markTabAsRead(tabId);
  };

  const toggleAttachment = (fileName) => {
    attachFile(fileName);
    setShowAttachmentMenu(false);
  };

  const tabsList = [
    { id: "system-prompt", label: "System Prompt", icon: PromptIcon },
    { id: "fiverr-bot", label: "Fiverr Sales Bot", icon: BotIcon },
    { id: "service-guide", label: "Service Guide", icon: GuideIcon },
    { id: "alternative-guide", label: "Alternative Guide", icon: AlternateIcon },
  ];

  // Dynamic headers tailored to each tab
  const renderHeader = () => {
    switch (activeTab) {
      case "system-prompt":
        return (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-4 animate-fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-100">
                System Prompt
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-550 dark:text-slate-400">
                Define the core behavior and intelligence guidelines of your sales assistant.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 text-xxs sm:text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:shadow-xxs transition-all duration-200 cursor-pointer"
              >
                <HistoryIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>View History</span>
              </button>
              <button
                onClick={handleQuickDeploy}
                className="flex items-center gap-2 px-3 py-2 bg-[#0f172a] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xxs sm:text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
              >
                <LightningIcon className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>Quick Deploy</span>
              </button>
            </div>
          </div>
        );
      case "fiverr-bot":
        return (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-4 animate-fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-100">
                Fiverr Sales Bot
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-550 dark:text-slate-400">
                Chat with the auto-responder agent to modify behavior or verify lead status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-550 font-semibold">
                Bot State:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xxs font-bold rounded-full ${botStatus === "Active"
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/40"
                    : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-250 dark:border-amber-900/40"
                  }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${botStatus === "Active"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-amber-500"
                    }`}
                />
                {botStatus}
              </span>
            </div>
          </div>
        );
      case "service-guide":
        return (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-4 animate-fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-100">
                Service Guide
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-550 dark:text-slate-400">
                Review and adjust onboarding sequences, dispatch check rules, and execution standards.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/50 text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wide">
                OFFICIAL PROTOCOLS
              </span>
            </div>
          </div>
        );
      case "alternative-guide":
        return (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-4 animate-fade-in">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-100">
                Alternative Guide
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-550 dark:text-slate-400">
                Review secondary protocols, backup drafts, and automated edge-case configurations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-250 dark:border-purple-900/50 text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wide">
                BACKUP DIRECTIVES
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative animate-fade-in">
      {/* Tab Menu Header Section */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 mb-5 gap-1 overflow-x-auto select-none pb-px shrink-0 scrollbar-none">
        {tabsList.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasUnread = unreadTabs[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap outline-none ${isActive
                  ? "border-[#4f46e5] text-[#4f46e5] dark:border-blue-500 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
            >
              <TabIcon className={`w-4 h-4 ${isActive ? "text-[#4f46e5] dark:text-blue-400" : "text-slate-450 dark:text-slate-500"}`} />
              <span>{tab.label}</span>
              {hasUnread && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-xs" />
              )}
            </button>
          );
        })}
      </div>

      {/* Header section based on current active tab */}
      {renderHeader()}

      {/* Main Messages scroll view */}
      <div className="flex-1 rounded-xl p-4 sm:p-6 flex flex-col min-h-[50px] mb-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 relative">

        {/* Revision History Overlay (System Prompt view only) */}
        {activeTab === "system-prompt" && showHistory && (
          <div className="absolute top-4 right-4 z-20 w-72 sm:w-80 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg space-y-4 max-h-[220px] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Revision History
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600 text-xxs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              {history.map((rev) => (
                <div
                  key={rev.id}
                  className="p-2.5 rounded bg-slate-50 dark:bg-[#161f30] text-xxs leading-relaxed border border-slate-100 dark:border-slate-850"
                >
                  <div className="flex justify-between text-slate-400 dark:text-slate-500 font-bold mb-1">
                    <span>Draft #{rev.id.toString().slice(-4)}</span>
                    <span>{rev.time}</span>
                  </div>
                  <p className="text-slate-650 dark:text-slate-300 font-medium italic">
                    "{rev.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation List / Document Display */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 scrollbar-thin">
          {activeTab === "system-prompt" ? (
            <SystemPromptView />
          ) : activeTab === "fiverr-bot" ? (
            <FiverrBotView />
          ) : activeTab === "service-guide" ? (
            <ServiceGuideView />
          ) : (
            <AlternativeGuideView />
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Attached Files Indicator */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-[80%] mt-2 mb-1">
            {attachedFiles.map((file) => (
              <span
                key={file}
                className="bg-blue-50 dark:bg-blue-950/40 text-[#2563eb] dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40 flex items-center gap-1 shadow-xxs animate-fade-in"
              >
                <FileIcon className="w-2.5 h-2.5" />
                {file}
              </span>
            ))}
          </div>
        )}

        {/* Prompt Update Input Interface (Universal) */}
        <form
          onSubmit={handleSendMessage}
          className="w-full max-w-2xl mx-auto bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-md p-4 space-y-4 hover:shadow-lg transition-all duration-300 mt-4"
        >
          {/* Top Row actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 relative">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20 flex items-center justify-center text-[#4f46e5] dark:text-[#818cf8]">
                <FileIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Attach context button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f1f5f9] dark:bg-[#1e293b] text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg cursor-pointer transition-colors duration-150"
                >
                  <PaperclipIcon className="w-3 h-3 text-slate-500" />
                  <span>ATTACH CONTEXT</span>
                </button>

                {/* Attachment Context menu */}
                {showAttachmentMenu && (
                  <div className="absolute right-0 bottom-10 z-35 w-52 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-lg p-2 shadow-lg text-[10px] space-y-1">
                    <p className="font-bold text-slate-400 p-1">Choose Service Guides</p>
                    <button
                      type="button"
                      onClick={() => toggleAttachment("Initial_Intake_Form.pdf")}
                      className={`w-full text-left p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 cursor-pointer ${attachedFiles.includes("Initial_Intake_Form.pdf")
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : ""
                        }`}
                    >
                      Initial_Intake_Form.pdf
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAttachment("Welcome_Sequence.pdf")}
                      className={`w-full text-left p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 cursor-pointer ${attachedFiles.includes("Welcome_Sequence.pdf")
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : ""
                        }`}
                    >
                      Welcome_Sequence.pdf
                    </button>
                  </div>
                )}
              </div>

              {/* Collaborate button */}
              <button
                type="button"
                onClick={() => addToast("Collaboration lobby link copied to clipboard!", "success")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f1f5f9] dark:bg-[#1e293b] text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg cursor-pointer transition-colors duration-150"
              >
                <CollaborateIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>COLLABORATE</span>
              </button>
            </div>
          </div>

          {/* Input textarea */}
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type instructions to update the system prompt... (e.g. 'Adjust the tone to be more technical but approachable')"
            className="w-full text-xs text-slate-700 dark:text-slate-300 placeholder-slate-450 dark:placeholder-slate-500 bg-transparent outline-none border-none resize-none h-16 scrollbar-thin"
          />

          {/* Footer buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-650 transition-colors duration-150 cursor-pointer"
              >
                <FileIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-650 transition-colors duration-150 cursor-pointer"
              >
                <QuoteIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
              >
                <span>Run Update</span>
                <span className="text-[10px]">➔</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
