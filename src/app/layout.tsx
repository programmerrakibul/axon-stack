import "./globals.css";

import type { Metadata } from "next";

// Initialize and validate environment variables on server startup
// This ensures all required env vars are present before the app renders
import { initEnv } from "@/shared/env";

// Call initialization immediately when the layout module loads
initEnv();
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AxonStack",
  description: "A modern dashboard application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
