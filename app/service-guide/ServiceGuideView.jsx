"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "../../components/Toast";
import {
  GuideIcon,
  PaperclipIcon,
  CollaborateIcon,
  FileIcon,
  QuoteIcon,
} from "../../components/Icons";

export default function ServiceGuideView() {
  const { addToast } = useToast();
  const chatEndRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I am your Service Guide Assistant. I hold the protocols for client onboarding, order dispatch checks, intake form parsing, and greeting automations. How can I help you design or query these standards today?",
      time: "14:02 PM",
    },
    {
      id: 2,
      sender: "user",
      text: "Explain the intake form automation sequence.",
      time: "14:05 PM",
    },
    {
      id: 3,
      sender: "ai",
      text: "Sure! The Initial Intake Form sequence follows these steps:\n1. order placed by buyer.\n2. automatically dispatching requirements questionnaire link.\n3. tracking submission state.\n4. using AI parser to auto-fill CRM customer metrics.",
      time: "14:06 PM",
    },
  ]);

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

    setTimeout(() => {
      let replyText =
        "Checking service standards database. I will adapt response triggers to align with this rule.";
      const lowerText = inputText.toLowerCase();

      if (lowerText.includes("form") || lowerText.includes("intake")) {
        replyText =
          "Intake Form Protocol Details:\n- Dispatch delay: 0 seconds post-purchase\n- Form Fields: Project scope, design assets, and delivery hosting preferences\n- Storage target: Customer Profiles DB";
      } else if (
        lowerText.includes("welcome") ||
        lowerText.includes("greeting")
      ) {
        replyText =
          "Welcome Message Standards:\n- Core Greeting: Establishes a warm, professional reception\n- Context Matching: Analyzes client keywords for relevant services\n- Action Item: Directs client to onboarding links";
      } else if (
        lowerText.includes("download") ||
        lowerText.includes("document")
      ) {
        replyText =
          "Generating service standards documentation... You can download 'Service_Execution_Standards.pdf' via the attachment context panel or prompt me to export a summary.";
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
      addToast("Service Guide Database queried successfully!", "success");
    }, 1500);
  };

  const attachFile = (fileName) => {
    if (attachedFiles.includes(fileName)) {
      setAttachedFiles(attachedFiles.filter((f) => f !== fileName));
    } else {
      setAttachedFiles([...attachedFiles, fileName]);
      addToast(`Loaded protocol context: ${fileName}`, "info");
    }
    setShowAttachmentMenu(false);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative animate-fade-in">
      {/* Top Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-100">
            Service Guide
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review and adjust onboarding sequences, dispatch check rules, and
            execution standards.
          </p>
        </div>

        {/* Info Badge */}
        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/50 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
            OFFICIAL PROTOCOLS
          </span>
        </div>
      </div>

      {/* Chat Workspace Area */}
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
                  <span>
                    {msg.sender === "user" ? "You" : "Service Specialist AI"}
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

        {/* Chat Editor Card Overlay */}
        <form
          onSubmit={handleSendMessage}
          className="w-full max-w-2xl mx-auto bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-md p-4 space-y-4 hover:shadow-lg transition-all duration-300 mt-4"
        >
          {/* Top Row: File attachments and menu toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 relative">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20 flex items-center justify-center text-[#4f46e5] dark:text-[#818cf8]">
                <GuideIcon className="w-3.5 h-3.5" />
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
                      Choose Service Standards
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        attachFile("Service_Execution_Standards.pdf")
                      }
                      className={`w-full text-left p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 cursor-pointer ${
                        attachedFiles.includes(
                          "Service_Execution_Standards.pdf",
                        )
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      Service_Execution_Standards.pdf
                    </button>
                    <button
                      type="button"
                      onClick={() => attachFile("Onboarding_Milestones.json")}
                      className={`w-full text-left p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 cursor-pointer ${
                        attachedFiles.includes("Onboarding_Milestones.json")
                          ? "font-bold text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      Onboarding_Milestones.json
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
            placeholder="Ask AI about service guides... (e.g. 'Explain welcome protocol' or 'Show intake checklist')"
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
