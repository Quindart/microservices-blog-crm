"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useBlog } from "@/features/blogs/hooks";

export function BlogDetailScreen({ slug }: { slug: string }) {
  const blogQuery = useBlog(slug);
  const blog = blogQuery.data;

  if (blogQuery.isPending) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center">Đang tải bài viết...</div>;
  }

  if (!blog) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Không thể tải bài viết</h1>
        <button
          type="button"
          onClick={() => void blogQuery.refetch()}
          className="mt-5 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const publishedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("vi-VN")
    : "Chưa cập nhật";

  return (
    <article className="min-h-screen bg-slate-50">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-slate-200 bg-white py-12 sm:py-16"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link href="/blogs" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            ← Quay lại Blog
          </Link>
          <div className="mt-6 flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {blog.categoryName}
            </span>
            <span className="text-sm text-slate-500">{blog.readTime} phút đọc</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">{blog.title}</h1>
          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-sm font-medium text-slate-900">{blog.authorName}</p>
            <p className="text-sm text-slate-600">{publishedDate}</p>
          </div>
        </div>
      </motion.section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 via-slate-100 to-blue-50 p-16 text-center">
          <div className="text-6xl font-bold text-blue-300">{blog.imageLabel}</div>
        </div>
      </div>

      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="prose prose-slate max-w-none">
          <p className="text-lg leading-relaxed text-slate-700">{blog.content}</p>
          <div className="mt-12 border-t border-slate-200 pt-8">
            <p className="mb-4 text-sm font-medium text-slate-700">Chủ đề:</p>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-lg border border-slate-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">Sẵn sàng nâng tầm cửa hàng?</h2>
          <p className="mt-2 text-slate-600">Khám phá các mẫu website và giải pháp để bắt đầu.</p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
          >
            Khám phá cửa hàng
          </Link>
        </div>
      </section>
    </article>
  );
}
