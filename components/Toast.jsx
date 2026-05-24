"use client";

import React from "react";
import toast, { Toaster as HotToaster } from "react-hot-toast";

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <HotToaster
        position="top-center"
        toastOptions={{
          // Apply class names dynamically supporting dark mode aesthetics
          className: "!bg-white dark:!bg-[#0f172a] !text-slate-800 dark:!text-slate-100 !border !border-slate-200/80 dark:!border-slate-800/80 !rounded-xl !shadow-lg !font-sans !text-sm !font-semibold !px-4 !py-3",
          duration: 3500,
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </>
  );
}

export function useToast() {
  const addToast = (message, type = "success") => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else if (type === "warning") {
      toast(message, {
        icon: "⚠️",
      });
    } else {
      toast(message, {
        icon: "ℹ️",
      });
    }
  };

  return { addToast };
}
