"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createQueryClient } from "@/lib/api/query-client";

let browserQueryClient: ReturnType<typeof createQueryClient> | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
