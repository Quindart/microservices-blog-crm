"use client";

import { createClient, type Client } from "@/generated/api/client";

let browserClient: Client | undefined;

export function getBrowserApiClient(): Client {
  browserClient ??= createClient({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/backend-api",
  });

  return browserClient;
}
