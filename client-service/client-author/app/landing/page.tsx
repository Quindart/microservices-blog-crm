import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { LandingPagesScreen } from "./landing-pages-screen";
import { landingPageQueries } from "@/features/landing-pages/queries";
import { createServerApiClient } from "@/lib/api/client.server";
import { createQueryClient } from "@/lib/api/query-client";

const filters = { page: 1, limit: 12 };

export default async function LandingPageDirectory() {
  const queryClient = createQueryClient();

  await queryClient.prefetchQuery(
    landingPageQueries.list(filters, createServerApiClient()),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPagesScreen filters={filters} />
    </HydrationBoundary>
  );
}
