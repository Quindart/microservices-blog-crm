import type { ProductFilters } from "./model";

export function buildProductSearchParams(filters: ProductFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set("q", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort) params.set("sort", filters.sort);

  return params;
}
