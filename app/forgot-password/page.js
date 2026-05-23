"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Sun, Moon, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../../components/InputField";
import { useDashboard } from "../../components/DashboardContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useDashboard();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    // Simulate API request to send reset code
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    toast.success("Verification code sent to your email!");
    // Push to verification step
    router.push("/verify-otp");
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
        className="w-full max-w-md"
      >
        {/* Brand Logo / Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:bg-indigo-500 dark:shadow-indigo-400/10">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Forgot password?
          </h2>
          <p className="mt-2 text-sm text-slate-550 dark:text-slate-400 max-w-[280px]">
            No worries, we'll send you instruction to reset your password.
          </p>
        </div>

        {/* Card Body */}
        <div className="mt-8 rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/40 dark:shadow-2xl">
          <form onSubmit={handleResetRequest} className="space-y-6">
            <InputField
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              labelClass="dark:text-slate-300"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 px-4 text-sm font-bold text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
