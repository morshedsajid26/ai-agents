"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Save, X, Sparkles, Pencil, Camera } from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../../components/InputField";
import { useDashboard } from "../../components/DashboardContext";
import { apiFetch } from "../../utils/api";

export default function SettingsPage() {
  const { profile, setProfile } = useDashboard();
  
  // Local state for form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        toast.success("Avatar updated locally! Save changes to apply.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync local fields when context loads the profile
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData) => {
      const json = await apiFetch("/user/update-profile", {
        method: "PUT",
        body: JSON.stringify(updatedData),
      });
      return json.data;
    },
    onSuccess: (data) => {
      setProfile(data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("API update failed:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
    },
  });

  const isSaving = updateProfileMutation.isPending;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Name and Email are required");
      return;
    }

    const updatedData = {
      name,
      email,
      avatarUrl: avatarUrl || null,
    };

    updateProfileMutation.mutate(updatedData);
  };

  const handleDiscard = () => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setAvatarUrl(profile.avatarUrl || "");
    }
    setIsEditing(false);
    toast.error("Changes discarded");
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120";

  return (
    <div className="flex-1 overflow-y-auto pr-1 pb-6 scrollbar-thin animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none shrink-0 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Profile Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-550 dark:text-slate-400">
            Update your personal account information, name, email address, and avatar image.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel: Quick Profile View */}
          <div className="md:col-span-1">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b0f19]">
              <div className="flex flex-col items-center text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={() => isEditing && fileInputRef.current?.click()}
                  className={`relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-850 shadow-inner group ${
                    isEditing ? "cursor-pointer ring-2 ring-indigo-500/50 hover:scale-105" : ""
                  } transition-all duration-300`}
                >
                  <img
                    src={avatarUrl || defaultAvatar}
                    alt="Profile Avatar"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="w-5 h-5 text-white mb-0.5" />
                      <span className="text-[10px] font-bold text-white tracking-wider uppercase">Change</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">
                  {name || "User"}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-none font-medium">
                  {profile.role || "USER"}
                </p>
                
                <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xxs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Standard Profile</span>
                </div>

                {/* Edit Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      handleDiscard();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className={`mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    isEditing
                      ? "border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      : "border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20"
                  }`}
                >
                  {isEditing ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>Cancel Edit</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Main Settings Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <User className="w-4 h-4 text-indigo-550 dark:text-indigo-400" />
                <span>Profile Information</span>
              </h2>
              
              <div className="space-y-4">
                <InputField
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                  readonly={!isEditing}
                />
                
                <InputField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@domain.com"
                  required
                  readonly={!isEditing}
                />
              </div>
            </div>

            {/* Action buttons */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-2 animate-fade-in">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-[#0b0f19] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Discard</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-550 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
