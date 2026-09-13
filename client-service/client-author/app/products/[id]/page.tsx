import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { ProductDetailScreen } from "./product-detail-screen";
import { productQueries } from "@/features/products/queries";
import { ApiError } from "@/lib/api/errors";
import { createQueryClient } from "@/lib/api/query-client";
import { createServerApiClient } from "@/lib/api/client.server";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const queryClient = createQueryClient();

  try {
    await queryClient.fetchQuery(productQueries.detail(slug, createServerApiClient()));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailScreen slug={slug} />
    </HydrationBoundary>
  );
}
