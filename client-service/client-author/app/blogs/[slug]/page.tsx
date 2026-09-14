import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { BlogDetailScreen } from "./blog-detail-screen";
import { blogQueries } from "@/features/blogs/queries";
import { createServerApiClient } from "@/lib/api/client.server";
import { ApiError } from "@/lib/api/errors";
import { createQueryClient } from "@/lib/api/query-client";

type BlogDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const queryClient = createQueryClient();

  try {
    await queryClient.fetchQuery(blogQueries.detail(slug, createServerApiClient()));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogDetailScreen slug={slug} />
    </HydrationBoundary>
  );
}
