"use client";

import React from "react";
import { useDashboard } from "./DashboardContext";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SystemPromptView({ agentFilter }) {
  const { messages, isTyping, activeConversationId, conversationMessages, isLoadingMessages } = useDashboard();

  const formatMessages = (msgs) => {
    const formatted = [];
    msgs.forEach((m) => {
      // Handle local state dummy messages
      if (m.text) {
        formatted.push({
          id: m.id,
          sender: m.sender === "user" ? "user" : "ai",
          text: m.text,
          time: m.time
        });
        return;
      }

      const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
      
      // Helper to safely extract text from potential objects
      const extractText = (data) => {
        if (!data) return "";
        if (typeof data === "string") return data;
        if (typeof data === "object") {
          return data.raw || JSON.stringify(data, null, 2);
        }
        return String(data);
      };

      // Handle API format where one record might contain userQuery and/or rowAiResponse
      if (m.userQuery) {
        formatted.push({
          id: m.id + "-user",
          sender: "user",
          text: extractText(m.userQuery),
          time: timeStr
        });
      }
      if (m.rowAiResponse) {
        let aiData = m.rowAiResponse;
        
        // If it's a full_analysis and we have an agentFilter, extract that specific agent's response
        if (typeof aiData === "object" && aiData.agent === "full_analysis" && aiData.agents) {
          if (agentFilter) {
            const targetAgent = aiData.agents.find(a => a.agent_name === agentFilter);
            if (targetAgent) aiData = targetAgent;
          }
        }
        
        formatted.push({
          id: m.id + "-ai",
          sender: "ai",
          text: extractText(aiData),
          structuredData: typeof aiData === "object" ? aiData : null,
          isFullAnalysis: typeof aiData === "object" && aiData.agent === "full_analysis" && !agentFilter,
          time: timeStr
        });
      }
    });
    return formatted;
  };

  const displayMessages = activeConversationId 
    ? formatMessages(conversationMessages) 
    : messages["system-prompt"];

  if (activeConversationId && isLoadingMessages) {
    return <div className="text-sm text-slate-500 p-4 animate-pulse">Loading chat history...</div>;
  }

  return (
    <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
      {displayMessages?.map((msg) => (
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
            <div className="flex justify-between items-center gap-4 mb-2 text-sm opacity-75 font-bold uppercase tracking-wider">
              <span>{msg.sender === "user" ? "You" : "Prompt Architect AI"}</span>
              <span>{msg.time}</span>
            </div>
            
            {msg.sender === "ai" && msg.structuredData ? (
              <div className="space-y-4 mt-2">
                {/* Render warnings */}
                {(msg.structuredData.combined_nsr_warnings || msg.structuredData.nsr_warnings)?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(msg.structuredData.combined_nsr_warnings || msg.structuredData.nsr_warnings).map((w, i) => (
                      <div key={i} className="flex items-start gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1.5 rounded-lg text-sm font-semibold cursor-help" title={w.message}>
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{w.flag}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* If it's the main tab showing a full_analysis, show a summary message */}
                {msg.isFullAnalysis ? (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 p-4 rounded-xl text-sm font-medium border border-indigo-100 dark:border-indigo-800/30">
                    <p>Analysis complete. The response has been divided into sections based on intent.</p>
                    <p className="mt-2 text-sm opacity-80">Please click the <strong>Fiverr Sales Bot</strong>, <strong>Service Guide</strong>, or <strong>Alternative Guide</strong> tabs above to view the detailed responses.</p>
                  </div>
                ) : msg.structuredData.sections?.length > 0 ? (
                  <div className="space-y-3">
                    {msg.structuredData.sections.map((sec, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1.5 uppercase tracking-wide flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          {sec.title}
                        </h4>
                        <div className="text-base leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">
                          {sec.content.replace(/##/g, "").trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base leading-relaxed whitespace-pre-line font-medium">
                    {msg.text}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-base leading-relaxed whitespace-pre-line font-medium">
                {msg.text}
              </p>
            )}
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start animate-fade-in">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800/70 rounded-bl-none flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-indigo-400 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      )}
    </div>
  );
}
