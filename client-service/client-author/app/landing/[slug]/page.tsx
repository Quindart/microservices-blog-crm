import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { LandingDetailScreen } from "./landing-detail-screen";
import { landingPageQueries } from "@/features/landing-pages/queries";
import { createServerApiClient } from "@/lib/api/client.server";
import { ApiError } from "@/lib/api/errors";
import { createQueryClient } from "@/lib/api/query-client";

export default async function LandingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const queryClient = createQueryClient();

  try {
    await queryClient.fetchQuery(landingPageQueries.detail(slug, createServerApiClient()));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingDetailScreen slug={slug} />
    </HydrationBoundary>
  );
}
