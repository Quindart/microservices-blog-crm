import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProductsScreen } from "./products-screen";
import { createQueryClient } from "@/lib/api/query-client";
import { createServerApiClient } from "@/lib/api/client.server";
import { productQueries } from "@/features/products/queries";
import type { ProductFilters } from "@/features/products/model";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toFilters(searchParams: Record<string, string | string[] | undefined>): ProductFilters {
  const sort = valueOf(searchParams.sort);
  const supportedSorts = ["newest", "price_asc", "price_desc", "rating", "popular"] as const;

  return {
    page: 1,
    limit: 12,
    search: valueOf(searchParams.q)?.trim() || undefined,
    category: valueOf(searchParams.category) || undefined,
    sort: supportedSorts.find((option) => option === sort),
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = toFilters(await searchParams);
  const queryClient = createQueryClient();
  const apiClient = createServerApiClient();

  await Promise.all([
    queryClient.prefetchQuery(productQueries.list(filters, apiClient)),
    queryClient.prefetchQuery(productQueries.categories(apiClient)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsScreen filters={filters} />
    </HydrationBoundary>
  );
}
