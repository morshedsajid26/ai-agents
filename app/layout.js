import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "../components/DashboardLayout";
import { ToastProvider } from "../components/Toast";
import { DashboardProvider } from "../components/DashboardContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sales Assistant AI-Native CRM",
  description: "Autonomous Fiverr lead conversion & inquiry management dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <DashboardProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </DashboardProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
