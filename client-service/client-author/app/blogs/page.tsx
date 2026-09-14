import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { BlogsScreen } from "./blogs-screen";
import { blogQueries } from "@/features/blogs/queries";
import type { BlogFilters } from "@/features/blogs/model";
import { createServerApiClient } from "@/lib/api/client.server";
import { createQueryClient } from "@/lib/api/query-client";

type BlogsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toFilters(searchParams: Record<string, string | string[] | undefined>): BlogFilters {
  return {
    page: 1,
    limit: 12,
    search: valueOf(searchParams.q)?.trim() || undefined,
    category: valueOf(searchParams.category) || undefined,
    sort: "latest",
  };
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const filters = toFilters(await searchParams);
  const queryClient = createQueryClient();
  const apiClient = createServerApiClient();

  await Promise.all([
    queryClient.prefetchQuery(blogQueries.list(filters, apiClient)),
    queryClient.prefetchQuery(blogQueries.categories(apiClient)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogsScreen filters={filters} />
    </HydrationBoundary>
  );
}
