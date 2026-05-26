"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDashboard } from "./DashboardContext";
import { useToast } from "./Toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../utils/api";
import toast from "react-hot-toast";
import {
  PaperclipIcon,
  LightningIcon,
  FileIcon,
  BotIcon,
  TrainingIcon,
} from "./Icons";

// Custom settings/slider icon for "Tools"
const SliderIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2.2"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
    />
  </svg>
);

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

// Custom up arrow icon
const UpArrowIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="3"
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
  </svg>
);

// Custom image icon
const ImageIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375 0 1 1-.75 0 .375 0 0 1 .75 0Z"
    />
  </svg>
);

export default function AgentTrainingView() {
  const { setActiveTab, theme } = useDashboard();
  const { addToast } = useToast();

  // Local state for Agent Training
  const [trainingInput, setTrainingInput] = useState("");
  const [activeModel, setActiveModel] = useState("CLAUDE_HAIKU");
  const modelLabels = {
    GPT: "GPT",
    CLAUDE_HAIKU: "Claude (Haiku)",
    SONNET: "Claude (Sonnet)"
  };
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [toolsActive, setToolsActive] = useState(true);
  const [fastActive, setFastActive] = useState(true);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [attachedImages, setAttachedImages] = useState([]);

  // File trigger references
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const queryClient = useQueryClient();
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);

  const consoleEndRef = useRef(null);

  // Sync activeTab in Context to highlight the sidebar correctly
  useEffect(() => {
    setActiveTab("agent-training");
  }, [setActiveTab]);

  // Fetch training logs from GET /agent-training
  const { data: serverTrainingData = [] } = useQuery({
    queryKey: ["agent-training"],
    queryFn: async () => {
      const json = await apiFetch("/agent-training");
      return json.data;
    }
  });

  // Fetch detailed single training from GET /agent-training/:trainingId
  const { data: trainingDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["agent-training-detail", selectedTrainingId],
    queryFn: async () => {
      if (!selectedTrainingId) return null;
      const json = await apiFetch(`/agent-training/${selectedTrainingId}`);
      return json.data;
    },
    enabled: !!selectedTrainingId,
  });

  // POST /agent-training Mutation using Form Data
  const trainMutation = useMutation({
    mutationFn: async (formData) => {
      const json = await apiFetch("/agent-training", {
        method: "POST",
        body: formData,
      });
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-training"] });
      addToast("Agent training complete! Core weights compiled.", "success");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to train agent");
    }
  });

  // Derive chat history dynamically from queries
  const trainingLogs = React.useMemo(() => {
    const logs = [];

    const items = Array.isArray(serverTrainingData)
      ? [...serverTrainingData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      : (serverTrainingData && typeof serverTrainingData === "object" && serverTrainingData.id)
        ? [serverTrainingData]
        : [];

    items.forEach((item) => {
      const timeString = new Date(item.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // User's training prompt
      logs.push({
        id: item.id,
        role: "user",
        text: item.prompt,
        time: timeString,
        model: modelLabels[item.modelName] || item.modelName,
        files: item.documentPath ? [item.documentPath.split("/").pop()] : [],
        isClickable: true,
      });
    });

    return logs;
  }, [serverTrainingData]);

  const isTraining = trainMutation.isPending;

  // Autoscroll chat logs
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [trainingLogs, isTraining]);

  const handleModelChange = (model) => {
    setActiveModel(model);
    setShowModelMenu(false);
    addToast(`Model switched to ${modelLabels[model] || model}`, "info");
  };

  const toggleTool = () => {
    setToolsActive(!toolsActive);
    addToast(toolsActive ? "Agent tools disabled" : "Agent tools enabled", "info");
  };

  const toggleFast = () => {
    setFastActive(!fastActive);
    addToast(fastActive ? "Switched to High-Reasoning Mode" : "Switched to Fast Execution Mode", "info");
  };

  const handleSelectAttachMode = (type) => {
    setShowAttachmentMenu(false);
    if (type === "file") {
      fileInputRef.current?.click();
    } else if (type === "image") {
      imageInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileData = {
      id: Date.now().toString(),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      file: file,
    };

    setAttachedFiles([fileData]); // Allow 1 document at a time
    addToast(`Attached file: ${file.name}`, "success");
    e.target.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const imgData = {
      id: Date.now().toString(),
      name: file.name,
      url: url,
    };

    setAttachedImages((prev) => [...prev, imgData]);
    addToast(`Attached image: ${file.name}`, "success");
    e.target.value = "";
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;

        const url = URL.createObjectURL(file);
        const imgData = {
          id: Date.now().toString(),
          name: `Pasted_Image_${attachedImages.length + 1}.png`,
          url: url,
        };

        setAttachedImages((prev) => [...prev, imgData]);
        addToast("Image pasted from clipboard!", "success");
        e.preventDefault();
      }
    }
  };

  const handleRemoveFile = (id) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
    addToast("File attachment removed", "info");
  };

  const handleRemoveImage = (id) => {
    const imgToRemove = attachedImages.find((img) => img.id === id);
    if (imgToRemove && imgToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imgToRemove.url);
    }
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
    addToast("Image attachment removed", "info");
  };

  const handleTrainSubmit = (e) => {
    if (e) e.preventDefault();
    if (!trainingInput.trim() && attachedFiles.length === 0) return;

    const formData = new FormData();
    formData.append("modelName", activeModel);
    formData.append("prompt", trainingInput.trim());
    if (attachedFiles.length > 0) {
      formData.append("document", attachedFiles[0].file);
    }

    trainMutation.mutate(formData);

    setTrainingInput("");
    setAttachedFiles([]);
    setAttachedImages([]);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative select-none">

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a] dark:text-slate-100">
            Agent Training
          </h1>
          <p className="mt-1 text-sm sm:text-sm text-slate-550 dark:text-slate-400">
            Train your AI agent interactively. Add behavior guidelines, run test datasets, and optimize model responses.
          </p>
        </div>


      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-h-0 mb-4">

        {/* Training Console Chat */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl p-4 sm:p-5 relative">

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin flex flex-col pb-4">
            {trainingLogs.map((log) => (
              <div
                key={log.id}
                className={`flex ${log.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  onClick={() => log.isClickable && setSelectedTrainingId(log.id)}
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-xs border ${
                    log.isClickable ? "cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 animate-pulse-once" : ""
                  } ${log.role === "user"
                    ? "bg-slate-800 text-white border-slate-700 rounded-br-none"
                    : "bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-200 border-slate-200/60 dark:border-slate-800/70 rounded-bl-none"
                    }`}
                >
                  <div className="flex justify-between items-center gap-4 mb-2 text-xs opacity-75 font-bold">
                    <span>{log.role === "user" ? "System Admin" : "Training Parser Engine"}</span>
                    <span>{log.time}</span>
                  </div>

                  {log.files && log.files.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {log.files.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-slate-700/80 text-slate-200 rounded">
                          <FileIcon className="w-2.5 h-2.5" />
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {log.images && log.images.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {log.images.map((url, index) => (
                        <div key={index} className="h-14 w-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-xxs">
                          <img src={url} className="h-full w-full object-cover" alt="Uploaded asset preview" />
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
                    {log.text}
                  </p>

                  {log.model && (
                    <div className="mt-2 pt-2 border-t border-slate-700/40 flex justify-between items-center text-[9px] opacity-60">
                      <span>Model: {log.model}</span>
                      <span>Click to view live weight payload</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Simulated Training Progress Log */}
            {isTraining && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/70 rounded-2xl rounded-bl-none p-4 flex flex-col gap-3 min-w-[200px] shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-indigo-250 animate-spin border-t-indigo-650" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      TRAINING IN PROGRESS
                    </span>
                  </div>
                  <p className="text-sm font-mono font-medium animate-pulse text-slate-500">
                    Optimizing weights using {activeModel}...
                  </p>
                </div>
              </div>
            )}
            <div ref={consoleEndRef} />
          </div>

          {/* Attached Files & Images list above the input capsule */}
          {(attachedFiles.length > 0 || attachedImages.length > 0) && (
            <div className="flex flex-wrap gap-3 max-w-2xl mx-auto w-full px-4 mb-3 animate-fade-in items-end">
              {/* File Badges */}
              {attachedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-150 dark:border-indigo-900/40 flex items-center gap-2 shadow-xxs hover:border-indigo-300 dark:hover:border-indigo-850 group transition-all duration-150 relative"
                >
                  <FileIcon className="w-3.5 h-3.5 shrink-0" />
                  <div className="flex flex-col">
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <span className="text-[8px] opacity-60 font-semibold">{file.size}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="h-4 w-4 rounded-full flex items-center justify-center bg-indigo-200/50 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-850 text-indigo-600 dark:text-indigo-400 cursor-pointer ml-1 text-xs font-bold"
                    title="Remove attachment"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Image Previews */}
              {attachedImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group h-14 w-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:scale-105"
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="h-full w-full object-cover"
                  />
                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="h-5 w-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                      title="Remove Image"
                    >
                      <span className="text-sm font-black leading-none">×</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PREMIUM CAPSULE CHAT INPUT BAR - MATCHING SCREENSHOT EXACTLY (THEME DYNAMIC) */}
          <form
            onSubmit={handleTrainSubmit}
            className="w-full max-w-3xl mx-auto bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-850 p-3 flex flex-col gap-2.5 shadow-sm dark:shadow-lg relative transition-colors duration-200"
          >
            {/* Hidden Input Triggers */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Input Row */}
            <textarea
              value={trainingInput}
              onChange={(e) => setTrainingInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleTrainSubmit();
                }
              }}
              placeholder="Ask anything privately"
              rows={1}
              className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder-slate-450 dark:placeholder-slate-500 bg-transparent outline-none border-none resize-none px-2 pt-1 h-8 scrollbar-none font-medium"
            />

            {/* Bottom Controls Row */}
            <div className="flex items-center justify-between gap-3 px-2 pb-0.5">

              {/* Left Side Controls (Attachments, Tools, Mode, Model Select) */}
              <div className="flex items-center gap-2 relative">

                {/* Paperclip Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-1.5 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer"
                    title="Ingest Guidelines Document"
                  >
                    <PaperclipIcon className="w-4 h-4" />
                  </button>

                  {/* Attachment selection menu */}
                  {showAttachmentMenu && (
                    <div className="absolute left-0 bottom-8 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-1.5 shadow-xl text-xs space-y-0.5 animate-scale-in">
                      <button
                        type="button"
                        onClick={() => handleSelectAttachMode("file")}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-left cursor-pointer"
                      >
                        <FileIcon className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Attach File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAttachMode("image")}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-left cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Attach Image</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Tools Switcher Pill */}
                {/* <button
                  type="button"
                  onClick={toggleTool}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xxs font-bold transition-all duration-150 cursor-pointer ${toolsActive
                    ? "border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-250 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                >
                  <SliderIcon className="w-3 h-3" />
                  <span>Tools</span>
                </button> */}

                {/* Speed Mode Pill */}
                {/* <button
                  type="button"
                  onClick={toggleFast}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xxs font-bold transition-all duration-150 cursor-pointer ${fastActive
                    ? "border-slate-250 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                    : "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                    }`}
                >
                  <LightningIcon className={`w-3 h-3 ${fastActive ? "text-amber-500 fill-current animate-pulse" : "text-emerald-500 dark:text-emerald-400 fill-current"}`} />
                  <span>{fastActive ? "Fast" : "Reasoning"}</span>
                </button> */}

                {/* Model Selector Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowModelMenu(!showModelMenu)}
                    className="flex items-center gap-1 px-3 py-1 rounded-full border border-slate-250 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xxs font-bold transition-all duration-150 cursor-pointer"
                  >
                    <span>{modelLabels[activeModel] || activeModel}</span>
                    <ChevronDownIcon className="w-2.5 h-2.5 opacity-60" />
                  </button>

                  {showModelMenu && (
                    <div className="absolute left-0 bottom-8 z-30 w-36 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-1.5 shadow-xl text-xs space-y-0.5 animate-scale-in">
                      {["GPT", "CLAUDE_HAIKU", "SONNET"].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleModelChange(m)}
                          className={`w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-605 dark:text-slate-355 cursor-pointer ${activeModel === m ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-slate-800/40" : ""
                            }`}
                        >
                          {modelLabels[m]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Side Submit Arrow Button */}
              <button
                type="submit"
                disabled={!trainingInput.trim() && attachedFiles.length === 0 && attachedImages.length === 0}
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${trainingInput.trim() || attachedFiles.length > 0 || attachedImages.length > 0
                  ? "bg-slate-950 text-white dark:bg-white dark:text-black hover:bg-slate-850 dark:hover:bg-slate-250 cursor-pointer scale-105"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  }`}
              >
                <UpArrowIcon className="w-3.5 h-3.5" />
              </button>

            </div>
          </form>

        </div>
      </div>

      {/* Premium Detail Modal for Training Run */}
      {selectedTrainingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800/80 dark:bg-[#0b0f19] animate-fade-in relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedTrainingId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer font-bold text-lg"
            >
              ×
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <BotIcon className="w-5 h-5 text-indigo-500" />
              <span>Training Run Details</span>
            </h3>

            {isLoadingDetail ? (
              <div className="flex-1 flex justify-center items-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : !trainingDetail ? (
              <div className="flex-1 text-center py-20 text-slate-400 dark:text-slate-500">
                Failed to load training details.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm sm:text-sm font-medium text-slate-655 dark:text-slate-400">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                  <div>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase font-bold">Model Engine</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {modelLabels[trainingDetail.modelName] || trainingDetail.modelName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase font-bold">Executed At</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {new Date(trainingDetail.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {trainingDetail.documentPath && (
                  <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Attached Dataset</span>
                    <a
                      href={trainingDetail.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-350 font-bold"
                    >
                      <FileIcon className="w-4 h-4" />
                      <span>{trainingDetail.documentPath.split("/").pop()}</span>
                    </a>
                  </div>
                )}

                <div>
                  <span className="block text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-1">Prompt Weight Guidelines</span>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-850 font-mono text-xxs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto text-slate-700 dark:text-slate-300">
                    {trainingDetail.prompt}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
