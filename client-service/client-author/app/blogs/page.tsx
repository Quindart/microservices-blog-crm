"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { blogs } from "@/lib/mock-data";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function BlogsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const selectedCategory = searchParams.get("category") ?? "";
  const categories = Array.from(new Set(blogs.map((blog) => blog.category))).sort();

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      !searchQuery ||
      blog.title.toLowerCase().includes(searchQuery) ||
      blog.excerpt.toLowerCase().includes(searchQuery);
    const matchesCategory = !selectedCategory || blog.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const updateFilters = (values: { q?: string; category?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (values.q?.trim()) params.set("q", values.q.trim());
    else params.delete("q");

    if (values.category) params.set("category", values.category);
    else params.delete("category");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-slate-200 bg-white py-16 sm:py-24"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl font-bold text-blue-600 sm:text-5xl"
          >
            Blog & Góc nhìn
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-4 text-xl text-slate-600"
          >
            Khám phá các bài viết về thiết kế, thương mại điện tử và trải nghiệm số
          </motion.p>
        </div>
      </motion.section>

      {/* Blogs Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      >
        <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
          <form
            className="flex flex-1 gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              updateFilters({
                q: String(formData.get("q") ?? ""),
                category: selectedCategory,
              });
            }}
          >
            <input
              name="q"
              type="search"
              defaultValue={searchParams.get("q") ?? ""}
              placeholder="Tìm blog theo tên..."
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              aria-label="Tìm blog theo tên"
            />
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Tìm kiếm
            </button>
          </form>

          <select
            value={selectedCategory}
            onChange={(event) =>
              updateFilters({ q: searchParams.get("q") ?? "", category: event.target.value })
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            aria-label="Lọc blog theo chủ đề"
          >
            <option value="">Tất cả chủ đề</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Không tìm thấy bài viết</h2>
            <p className="mt-2 text-sm text-slate-500">Hãy thử tên hoặc chủ đề khác.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <motion.div key={blog.slug} variants={itemVariants}>
                <Link href={`/blogs/${blog.slug}`} className="group block h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
                    {/* Image Placeholder */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 p-8"
                    >
                      <div className="flex h-40 items-center justify-center text-4xl font-bold text-blue-300 group-hover:text-blue-400">
                        {blog.image.split("-")[0].slice(0, 2).toUpperCase()}
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col px-6 py-4">
                      <div className="flex items-center justify-between">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                        >
                          {blog.category}
                        </motion.span>
                        <span className="text-sm text-slate-500">{blog.readTime} phút đọc</span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-blue-600">
                        {blog.title}
                      </h3>

                      <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-3">
                        {blog.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="text-xs text-slate-500">
                          <p className="font-medium text-slate-700">{blog.author}</p>
                          <p>{new Date(blog.publishedAt).toLocaleDateString("vi-VN")}</p>
                        </div>
                        <motion.div whileHover={{ x: 4 }} className="text-blue-600">
                          →
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4 text-center text-slate-500">
            Đang tải bài viết...
          </div>
        </div>
      }
    >
      <BlogsContent />
    </Suspense>
  );
}
