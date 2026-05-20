"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "../../components/Toast";
import {
  HistoryIcon,
  LightningIcon,
  PaperclipIcon,
  CollaborateIcon,
  FileIcon,
  QuoteIcon,
} from "../../components/Icons";

export default function SystemPromptView() {
  const { addToast } = useToast();
  const chatEndRef = useRef(null);
  const [promptText, setPromptText] = useState("");
  const [status, setStatus] = useState("System Ready");
  const [statusColor, setStatusColor] = useState("bg-emerald-500");
  const [lastSynced, setLastSynced] = useState("14:02 PM");
  const [showHistory, setShowHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [history, setHistory] = useState([
    {
      id: 1,
      text: "Define core behavior. Maintain friendly but professional CRM sales agent tone.",
      time: "10:15 AM",
    },
    {
      id: 2,
      text: "Adjust the tone to be more technical but approachable. Prioritize Shopify services.",
      time: "11:40 AM",
    },
  ]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your System Prompt Architect. I manage the core instructions and personality guidelines of the Fiverr Sales Bot. Tell me what behaviors to adjust, or attach files to augment my knowledge base.",
      time: "14:02 PM",
    },
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSaveDraft = () => {
    if (!promptText.trim()) {
      addToast(
        "Please type some instructions first before saving a draft.",
        "warning",
      );
      return;
    }
    const newDraft = {
      id: Date.now(),
      text: promptText,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setHistory([newDraft, ...history]);
    addToast("Draft saved to prompt revision history!", "success");
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: promptText,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = promptText;
    setPromptText("");
    setAttachedFiles([]);
    setIsTyping(true);
    setStatus("Syncing prompt updates...");
    setStatusColor("bg-amber-500 animate-pulse");

    setTimeout(() => {
      const now = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setLastSynced(now);
      setStatus("System Ready");
      setStatusColor("bg-emerald-500");

      let replyText = `System prompt instructions updated successfully!\n\nNew directive added: "${currentInput}"\n\nThe updated instructions have been compiled into the standby memory slot. Click 'Quick Deploy' at the top to push this version live to the CDN webhook.`;

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        time: now,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      addToast("System prompt synced with standby node!", "success");
    }, 1800);
  };

  const handleQuickDeploy = () => {
    setStatus("Deploying globally...");
    setStatusColor("bg-blue-500 animate-pulse");

    setTimeout(() => {
      setStatus("System Ready");
      setStatusColor("bg-emerald-500");

      const now = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const deployMsg = {
        id: Date.now(),
        sender: "ai",
        text: `🚀 GLOBAL DEPLOYMENT SUCCESSFUL!\n\nAll updated standby prompts have been pushed to the global sales bot CDN webhook. Version active as of ${now}.`,
        time: now,
      };

      setMessages((prev) => [...prev, deployMsg]);
      addToast("Prompt version deployed successfully!", "success");
    }, 1500);
  };

  const attachFile = (fileName) => {
    if (attachedFiles.includes(fileName)) {
      setAttachedFiles(attachedFiles.filter((f) => f !== fileName));
    } else {
      setAttachedFiles([...attachedFiles, fileName]);
      addToast(`Attached context file: ${fileName}`, "info");
    }
    setShowAttachmentMenu(false);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative animate-fade-in">
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-100">
            System Prompt
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define the core behavior and intelligence guidelines of your sales
            assistant.
          </p>
        </div>

        {/* Action Buttons */}
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

      {/* Chat Workspace Area */}
      <div className="flex-1 rounded-xl p-4 sm:p-6 flex flex-col min-h-[30px] mb-4">
        {/* Revision History panel overlay */}
        {showHistory && (
          <div className="absolute top-4 right-4 z-20 w-72 sm:w-80 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg space-y-4 max-h-[220px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Revision History
              </span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-650 text-xxs font-bold cursor-pointer"
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

        {/* Scrollable conversation history */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {messages.map((msg) => (
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
                  <span>
                    {msg.sender === "user" ? "You" : "Prompt Architect AI"}
                  </span>
                  <span>{msg.time}</span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-line font-medium">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white dark:bg-[#0f172a] text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800/70 rounded-2xl rounded-bl-none p-3.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Attached Files Indicator */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-[80%] mt-2 mb-1">
            {attachedFiles.map((file) => (
              <span
                key={file}
                className="bg-blue-50 dark:bg-blue-950/40 text-[#2563eb] dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40 flex items-center gap-1 shadow-xxs"
              >
                <FileIcon className="w-2.5 h-2.5" />
                {file}
              </span>
            ))}
          </div>
        )}

        {/* Chat Editor Card Overlay at the bottom */}
        <form
          onSubmit={handleSendMessage}
          className="w-full max-w-2xl mx-auto bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-md p-4 space-y-4 hover:shadow-lg transition-all duration-300 mt-4"
        >
          {/* Top Row: File attachments and menu toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 relative">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20 flex items-center justify-center text-[#4f46e5] dark:text-[#818cf8]">
                <FileIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Attach Context Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f1f5f9] dark:bg-[#1e293b] text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg cursor-pointer transition-colors duration-150"
                >
                  <PaperclipIcon className="w-3 h-3 text-slate-500" />
                  <span>ATTACH CONTEXT</span>
                </button>

                {/* Attachment Menu */}
                {showAttachmentMenu && (
                  <div className="absolute right-0 bottom-10 z-35 w-48 bg-white dark:bg-[#0f172a] border border-slate-250 dark:border-slate-800 rounded-lg p-2 shadow-lg text-[10px] space-y-1">
                    <p className="font-bold text-slate-400 p-1">
                      Choose Service Guides
                    </p>
                    <button
                      type="button"
                      onClick={() => attachFile("Initial_Intake_Form.pdf")}
                      className={`w-full text-left p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 cursor-pointer ${
                        attachedFiles.includes("Initial_Intake_Form.pdf")
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      Initial_Intake_Form.pdf
                    </button>
                    <button
                      type="button"
                      onClick={() => attachFile("Welcome_Sequence.pdf")}
                      className={`w-full text-left p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 cursor-pointer ${
                        attachedFiles.includes("Welcome_Sequence.pdf")
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      Welcome_Sequence.pdf
                    </button>
                  </div>
                )}
              </div>

              {/* Collaborate Link */}
              <button
                type="button"
                onClick={() =>
                  addToast(
                    "Collaboration lobby link copied to clipboard!",
                    "success",
                  )
                }
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f1f5f9] dark:bg-[#1e293b] text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold rounded-lg cursor-pointer transition-colors duration-150"
              >
                <CollaborateIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>COLLABORATE</span>
              </button>
            </div>
          </div>

          {/* Textarea Input */}
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

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {/* Left Icons */}
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

            {/* Right Buttons */}
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
