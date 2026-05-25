"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useToast } from "./Toast";
import { apiFetch } from "../utils/api";

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const { addToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("system-prompt");
  const [theme, setTheme] = useState("light");
  const queryClient = useQueryClient();

  const getInitialProfile = () => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("user-profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          const cookieRole = Cookies.get("role");
          if (cookieRole) {
            parsed.role = cookieRole;
          }
          return parsed;
        }
      } catch (e) {}

      try {
        const cookieRole = Cookies.get("role");
        if (cookieRole) {
          return {
            name: "User Two",
            email: "user2@test.com",
            avatarUrl: null,
            role: cookieRole
          };
        }
      } catch (e) {}
    }
    return {
      name: "User Two",
      email: "user2@test.com",
      avatarUrl: null,
      role: "USER"
    };
  };

  const { data: queryProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      // 1. Try loading from localStorage/cookies first
      try {
        const savedProfile = localStorage.getItem("user-profile");
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          const cookieRole = Cookies.get("role");
          if (cookieRole) {
            parsed.role = cookieRole;
          }
          return parsed;
        }
      } catch (e) {
        console.error("Failed to read user-profile from localStorage:", e);
      }

      // 2. Fallback to API if not in localStorage
      try {
        const json = await apiFetch("/user/profile/me");
        if (json.success && json.data) {
          localStorage.setItem("user-profile", JSON.stringify(json.data));
          return json.data;
        }
      } catch (error) {
        console.error("Failed to load user profile in queryFn:", error);
      }

      return getInitialProfile();
    },
    initialData: getInitialProfile
  });

  const profile = queryProfile;

  const setProfile = (newProfile) => {
    let resolvedProfile = newProfile;
    if (typeof newProfile === "function") {
      resolvedProfile = newProfile(profile);
    }
    queryClient.setQueryData(["profile"], resolvedProfile);
    try {
      localStorage.setItem("user-profile", JSON.stringify(resolvedProfile));
    } catch (e) {
      console.error("Failed to write user-profile to localStorage:", e);
      if (e.name === "QuotaExceededError" || e.code === 22) {
        addToast("Failed to save changes: image size is too large for browser storage limit.", "error");
      }
    }
  };

  // Sync activeTab with pathname on route changes
  useEffect(() => {
    if (pathname === "/agent-training") {
      setActiveTab("agent-training");
    } else if (pathname === "/user-management") {
      setActiveTab("user-management");
    } else if (pathname === "/service-guide") {
      setActiveTab("service-guide");
    } else if (pathname === "/alternative-guide") {
      setActiveTab("alternative-guide");
    } else if (pathname === "/system-prompt") {
      setActiveTab("system-prompt");
    } else if (pathname === "/settings") {
      setActiveTab("settings");
    } else if (pathname === "/") {
      const validDashboardTabs = ["system-prompt"];
      setActiveTab((current) => {
        if (!validDashboardTabs.includes(current)) {
          return "system-prompt";
        }
        return current;
      });
    }
  }, [pathname]);
  
  // Unread status for tabs to show notification badges
  const [unreadTabs, setUnreadTabs] = useState({
  });

  // Prompt input and state
  const [promptText, setPromptText] = useState("");
  const [status, setStatus] = useState("System Ready");
  const [statusColor, setStatusColor] = useState("bg-emerald-500");
  const [lastSynced, setLastSynced] = useState("14:02 PM");
  const [showHistory, setShowHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [botStatus, setBotStatus] = useState("Active");
  const [activeModel, setActiveModel] = useState("CLAUDE_HAIKU");
  const [activeConversationId, setActiveConversationIdState] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("activeConversationId");
        if (stored) setActiveConversationIdState(stored);
      } catch (e) {}
    }
  }, []);

  const setActiveConversationId = (id) => {
    setActiveConversationIdState(id);
    if (typeof window !== "undefined") {
      try {
        if (id) sessionStorage.setItem("activeConversationId", id);
        else sessionStorage.removeItem("activeConversationId");
      } catch (e) {}
    }
  };

  const { data: conversationMessagesResponse, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return null;
      return apiFetch(`/message/conversation/${activeConversationId}`);
    },
    enabled: !!activeConversationId,
  });

  const conversationMessages = conversationMessagesResponse?.data || [];

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

  // Combined messages state for all views
  const [messages, setMessages] = useState({
    "system-prompt": [],
  });

  // Read theme from localStorage on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) {
        setTheme(storedTheme);
      }
    } catch (e) {
      console.error("Failed to retrieve theme from localStorage:", e);
    }
  }, []);

  // Sync dark mode class on html tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        console.error("Failed to save theme to localStorage:", e);
      }
      return next;
    });
  };

  const markTabAsRead = (tabId) => {
    if (unreadTabs[tabId]) {
      setUnreadTabs((prev) => ({
        ...prev,
        [tabId]: false,
      }));
    }
  };

  const handleSaveDraft = () => {
    if (!promptText.trim()) {
      addToast(
        "Please type some instructions first before saving a draft.",
        "warning"
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

  // Use pathname to determine conversation type instead of active tab
  const getConvTypeFromPath = (path) => {
    return "GLOBAL";
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;

    const currentInput = promptText;
    setPromptText("");
    setAttachedFiles([]);
    setIsTyping(true);
    setStatus("Syncing prompt updates...");
    setStatusColor("bg-amber-500 animate-pulse");

    let targetConvId = activeConversationId;
    
    // Determine conversation type based on active tab
    const convType = getConvTypeFromPath(pathname);

    try {
      if (!targetConvId) {

        // Create new conversation
        const convRes = await apiFetch("/conversation", {
          method: "POST",
          body: JSON.stringify({
            name: currentInput.substring(0, 30) + (currentInput.length > 30 ? "..." : ""),
            type: convType,
            aiModel: activeModel,
          }),
        });

        if (!convRes.success) throw new Error("Failed to create conversation");
        
        targetConvId = convRes.data.id;
        setActiveConversationId(targetConvId);
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }

      const optimisticMsg = {
        id: Date.now().toString(),
        role: "USER",
        userQuery: currentInput,
        createdAt: new Date().toISOString()
      };
      
      queryClient.setQueryData(["messages", targetConvId], (oldData) => {
        return {
          ...oldData,
          data: [...(oldData?.data || []), optimisticMsg]
        };
      });

      const formData = new FormData();
      formData.append("conversationId", targetConvId);
      formData.append("userQuery", currentInput);
      formData.append("role", "USER");
      
      await apiFetch("/message", {
        method: "POST",
        body: formData,
      });
      
      queryClient.invalidateQueries({ queryKey: ["messages", targetConvId] });
      setStatus("System Ready");
      setStatusColor("bg-emerald-500");
    } catch (err) {
      addToast(err.message || "Failed to process message", "error");
      setStatus("Error");
      setStatusColor("bg-rose-500");
    } finally {
      setIsTyping(false);
    }
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

      setMessages((prev) => ({
        ...prev,
        "system-prompt": [...prev["system-prompt"], deployMsg],
      }));
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
  };

  return (
    <DashboardContext.Provider
      value={{
        profile,
        setProfile,
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
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
        setBotStatus,
        history,
        messages,
        handleSaveDraft,
        handleSendMessage,
        handleQuickDeploy,
        attachFile,
        activeModel,
        setActiveModel,
        activeConversationId,
        setActiveConversationId,
        conversationMessages,
        isLoadingMessages,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
