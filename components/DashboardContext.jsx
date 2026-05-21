"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "./Toast";

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const { addToast } = useToast();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("system-prompt");
  const [theme, setTheme] = useState("light");

  // Sync activeTab with pathname on route changes
  useEffect(() => {
    if (pathname === "/agent-training") {
      setActiveTab("agent-training");
    } else if (pathname === "/service-guide") {
      setActiveTab("service-guide");
    } else if (pathname === "/alternative-guide") {
      setActiveTab("alternative-guide");
    } else if (pathname === "/system-prompt") {
      setActiveTab("system-prompt");
    } else if (pathname === "/") {
      const validDashboardTabs = ["system-prompt", "fiverr-bot", "service-guide", "alternative-guide"];
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
    "fiverr-bot": false,
    "service-guide": false,
    "alternative-guide": false,
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
  const [activeModel, setActiveModel] = useState("Claude(Haiku)");

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
    "system-prompt": [
      {
        id: 1,
        sender: "ai",
        text: "Hello! I am your System Prompt Architect. I manage the core instructions and personality guidelines of the Fiverr Sales Bot. Tell me what behaviors to adjust, or attach files to augment my knowledge base.",
        time: "14:02 PM",
      },
    ],
    "fiverr-bot": [
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
    ],
    "service-guide": [
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
    ],
    "alternative-guide": [
      {
        id: 1,
        sender: "ai",
        text: "Hello! I am your Fallback Directive Assistant. I manage alternate workflow configurations, backup responses, and routing tables for leads that fall outside normal boundaries. How can I help you tweak fallback directives?",
        time: "14:02 PM",
      },
      {
        id: 2,
        sender: "user",
        text: "Show active fallback routing rules.",
        time: "14:06 PM",
      },
      {
        id: 3,
        sender: "ai",
        text: "Current Fallback Status:\n- Standard domain escape: Reroute to Operator Lobby.\n- Unclassified queries: Dispatch 'General Intake' proposal.\n- API timeout trigger: Cache message and retry in 60s.",
        time: "14:07 PM",
      },
    ],
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

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!promptText.trim()) return;

    const timeString = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: promptText,
      time: timeString,
    };

    // Add user message to System Prompt tab
    setMessages((prev) => ({
      ...prev,
      "system-prompt": [...prev["system-prompt"], userMsg],
    }));

    const currentInput = promptText;
    setPromptText("");
    setAttachedFiles([]);
    setIsTyping(true);
    setStatus("Syncing prompt updates...");
    setStatusColor("bg-amber-500 animate-pulse");

    // Dynamic processing based on keywords
    setTimeout(() => {
      const now = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setLastSynced(now);
      setStatus("System Ready");
      setStatusColor("bg-emerald-500");

      const lowerInput = currentInput.toLowerCase();
      let detectedBotStatus = botStatus;

      // Detect state changes
      if (lowerInput.includes("pause") || lowerInput.includes("stop")) {
        detectedBotStatus = "Paused";
        setBotStatus("Paused");
      } else if (
        lowerInput.includes("start") ||
        lowerInput.includes("run") ||
        lowerInput.includes("resume") ||
        lowerInput.includes("active")
      ) {
        detectedBotStatus = "Active";
        setBotStatus("Active");
      }

      // Generate split responses for each tab
      const systemPromptReply = `System prompt instructions updated successfully via ${activeModel}!\n\nNew directive processed: "${currentInput}"\n\nThe updated behavior profile has been compiled and is now active across all sub-agent nodes.`;
      
      let fiverrReply = "";
      if (detectedBotStatus === "Paused") {
        fiverrReply = `[System Prompt Update] Fiverr Sales Bot has been successfully PAUSED. Auto-responder state is updated to Paused. Monitoring active.`;
      } else if (detectedBotStatus === "Active" && botStatus === "Paused") {
        fiverrReply = `[System Prompt Update] Fiverr Sales Bot has been RESUMED. Auto-responder state is updated to Active. Scan standing by.`;
      } else {
        fiverrReply = `[System Prompt Update] Auto-responder parameters adjusted to align with directive: "${currentInput}". Bot state is ${detectedBotStatus}.`;
      }

      let serviceReply = "";
      if (lowerInput.includes("form") || lowerInput.includes("intake") || lowerInput.includes("require")) {
        serviceReply = `[System Prompt Update] Intake Form sequence verified. Questionnaire dispatch interval set to immediate post-order trigger. Targets: Customer Profiles DB.`;
      } else if (lowerInput.includes("welcome") || lowerInput.includes("greet")) {
        serviceReply = `[System Prompt Update] Welcome Greeting rules updated. Contextual mapping of user inquiries aligned to portfolio templates.`;
      } else {
        serviceReply = `[System Prompt Update] Service standards updated. Milestones and onboarding check guidelines aligned to the directive: "${currentInput}".`;
      }

      let fallbackReply = "";
      if (lowerInput.includes("fallback") || lowerInput.includes("failover") || lowerInput.includes("slack")) {
        fallbackReply = `[System Prompt Update] Fallback Routing rules adjusted: Slack webhook failover activated. Webhook payload configured.`;
      } else if (lowerInput.includes("route") || lowerInput.includes("redirect")) {
        fallbackReply = `[System Prompt Update] Redirection rules checked. Standard domain escapes will map to operator lobby backup queue.`;
      } else {
        fallbackReply = `[System Prompt Update] Alternate routing and backup directives refreshed to support: "${currentInput}".`;
      }

      // Update message history across all tabs
      setMessages((prev) => ({
        "system-prompt": [
          ...prev["system-prompt"],
          {
            id: Date.now() + 1,
            sender: "ai",
            text: systemPromptReply,
            time: now,
          },
        ],
        "fiverr-bot": [
          ...prev["fiverr-bot"],
          {
            id: Date.now() + 2,
            sender: "ai",
            text: fiverrReply,
            time: now,
          },
        ],
        "service-guide": [
          ...prev["service-guide"],
          {
            id: Date.now() + 3,
            sender: "ai",
            text: serviceReply,
            time: now,
          },
        ],
        "alternative-guide": [
          ...prev["alternative-guide"],
          {
            id: Date.now() + 4,
            sender: "ai",
            text: fallbackReply,
            time: now,
          },
        ],
      }));

      // Set other tabs as unread to trigger notification pulse badges
      setUnreadTabs({
        "fiverr-bot": activeTab !== "fiverr-bot",
        "service-guide": activeTab !== "service-guide",
        "alternative-guide": activeTab !== "alternative-guide",
      });

      setIsTyping(false);
      addToast("System prompt updated! All modules sync-notified.", "success");
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
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
