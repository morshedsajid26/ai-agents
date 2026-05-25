"use client";

import React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Edit2, Trash2, Plus, Check, X, Search } from "lucide-react";
import { useToast } from "./Toast";
import { useDashboard } from "./DashboardContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../utils/api";
import Dropdown from "./Dropdown";
import {
  BotIcon,
  PromptIcon,
  TrainingIcon,
  HistoryIcon,
  ConversationIcon,
  GuideIcon,
  AlternateIcon
} from "./Icons";

export default function Sidebar({
  activeTab,
  isOpen,
  setIsOpen,
}) {
  const { addToast } = useToast();
  const { history, setPromptText, profile, activeConversationId, setActiveConversationId, setActiveTab } = useDashboard();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();

  const [editingId, setEditingId] = React.useState(null);



  const modelOptions = ["GPT", "Claude (Haiku)", "Claude (Sonnet)"];
  const modelMap = {
    "GPT": "GPT",
    "Claude (Haiku)": "CLAUDE_HAIKU",
    "Claude (Sonnet)": "SONNET"
  };
  const reverseModelMap = {
    "GPT": "GPT",
    "CLAUDE_HAIKU": "Claude (Haiku)",
    "SONNET": "Claude (Sonnet)"
  };
  const [editName, setEditName] = React.useState("");

  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [deleteConvId, setDeleteConvId] = React.useState(null);
  const [newConvForm, setNewConvForm] = React.useState({
    name: "",
    categoryId: "",
    type: "GLOBAL",
    aiModel: "GPT"
  });

  const [searchQuery, setSearchQuery] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { id: "system-prompt", label: "Global Chat", icon: ConversationIcon, href: "/" },
  ];

  if (profile?.role === "SYSTEM_OWNER") {
    menuItems.push(
      { id: "agent-training", label: "Agent Training", icon: TrainingIcon, href: "/agent-training" },
      { id: "user-management", label: "User Management", icon: Users, href: "/user-management" }
    );
  }

  const handleItemClick = (itemId) => {
    if (itemId === "system-prompt") {
      setActiveTab("system-prompt");
      setActiveConversationId(null);
    }
    // Close sidebar on mobile after selecting an item
    if (isOpen && window.innerWidth < 1280) {
      setIsOpen(false);
    }
  };

  // Queries & Mutations
  const { data: conversationsResponse, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await apiFetch("/conversation/all");
      return res;
    },
  });
  
  const conversations = conversationsResponse?.data || [];

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiFetch("/category/all");
      return res;
    },
  });
  
  const categories = categoriesResponse?.data || [];
  const serviceOptions = categories.map(c => c.type);

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    if (categories.length > 0 && !newConvForm.categoryId) {
      setNewConvForm(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, newConvForm.categoryId]);

  const createMutation = useMutation({
    mutationFn: async (formData) => {
      return apiFetch("/conversation", {
        method: "POST",
        body: JSON.stringify(formData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setShowCreateModal(false);
      setNewConvForm({ name: "", categoryId: categories.length > 0 ? categories[0].id : "", type: "GLOBAL", aiModel: "GPT" });
      addToast("Conversation created", "success");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      return apiFetch(`/conversation/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setEditingId(null);
      addToast("Conversation renamed", "success");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiFetch(`/conversation/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setDeleteConvId(null);
      addToast("Conversation deleted", "success");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 border-r border-slate-200/70 bg-white dark:bg-[#0b0f19] dark:border-slate-800/80 flex flex-col h-screen shrink-0 select-none transition-all duration-300 xl:static xl:translate-x-0 ${
        isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full xl:translate-x-0 xl:w-20"
      }`}
    >
      {/* Header / Branding (Fixed Logo) */}
      <div className={`h-[76px] flex items-center  shrink-0 ${
        isOpen ? "px-6" : "justify-center px-2"
      }`}>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e1726] text-white shadow-sm shrink-0">
              <BotIcon className="h-5 w-5" />
            </div>
            <div className="truncate">
              <h1 className="font-sans text-base font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-none">
                Sales Assistant
              </h1>
              <p className="mt-1 font-sans text-xxs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                AI-Native CRM
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e1726] text-white shadow-sm mx-auto">
            <BotIcon className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`py-6 space-y-2 overflow-y-auto flex-1 ${
        isOpen ? "px-3" : "px-2 flex flex-col items-center"
      }`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href || "#"}
              onClick={(e) => {
                if (item.id === "system-prompt") {
                  e.preventDefault();
                  setShowCreateModal(true);
                } else {
                  setActiveConversationId(null);
                }
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              title={!isOpen ? item.label : ""}
              className={`flex items-center rounded-lg text-sm font-medium tracking-wide transition-all duration-200 relative group cursor-pointer ${
                isOpen
                  ? "w-full gap-3.5 px-4 py-3 justify-start"
                  : "w-11 h-11 justify-center"
              } ${
                isActive
                  ? "bg-[#eef2ff] text-[#3b82f6] dark:bg-[#1e293b] dark:text-[#3b82f6]"
                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60  dark:hover:text-slate-205"
              }`}
            >
              {isActive && isOpen && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#3b82f6]" />
              )}
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "text-[#3b82f6]" : "text-slate-400 dark:text-slate-500"
                }`}
              />
              {isOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Recents list styled like ChatGPT */}
      {isOpen && (
        <div className="mx-3 mb-6 pt-5 flex-1 flex flex-col min-h-0 overflow-hidden select-none animate-fade-in">
          <div className="mb-4 px-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/60 border-none rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
          </div>

          <div className="mb-3 px-3 flex items-center justify-between text-slate-400 dark:text-slate-500 shrink-0">
            <span className="text-xs font-black uppercase tracking-wider">
              Recents
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-1 space-y-1 scrollbar-thin">
            {isLoading ? (
              <div className="text-sm text-center py-4 text-slate-400">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-sm text-center py-4 text-slate-400">No conversations</div>
            ) : (
              filteredConversations.map((conv) => {
                const isActiveConv = activeConversationId === conv.id;
                const isEditing = editingId === conv.id;

                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      isActiveConv
                        ? "bg-indigo-50 dark:bg-indigo-500/10"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex w-full items-center gap-1">
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateMutation.mutate({ id: conv.id, name: editName });
                            } else if (e.key === "Escape") {
                              setEditingId(null);
                            }
                          }}
                          className="flex-1 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 outline-none w-full"
                        />
                        <button
                          onClick={() => updateMutation.mutate({ id: conv.id, name: editName })}
                          className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            const routeMap = {
                              GLOBAL: "/"
                            };
                            const targetRoute = routeMap[conv.type] || "/";
                            
                            setActiveConversationId(conv.id);
                            
                            // If it's a GLOBAL chat going to the main page, make sure the global chat tab is active
                            if (targetRoute === "/") {
                              setActiveTab("system-prompt");
                            }
                            
                            if (pathname !== targetRoute) {
                              router.push(targetRoute);
                            }
                            
                            addToast(`Opened ${conv.name}`, "info");
                          }}
                          className={`flex-1 truncate text-left focus:outline-none ${
                            isActiveConv
                              ? "font-semibold text-indigo-700 dark:text-indigo-400"
                              : "font-medium text-slate-700 dark:text-slate-300"
                          }`}
                          title={conv.name}
                        >
                          <span className="truncate flex-1 font-medium group-hover:text-[#3b82f6] transition-colors">{conv.name}</span>
                        </button>
                        
                        {/* Action buttons (hidden by default, show on group-hover) */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(conv.id);
                              setEditName(conv.name);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-500 rounded hover:bg-white dark:hover:bg-[#0f172a] transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConvId(conv.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-white dark:hover:bg-[#0f172a] transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Footer Profile Section - Static display */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 shrink-0">
        <div
          className={`flex items-center gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
            isOpen ? "px-4" : "justify-center"
          }`}
        >
          <img
            src={profile.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120"}
            alt="User profile"
            className="w-8 h-8 rounded-full object-cover border border-slate-200/60 dark:border-slate-800 shadow-xs"
          />
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {profile.name}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium">
                {profile.email}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Create Conversation Modal */}
      {showCreateModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800/80 dark:bg-[#0b0f19] animate-fade-in relative flex flex-col">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer font-bold text-lg leading-none flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              New Conversation
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
                <input
                  type="text"
                  value={newConvForm.name}
                  onChange={(e) => setNewConvForm({ ...newConvForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  placeholder="e.g. Johan Flueren"
                  autoFocus
                />
              </div>

              <div>
                <Dropdown
                  label="Service"
                  options={serviceOptions}
                  value={categories.find(c => c.id === newConvForm.categoryId)?.type || ""}
                  onSelect={(val) => {
                    const selectedCat = categories.find(c => c.type === val);
                    if (selectedCat) {
                      setNewConvForm({ ...newConvForm, categoryId: selectedCat.id });
                    }
                  }}
                  className="w-full"
                  labelClass="!text-sm !font-bold !text-slate-700 dark:!text-slate-300 !mb-1"
                  inputClass="!bg-slate-50 dark:!bg-slate-900/50 !text-slate-800 dark:!text-slate-100 !px-3 !py-2 !rounded-xl !border !border-slate-200 dark:!border-slate-700 !outline-none focus:!ring-2 focus:!ring-indigo-500 !transition-shadow !appearance-none"
                  optionClass="dark:!bg-[#0f172a] dark:!border-slate-700 dark:!text-slate-200"
                />
              </div>

              <div>
                <Dropdown
                  label="AI Model"
                  options={modelOptions}
                  value={reverseModelMap[newConvForm.aiModel]}
                  onSelect={(val) => setNewConvForm({ ...newConvForm, aiModel: modelMap[val] })}
                  className="w-full"
                  labelClass="!text-sm !font-bold !text-slate-700 dark:!text-slate-300 !mb-1"
                  inputClass="!bg-slate-50 dark:!bg-slate-900/50 !text-slate-800 dark:!text-slate-100 !px-3 !py-2 !rounded-xl !border !border-slate-200 dark:!border-slate-700 !outline-none focus:!ring-2 focus:!ring-indigo-500 !transition-shadow !appearance-none"
                  optionClass="dark:!bg-[#0f172a] dark:!border-slate-700 dark:!text-slate-200"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!newConvForm.name.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate(newConvForm)}
                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {createMutation.isPending ? "Creating..." : "Create Chat"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Conversation Modal */}
      {deleteConvId && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-slate-800/80 dark:bg-[#0b0f19] animate-fade-in relative flex flex-col">
            <button
              onClick={() => setDeleteConvId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-all cursor-pointer font-bold text-lg leading-none flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Delete Conversation
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConvId(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteConvId)}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}
