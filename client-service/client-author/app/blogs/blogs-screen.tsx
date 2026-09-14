"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useBlogCategories, useBlogs } from "@/features/blogs/hooks";
import type { BlogFilters, BlogViewModel } from "@/features/blogs/model";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function BlogsGrid({ blogs }: { blogs: BlogViewModel[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {blogs.map((blog) => {
        const publishedDate = blog.publishedAt
          ? new Date(blog.publishedAt).toLocaleDateString("vi-VN")
          : "Chưa cập nhật";

        return (
          <motion.div key={blog.slug} variants={itemVariants}>
            <Link href={`/blogs/${blog.slug}`} className="group block h-full">
              <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 p-8"
                >
                  <div className="flex h-40 items-center justify-center text-4xl font-bold text-blue-300 group-hover:text-blue-400">
                    {blog.imageLabel}
                  </div>
                </motion.div>

                <div className="flex flex-1 flex-col px-6 py-4">
                  <div className="flex items-center justify-between">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                    >
                      {blog.categoryName}
                    </motion.span>
                    <span className="text-sm text-slate-500">{blog.readTime} phút đọc</span>
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-blue-600">
                    {blog.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{blog.excerpt}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="text-xs text-slate-500">
                      <p className="font-medium text-slate-700">{blog.authorName}</p>
                      <p>{publishedDate}</p>
                    </div>
                    <motion.div whileHover={{ x: 4 }} className="text-blue-600">
                      →
                    </motion.div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

export function BlogsScreen({ filters }: { filters: BlogFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const blogsQuery = useBlogs(filters);
  const categoriesQuery = useBlogCategories();

  const updateFilters = useCallback(
    (nextFilters: BlogFilters) => {
      const params = new URLSearchParams();
      if (nextFilters.search) params.set("q", nextFilters.search);
      if (nextFilters.category) params.set("category", nextFilters.category);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const blogs = blogsQuery.data?.items ?? [];
  const categories = categoriesQuery.data ?? [];
  const isPending = blogsQuery.isPending || categoriesQuery.isPending;
  const blockingError =
    (!blogsQuery.data && blogsQuery.error) || (!categoriesQuery.data && categoriesQuery.error);

  if (isPending) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center">Đang tải bài viết...</div>;
  }

  if (blockingError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Không thể tải bài viết</h1>
        <button
          type="button"
          onClick={() => void Promise.all([blogsQuery.refetch(), categoriesQuery.refetch()])}
          className="mt-5 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-slate-200 bg-white py-16 sm:py-24"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-blue-600 sm:text-5xl">Blog & Góc nhìn</h1>
          <p className="mt-4 text-xl text-slate-600">
            Khám phá các bài viết về thiết kế, thương mại điện tử và trải nghiệm số
          </p>
        </div>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      >
        <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
          <form
            key={filters.search ?? "all"}
            className="flex flex-1 gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              updateFilters({
                ...filters,
                search: String(data.get("q") ?? "").trim() || undefined,
              });
            }}
          >
            <input
              name="q"
              type="search"
              defaultValue={filters.search}
              placeholder="Tìm blog theo tên..."
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Tìm kiếm
            </button>
          </form>

          <select
            value={filters.category ?? ""}
            onChange={(event) =>
              updateFilters({ ...filters, category: event.target.value || undefined })
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            aria-label="Lọc blog theo chủ đề"
          >
            <option value="">Tất cả chủ đề</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Không tìm thấy bài viết</h2>
            <p className="mt-2 text-sm text-slate-500">Hãy thử tên hoặc chủ đề khác.</p>
          </div>
        ) : (
          <BlogsGrid blogs={blogs} />
        )}

        {(blogsQuery.isFetching || categoriesQuery.isFetching) && (
          <p className="mt-5 text-center text-sm text-slate-500">Đang cập nhật dữ liệu...</p>
        )}
      </motion.section>
    </div>
  );
}
