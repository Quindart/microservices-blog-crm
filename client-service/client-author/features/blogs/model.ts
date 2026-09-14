import type { Blog, Category } from "@/generated/api";

function stringProperty(value: Record<string, unknown> | undefined, key: string) {
  const property = value?.[key];
  return typeof property === "string" ? property : undefined;
}

export type BlogFilters = {
  page: number;
  limit: number;
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  sort?: "latest";
};

export type BlogViewModel = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  categoryName: string;
  categorySlug: string;
  authorName: string;
  publishedAt: string;
  readTime: number;
  coverImageUrl: string;
  tags: string[];
  imageLabel: string;
};

export type BlogCategoryOption = {
  label: string;
  value: string;
};

export function toBlogViewModel(blog: Blog): BlogViewModel {
  const slug = blog.slug ?? "blog";

  return {
    slug,
    title: blog.title ?? "Bài viết",
    excerpt: blog.excerpt ?? "Thông tin đang được cập nhật.",
    content: blog.content ?? "Nội dung đang được cập nhật.",
    categoryName: blog.category?.name ?? "Chưa phân loại",
    categorySlug: blog.category?.slug ?? "",
    authorName: stringProperty(blog.author, "name") ?? "Tác giả",
    publishedAt: blog.publishedAt ?? "",
    readTime: blog.readTime ?? 0,
    coverImageUrl: blog.coverImageUrl ?? "",
    tags: blog.tags ?? [],
    imageLabel: slug.slice(0, 2).toUpperCase(),
  };
}

export function toBlogCategoryOption(category: Category): BlogCategoryOption {
  return {
    label: category.name ?? "Chưa đặt tên",
    value: category.slug ?? "",
  };
}
