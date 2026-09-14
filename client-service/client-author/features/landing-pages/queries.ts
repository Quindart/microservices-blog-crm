import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import {
  getLandingPage,
  listLandingPages,
  type Pagination,
} from "@/generated/api";
import type { Client } from "@/generated/api/client";
import { unwrapResponse } from "@/lib/api/errors";
import {
  toLandingPageViewModel,
  type LandingPageFilters,
  type LandingPageViewModel,
} from "./model";

export type LandingPageListResult = {
  items: LandingPageViewModel[];
  pagination?: Pagination;
};

export const landingPageQueries = {
  keys: {
    all: ["landing-pages"] as const,
    list: (filters: LandingPageFilters) => ["landing-pages", "list", filters] as const,
    detail: (slug: string) => ["landing-pages", "detail", slug] as const,
  },
  list: (filters: LandingPageFilters, client: Client) =>
    queryOptions({
      queryKey: landingPageQueries.keys.list(filters),
      queryFn: async (): Promise<LandingPageListResult> => {
        const payload = unwrapResponse(await listLandingPages({ client, query: filters }));
        return {
          items: (payload.items ?? []).map(toLandingPageViewModel),
          pagination: payload.pagination,
        };
      },
      placeholderData: keepPreviousData,
    }),
  detail: (slug: string, client: Client) =>
    queryOptions({
      queryKey: landingPageQueries.keys.detail(slug),
      queryFn: async () =>
        toLandingPageViewModel(
          unwrapResponse(await getLandingPage({ client, path: { slug } })),
        ),
    }),
};
