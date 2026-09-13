import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  getProduct,
  listCategories,
  listProducts,
  type Pagination,
} from "@/generated/api";
import type { Client } from "@/generated/api/client";
import { unwrapResponse } from "@/lib/api/errors";
import {
  toCategoryOption,
  toProductViewModel,
  type ProductFilters,
  type ProductViewModel,
} from "./model";

export type ProductListResult = {
  items: ProductViewModel[];
  pagination?: Pagination;
};

export const productQueries = {
  keys: {
    all: ["products"] as const,
    list: (filters: ProductFilters) => ["products", "list", filters] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    categories: ["products", "categories"] as const,
  },
  list: (filters: ProductFilters, client: Client) =>
    queryOptions({
      queryKey: productQueries.keys.list(filters),
      queryFn: async (): Promise<ProductListResult> => {
        const payload = unwrapResponse(await listProducts({ client, query: filters }));
        return {
          items: (payload.items ?? []).map(toProductViewModel),
          pagination: payload.pagination,
        };
      },
      placeholderData: keepPreviousData,
    }),
  detail: (slug: string, client: Client) =>
    queryOptions({
      queryKey: productQueries.keys.detail(slug),
      queryFn: async () =>
        toProductViewModel(unwrapResponse(await getProduct({ client, path: { slug } }))),
    }),
  categories: (client: Client) =>
    queryOptions({
      queryKey: productQueries.keys.categories,
      queryFn: async () =>
        unwrapResponse(await listCategories({ client }))
          .map(toCategoryOption)
          .filter((category) => category.value.length > 0),
    }),
};
