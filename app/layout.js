import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "../components/DashboardLayout";
import { ToastProvider } from "../components/Toast";
import QueryProvider from "../components/QueryProvider";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <QueryProvider>
            <DashboardProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </DashboardProvider>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
