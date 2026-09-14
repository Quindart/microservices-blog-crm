import "server-only";

import { createClient, type Client } from "@/generated/api/client";

export function createServerApiClient(): Client {
  return createClient({
    baseUrl: process.env.API_PROXY_TARGET ?? "http://localhost:8080",
  });
}
