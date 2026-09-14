"use client";

import { useQuery } from "@tanstack/react-query";
import { getBrowserApiClient } from "@/lib/api/client.browser";
import type { LandingPageFilters } from "./model";
import { landingPageQueries } from "./queries";

export function useLandingPages(filters: LandingPageFilters) {
  return useQuery(landingPageQueries.list(filters, getBrowserApiClient()));
}

export function useLandingPage(slug: string) {
  return useQuery(landingPageQueries.detail(slug, getBrowserApiClient()));
}
