"use client";

import { useQuery } from "@tanstack/react-query";
import { getBrowserApiClient } from "@/lib/api/client.browser";
import type { ProductFilters } from "./model";
import { productQueries } from "./queries";

export function useProducts(filters: ProductFilters) {
  return useQuery(productQueries.list(filters, getBrowserApiClient()));
}

export function useProduct(slug: string) {
  return useQuery(productQueries.detail(slug, getBrowserApiClient()));
}

export function useProductCategories() {
  return useQuery(productQueries.categories(getBrowserApiClient()));
}
