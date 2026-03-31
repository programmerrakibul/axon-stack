"use client";

import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { toast } from "sonner";
import React from "react";
import { getErrorMessage } from "@/shared/client/errors";

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      // Global query error handler — fires once per unique error per query.
      // Using the serialised query key as the toast ID prevents duplicate
      // toasts when TanStack Query retries the same failing query.
      onError(error, query) {
        const id = JSON.stringify(query.queryKey);
        toast.error(getErrorMessage(error), { id });
      },
    }),
    defaultOptions: {
      queries: {
        // Only retry once to keep the UX snappy and avoid flooding toasts
        retry: 1,
        staleTime: 30_000,
      },
    },
  });
}

// Singleton outside the component so it survives HMR in dev
let browserClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client
    return makeQueryClient();
  }
  if (!browserClient) browserClient = makeQueryClient();
  return browserClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
