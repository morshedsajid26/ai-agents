"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Sun, Moon, ArrowRight, Bot } from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../../components/InputField";
import Password from "../../components/Password";
import { useDashboard } from "../../components/DashboardContext";
import { apiFetch } from "../../utils/api";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme, setProfile } = useDashboard();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      return await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: (json) => {
      const { accessToken, refreshToken, user } = json.data;

      // Role check
      if (!user || !user.role) {
        toast.error("Login failed: User role not assigned.");
        return;
      }

      // Cookie storage
      Cookies.set("accessToken", accessToken, { expires: 1, path: "/" });
      Cookies.set("refreshToken", refreshToken, { expires: 7, path: "/" });
      Cookies.set("role", user.role, { expires: 1, path: "/" });
     

      // Update context & local storage profile state
      setProfile(user);

      toast.success(json.message || "Successfully logged in!");
      router.push("/");
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred during login. Please try again.");
    },
  });

  const isLoading = loginMutation.isPending;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ email, password });
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
          <Moon className="h-5 w-5 text-slate-550" />
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
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your Sales Assistant CRM
          </p>
        </div>

        {/* Card Body */}
        <div className="mt-8 rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/40 dark:shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
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

            <div className="space-y-1">
              <Password
              label={`Password`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                name="password"
              />
              <div className="flex items-center justify-end mt-2">
           
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-450 dark:hover:text-indigo-400"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-offset-slate-900"
              />
              <label
                htmlFor="remember-me"
                className="ml-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 select-none cursor-pointer"
              >
                Keep me signed in
              </label>
            </div>

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
                  <span>Sign In</span>
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        {/* <p className="mt-8 text-center text-sm text-slate-550 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-455 dark:hover:text-indigo-400"
          >
            Create account
          </Link>
        </p> */}
      </motion.div>
    </div>
  );
}
