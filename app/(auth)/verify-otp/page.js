"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import OTPInput from "../../../components/OTPInput";
import { useDashboard } from "../../../components/DashboardContext";
import { apiFetch } from "../../../utils/api";

function VerifyOtpContent() {
  const { theme, toggleTheme } = useDashboard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (val) => {
    if (!email) {
      toast.error("Email not found. Please restart the forgot password process.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await apiFetch("/auth/verify-forgot-password-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp: val }),
      });
      
      toast.success("OTP Verified Successfully!");
      
      // Store the token and email in sessionStorage so it can be securely used in the next step
      const resetToken = res.data?.token || res.data?.resetToken || res.token || val;
      sessionStorage.setItem("resetToken", resetToken);
      sessionStorage.setItem("resetEmail", email);
      
      // Navigate to reset password without exposing token in URL
      router.push("/reset-password");
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      toast.success("A new verification code has been sent!");
    } catch (error) {
      toast.error(error.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Decorative Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[60%] rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-950/20" />
        <div className="absolute -bottom-[40%] -right-[20%] h-[80%] w-[60%] rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-950/20" />
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800/80"
        title="Toggle Theme"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-amber-500" />
        ) : (
          <Moon className="h-5 w-5 text-slate-555" />
        )}
      </button>

      {/* Auth Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/70 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/40 dark:shadow-2xl overflow-hidden"
      >
        <OTPInput 
          email={email} 
          onComplete={handleVerify} 
          onResend={handleResend} 
          isVerifying={isVerifying} 
          isResending={isResending} 
        />
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
