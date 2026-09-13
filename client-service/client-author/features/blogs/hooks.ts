"use client";

import { useQuery } from "@tanstack/react-query";
import { getBrowserApiClient } from "@/lib/api/client.browser";
import type { BlogFilters } from "./model";
import { blogQueries } from "./queries";

export function useBlogs(filters: BlogFilters) {
  return useQuery(blogQueries.list(filters, getBrowserApiClient()));
}

export function useBlog(slug: string) {
  return useQuery(blogQueries.detail(slug, getBrowserApiClient()));
}

export function useBlogCategories() {
  return useQuery(blogQueries.categories(getBrowserApiClient()));
}
