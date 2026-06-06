"use client";

import React, { useState } from "react";
import { useDashboard } from "./DashboardContext";
import { AlertTriangle, CheckCircle2, Globe, ExternalLink } from "lucide-react";

const ExpandableContent = ({ content, formatMarkdown, className, isUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 400; // Character limit before showing "See more"
  
  if (!content) return null;
  const isLong = typeof content === 'string' && content.length > maxLength;
  const displayContent = (isLong && !isExpanded) ? content.slice(0, maxLength) + "..." : content;

  return (
    <div className={className}>
      {formatMarkdown(displayContent)}
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-sm font-bold mt-1.5 transition-colors cursor-pointer block ${
            isUser 
              ? "text-indigo-100 hover:text-white underline decoration-indigo-300/50 underline-offset-2" 
              : "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          }`}
        >
          {isExpanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
};

export default function SystemPromptView({ agentFilter }) {
  const { messages, isTyping, activeConversationId, conversationMessages, isLoadingMessages } = useDashboard();

  const formatMarkdown = (text) => {
    if (!text) return null;
    if (typeof text !== 'string') return text;
    const cleanText = text.replace(/##/g, "");
    const lines = cleanText.split('\n');
    const result = [];
    let inList = false;
    let listItems = [];

    const processBoldText = (str) => {
      if (!str.includes('*')) return str;
      const parts = str.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, i) => {
        const cleanPart = part.replace(/\*/g, ""); // Remove any remaining single *
        return i % 2 === 1 
          ? <strong key={i} className="font-bold text-slate-900 dark:text-white">{cleanPart}</strong> 
          : cleanPart;
      });
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const isListItemWithSpace = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
      const isListItemWithoutSpace = trimmedLine.startsWith('-') || trimmedLine.startsWith('*');
      
      const isListItem = isListItemWithSpace || (isListItemWithoutSpace && trimmedLine.length > 1);

      if (isListItem) {
        if (!inList) inList = true;
        const content = isListItemWithSpace ? trimmedLine.substring(2) : trimmedLine.substring(1);
        listItems.push(
          <li key={index} className="ml-5 list-disc pl-1 mb-1.5 marker:text-indigo-500 dark:marker:text-indigo-400">
            {processBoldText(content.trim())}
          </li>
        );
      } else {
        if (inList) {
          result.push(<ul key={`ul-${index}`} className="my-2">{listItems}</ul>);
          inList = false;
          listItems = [];
        }
        if (trimmedLine === '') {
          result.push(<div key={`br-${index}`} className="h-2"></div>);
        } else {
          result.push(
            <div key={`p-${index}`} className="mb-2">
              {processBoldText(line)}
            </div>
          );
        }
      }
    });

    if (inList) {
      result.push(<ul key="ul-end" className="my-2">{listItems}</ul>);
    }

    return result;
  };

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
            <div className="mb-2 text-sm opacity-75 font-bold uppercase tracking-wider">
              {msg.sender === "user" ? "You" : "AI Analysis"}
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
                
                {/* If it's the main tab showing a full_analysis, render all agents' sections */}
                {msg.isFullAnalysis && msg.structuredData?.agents ? (
                  <div className="space-y-6 mt-4">
                    {msg.structuredData.agents.map((agentObj, aIdx) => (
                      <div key={aIdx} className="space-y-3">
                        <h3 className="font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-xs border-b border-indigo-100 dark:border-indigo-500/20 pb-2 mb-3">
                          {agentObj.agent_name.replace(/_/g, " ")}
                        </h3>
                        {agentObj.web_search_used && agentObj.sources?.length > 0 && (
                          <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30 mb-3">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-xs mb-2 uppercase tracking-wide flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 shrink-0" />
                              Sources Consulted
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {agentObj.sources.map((src, i) => (
                                <a 
                                  key={i}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/50 border border-blue-100 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-sm transition-all group"
                                >
                                  <div className="flex flex-col min-w-0 pr-2">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{src.title}</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{src.source_type}</span>
                                  </div>
                                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {agentObj.sections?.map((sec, i) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1.5 uppercase tracking-wide flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              {sec.title}
                            </h4>
                            <ExpandableContent 
                              content={sec.content} 
                              formatMarkdown={formatMarkdown} 
                              className="text-base leading-relaxed text-slate-600 dark:text-slate-300" 
                              isUser={false} 
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : msg.structuredData?.sections?.length > 0 ? (
                  <div className="space-y-3">
                    {msg.structuredData.web_search_used && msg.structuredData.sources?.length > 0 && (
                      <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30 mb-3">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 text-xs mb-2 uppercase tracking-wide flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          Sources Consulted
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.structuredData.sources.map((src, i) => (
                            <a 
                              key={i}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800/50 border border-blue-100 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-600/50 hover:shadow-sm transition-all group"
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{src.title}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{src.source_type}</span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-500 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {msg.structuredData.sections.map((sec, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1.5 uppercase tracking-wide flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          {sec.title}
                        </h4>
                        <ExpandableContent 
                          content={sec.content} 
                          formatMarkdown={formatMarkdown} 
                          className="text-base leading-relaxed text-slate-600 dark:text-slate-300" 
                          isUser={false} 
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ExpandableContent 
                    content={msg.text} 
                    formatMarkdown={formatMarkdown} 
                    className="text-base leading-relaxed font-medium"
                    isUser={msg.sender === "user"}
                  />
                )}
              </div>
            ) : (
              <ExpandableContent 
                content={msg.text} 
                formatMarkdown={formatMarkdown} 
                className="text-base leading-relaxed font-medium"
                isUser={msg.sender === "user"}
              />
            )}

            <div className={`mt-2 text-[11px] opacity-60 font-bold uppercase tracking-wider ${msg.sender === "user" ? "text-right" : "text-left"}`}>
              {msg.time}
            </div>
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
