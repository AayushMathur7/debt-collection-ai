import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { CustomersProvider } from "@/context/CustomersContext";
import { AgentSettingsProvider } from "@/context/AgentSettingsContext";
import { ClientLayout } from "./layout.client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Debt Collection AI",
  description: "AI-powered debt collection platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CustomersProvider>
          <AgentSettingsProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
            <Toaster richColors closeButton position="top-right" />
          </AgentSettingsProvider>
        </CustomersProvider>
      </body>
    </html>
  );
}
