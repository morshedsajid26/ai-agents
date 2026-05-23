"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AgentTrainingView from "../../components/AgentTrainingView";
import { useDashboard } from "../../components/DashboardContext";
import Cookies from "js-cookie";

export default function Page() {
  const { profile } = useDashboard();
  const router = useRouter();

  // Retrieve role checking localStorage/cookies synchronously to avoid race conditions
  const getActiveRole = () => {
    if (profile?.role) return profile.role;
    if (typeof window !== "undefined") {
      try {
        const cookieRole = Cookies.get("role");
        if (cookieRole) return cookieRole;

        const saved = localStorage.getItem("user-profile");
        if (saved) return JSON.parse(saved).role;
      } catch (e) {
        console.error(e);
      }
    }
    return undefined;
  };

  const activeRole = getActiveRole();

  useEffect(() => {
    if (activeRole !== undefined && activeRole !== "SYSTEM_OWNER") {
      toast.error("Access denied: ADMIN role required.");
      router.push("/");
    }
  }, [activeRole, router]);

  if (activeRole === undefined || activeRole !== "SYSTEM_OWNER") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return <AgentTrainingView />;
}
