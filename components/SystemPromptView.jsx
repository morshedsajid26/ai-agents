"use client";

import React from "react";
import { useDashboard } from "./DashboardContext";

export default function SystemPromptView() {
  const { messages, isTyping } = useDashboard();

  return (
    <div className="space-y-4 flex-1 overflow-y-auto">
      {messages["system-prompt"]?.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
        >
          <div
            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-sm border ${
              msg.sender === "user"
                ? "bg-[#4f46e5] text-white border-[#4f46e5]/20 rounded-br-none"
                : "bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-200 border-slate-200/60 dark:border-slate-800/70 rounded-bl-none"
            }`}
          >
            <div className="flex justify-between items-center gap-4 mb-1 text-[10px] opacity-75 font-bold">
              <span>{msg.sender === "user" ? "You" : "Prompt Architect AI"}</span>
              <span>{msg.time}</span>
            </div>
            <p className="text-xs leading-relaxed whitespace-pre-line font-medium">
              {msg.text}
            </p>
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] text-slate-400 dark:text-slate-550 border border-slate-200/60 dark:border-slate-800/70 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}
