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
    <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-transparent pb-10 scrollbar-thin animate-fade-in">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Settings
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Manage your profile information, email address, and security preferences.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#0b0f19] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden transition-all duration-300">
            
            {/* Card Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Update your photo and personal details.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { if (isEditing) handleDiscard(); else setIsEditing(true); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                  isEditing 
                    ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" 
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:dark:bg-slate-700 shadow-sm"
                }`}
              >
                {isEditing ? <><X className="w-4 h-4"/> Cancel</> : <><Pencil className="w-4 h-4"/> Edit</>}
              </button>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-10 sm:gap-12 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-5 shrink-0 w-full md:w-auto">
                <div className="relative group">
                  <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md ${isEditing ? 'ring-4 ring-indigo-100 dark:ring-indigo-500/20' : ''} transition-all duration-300`}>
                    <img 
                      src={avatarUrl || defaultAvatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      onError={(e) => e.target.src = defaultAvatar} 
                    />
                    {isEditing && (
                      <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
                      >
                        <Camera className="w-7 h-7 text-white mb-1.5" />
                        <span className="text-xs font-bold text-white tracking-wider uppercase">Upload</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>{profile.role || "STANDARD USER"}</span>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="flex-1 space-y-6 w-full max-w-xl">
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

            {/* Card Footer for Save */}
            {isEditing && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 flex justify-end animate-fade-in">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            )}

          </div>
        </form>
      </div>
    </div>
  );
}
