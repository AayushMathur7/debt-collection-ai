import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { CustomersProvider } from "@/context/CustomersContext";
import { AgentSettingsProvider } from "@/context/AgentSettingsContext";
import { ConversationProvider } from '@/context/ConversationContext';
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
        <AgentSettingsProvider>
          <CustomersProvider>
            <ConversationProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </ConversationProvider>
            <Toaster richColors closeButton position="bottom-right" />
          </CustomersProvider>
        </AgentSettingsProvider>
      </body>
    </html>
  );
}
