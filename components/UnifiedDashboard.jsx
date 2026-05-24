"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDashboard } from "./DashboardContext";
import { useToast } from "./Toast";
import { X, Send } from "lucide-react";
import {
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

// Custom chevron down icon
const ChevronDownIcon = ({ className = "w-3 h-3" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2.5"
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const modelLabels = {
  GPT: "GPT",
  CLAUDE_HAIKU: "Claude (Haiku)",
  SONNET: "Claude (Sonnet)"
};

export default function UnifiedDashboard({ defaultTab, showTabs = false }) {
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
    setAttachedFiles,
    botStatus,
    history,
    messages,
    handleSaveDraft,
    handleSendMessage,
    handleQuickDeploy,
    attachFile,
    activeModel,
    setActiveModel,
  } = useDashboard();

  const [showModelMenu, setShowModelMenu] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      if (!attachedFiles.includes(fileName)) {
        setAttachedFiles([...attachedFiles, fileName]);
      }
      e.target.value = ""; // Reset input
    }
  };

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
    { id: "fiverr-bot", label: "Fiverr Sales Bot", icon: BotIcon },
    { id: "service-guide", label: "Service Guide", icon: GuideIcon },
    { id: "alternative-guide", label: "Alternative Guide", icon: AlternateIcon },
  ];

  const getHeaderInfo = () => {
    switch (activeTab) {
      case "system-prompt":
        return {
          title: "Global Chat",
          description: "Chat with the Global Chat agent to modify behavior or verify lead status.",
        };
      case "fiverr-bot":
        return {  
          title: "Fiverr Sales Bot",
          description: "Chat with the auto-responder agent to modify behavior or verify lead status.",
        };
      case "service-guide":
        return {
          title: "Service Guide",
          description: "Review and adjust onboarding sequences, dispatch check rules, and execution standards.",
        };
      case "alternative-guide":
        return {
          title: "Alternative Guide",
          description: "Review secondary protocols, backup drafts, and automated edge-case configurations.",
        };
      default:
        return null;
    }
  };

  // Dynamic headers tailored to each tab
  const renderHeader = () => {
    const info = getHeaderInfo();
    if (!info) return null;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-100">
            {info.title}
          </h1>
          <p className="mt-1 text-sm sm:text-sm text-slate-550 dark:text-slate-400">
            {info.description}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap" />
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative animate-fade-in">
      {/* Tab Menu Header Section */}
      {showTabs && (
        <div className="flex border-b border-slate-200/80 dark:border-slate-800/80 mb-5 gap-1 overflow-x-auto select-none pb-px shrink-0 scrollbar-none">
          {tabsList.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasUnread = unreadTabs[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm sm:text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap outline-none ${isActive
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
      )}

      {/* Header section based on current active tab */}
      {renderHeader()}

      {/* Main Messages scroll view */}
      <div className="flex-1 flex flex-col min-h-[50px] mb-4 relative">



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

        {/* Prompt Update Input Interface (Universal) */}
        <form
          onSubmit={handleSendMessage}
          className="w-full max-w-2xl mx-auto bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-md p-4 space-y-4 hover:shadow-lg transition-all duration-300 mt-4"
        >
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />

          {/* Attached Files Indicator inside form */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 max-w-[100%]">
              {attachedFiles.map((file) => (
                <span
                  key={file}
                  className="bg-blue-50 dark:bg-blue-950/40 text-[#2563eb] dark:text-blue-400 text-xs font-bold pl-2 pr-1 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/40 flex items-center gap-1.5 shadow-xxs animate-fade-in"
                >
                  <FileIcon className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate max-w-[150px]">{file}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles(attachedFiles.filter(f => f !== file))}
                    className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800/60 rounded-sm transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

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
            className="w-full text-sm text-slate-700 dark:text-slate-300 placeholder-slate-450 dark:placeholder-slate-500 bg-transparent outline-none border-none resize-none h-16 scrollbar-thin"
          />

          {/* Footer buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {/* Model Selector Pill */}
              <div className="relative inline-block ml-1">
                <button
                  type="button"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-555 dark:text-slate-450 text-xxs font-bold transition-all duration-150 cursor-pointer"
                >
                  <span>{modelLabels[activeModel] || activeModel}</span>
                  <ChevronDownIcon className="w-2.5 h-2.5 opacity-60" />
                </button>

                {showModelMenu && (
                  <div className="absolute left-0 bottom-8 z-30 w-32 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-lg text-xs space-y-0.5 animate-scale-in">
                    {["GPT", "CLAUDE_HAIKU", "SONNET"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setActiveModel(m);
                          setShowModelMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-350 cursor-pointer ${
                          activeModel === m
                            ? "text-indigo-650 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-slate-800/40"
                            : ""
                        }`}
                      >
                        {modelLabels[m] || m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Attach context button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 cursor-pointer"
                title="Attach file"
              >
                <PaperclipIcon className="w-4 h-4" />
              </button>

              <button
                type="submit"
                className="flex items-center justify-center bg-[#4f46e5] hover:bg-[#4338ca] text-white p-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
