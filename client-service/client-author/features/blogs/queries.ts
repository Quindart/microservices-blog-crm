import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  getBlog,
  listBlogCategories,
  listBlogs,
  type Pagination,
} from "@/generated/api";
import type { Client } from "@/generated/api/client";
import { unwrapResponse } from "@/lib/api/errors";
import {
  toBlogCategoryOption,
  toBlogViewModel,
  type BlogFilters,
  type BlogViewModel,
} from "./model";

export type BlogListResult = {
  items: BlogViewModel[];
  pagination?: Pagination;
};

export const blogQueries = {
  keys: {
    all: ["blogs"] as const,
    list: (filters: BlogFilters) => ["blogs", "list", filters] as const,
    detail: (slug: string) => ["blogs", "detail", slug] as const,
    categories: ["blogs", "categories"] as const,
  },
  list: (filters: BlogFilters, client: Client) =>
    queryOptions({
      queryKey: blogQueries.keys.list(filters),
      queryFn: async (): Promise<BlogListResult> => {
        const payload = unwrapResponse(await listBlogs({ client, query: filters }));
        return {
          items: (payload.items ?? []).map(toBlogViewModel),
          pagination: payload.pagination,
        };
      },
      placeholderData: keepPreviousData,
    }),
  detail: (slug: string, client: Client) =>
    queryOptions({
      queryKey: blogQueries.keys.detail(slug),
      queryFn: async () => toBlogViewModel(unwrapResponse(await getBlog({ client, path: { slug } }))),
    }),
  categories: (client: Client) =>
    queryOptions({
      queryKey: blogQueries.keys.categories,
      queryFn: async () =>
        unwrapResponse(await listBlogCategories({ client }))
          .map(toBlogCategoryOption)
          .filter((category) => category.value.length > 0),
    }),
};
