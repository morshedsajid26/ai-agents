"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "../components/Toast";
import {
  BotIcon,
  SlidersIcon,
  PaperclipIcon,
  CollaborateIcon,
  FileIcon,
  QuoteIcon,
} from "../components/Icons";

export default function FiverrBotView() {
  const { addToast } = useToast();
  const chatEndRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [botStatus, setBotStatus] = useState("Active");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your Fiverr Sales Bot controller. I monitor incoming buyer messages, classify lead intents, and draft quick replies. How can I assist you in managing the auto-responder today?",
      time: "14:02 PM",
    },
    {
      id: 2,
      sender: "user",
      text: "Show me the last lead status from inbox.",
      time: "14:03 PM",
    },
    {
      id: 3,
      sender: "ai",
      text: "Latest lead: 'jack_dev_99'. Intent: 'Full-stack React CRM build'. Onboarding questionnaire dispatched. Status is currently pending client reply.",
      time: "14:03 PM",
    },
  ]);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: inputText,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setAttachedFiles([]);
    setIsTyping(true);

    // Simulate AI response based on keywords
    setTimeout(() => {
      let replyText =
        "Understood. Adjusting auto-responder parameters to align with your guidelines.";
      const lowerText = inputText.toLowerCase();

      if (lowerText.includes("pause") || lowerText.includes("stop")) {
        setBotStatus("Paused");
        replyText =
          "Fiverr Sales Bot auto-responder has been successfully PAUSED. I will now only monitor inputs without sending automated proposals.";
      } else if (
        lowerText.includes("start") ||
        lowerText.includes("run") ||
        lowerText.includes("resume")
      ) {
        setBotStatus("Active");
        replyText =
          "Fiverr Sales Bot auto-responder has been RESUMED. Standing by to scan new client inquiries.";
      } else if (lowerText.includes("status") || lowerText.includes("lead")) {
        replyText =
          "Active Status Monitor:\n- Bot State: " +
          botStatus +
          "\n- Sync with Fiverr API: OK\n- Pending follow-ups: 2 users\n- Last active prompt version: v1.4.1";
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      addToast("New response from Fiverr Bot Controller!", "success");
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
            Fiverr Sales Bot
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Chat with the auto-responder agent to modify behavior or verify lead
            status.
          </p>
        </div>

        {/* Status Indicator Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-550 font-semibold">
            Bot State:
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xxs font-bold rounded-full ${
              botStatus === "Active"
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/40"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-250 dark:border-amber-900/40"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                botStatus === "Active"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-500"
              }`}
            />
            {botStatus}
          </span>
        </div>
      </div>

      {/* Chat Messages Workspace Area */}
      <div className="flex-1 rounded-xl p-4 sm:p-6 flex flex-col min-h-[30px] mb-4">
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
                  <span>{msg.sender === "user" ? "You" : "Sales Bot AI"}</span>
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
                <BotIcon className="w-3.5 h-3.5" />
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
                      Choose Log Context
                    </p>
                    <button
                      type="button"
                      onClick={() => attachFile("Latest_Fiverr_Logs.log")}
                      className={`w-full text-left p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 cursor-pointer ${
                        attachedFiles.includes("Latest_Fiverr_Logs.log")
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      Latest_Fiverr_Logs.log
                    </button>
                    <button
                      type="button"
                      onClick={() => attachFile("Inbox_History.json")}
                      className={`w-full text-left p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 cursor-pointer ${
                        attachedFiles.includes("Inbox_History.json")
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      Inbox_History.json
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
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask AI bot details... (e.g. 'Show status report' or 'Pause the responder')"
            className="w-full text-xs text-slate-700 dark:text-slate-300 placeholder-slate-450 dark:placeholder-slate-500 bg-transparent outline-none border-none resize-none h-16 scrollbar-thin "
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
                onClick={() => addToast("Draft saved successfully!", "success")}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-250 cursor-pointer"
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
              >
                <span>Send Message</span>
                <span className="text-[10px]">➔</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
