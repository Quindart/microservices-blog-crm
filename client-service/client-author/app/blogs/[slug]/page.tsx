"use client";

import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { blogs } from "@/lib/mock-data";

type BlogDetailProps = {
  params: Promise<{ slug: string }>;
};

async function BlogDetailContent({ slug }: { slug: string }) {
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Không tìm thấy bài viết</h1>
          <Link href="/blogs" className="mt-4 text-blue-600 hover:underline">
            ← Quay lại Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-slate-50">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-slate-200 bg-white py-12 sm:py-16"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blogs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Quay lại Blog
          </Link>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex items-center gap-2"
          >
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {blog.category}
            </span>
            <span className="text-sm text-slate-500">{blog.readTime} phút đọc</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl"
          >
            {blog.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{blog.author}</p>
              <p className="text-sm text-slate-600">
                {new Date(blog.publishedAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 via-slate-100 to-blue-50 p-16 text-center">
          <div className="text-6xl font-bold text-blue-300">
            {blog.image.split("-")[0].slice(0, 2).toUpperCase()}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8"
      >
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 leading-relaxed">{blog.content}</p>

          <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-8">
            <h3 className="text-lg font-bold text-blue-900">Điểm chính</h3>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li>• Chiến lược toàn diện dựa trên các phương pháp đã được kiểm chứng</li>
              <li>• Góc nhìn thực tế có thể áp dụng ngay</li>
              <li>• Ví dụ thực tế và nghiên cứu tình huống</li>
              <li>• Chỉ số hiệu quả và kết quả có thể đo lường</li>
            </ul>
          </div>

          {/* Tags */}
          <div className="mt-12 border-t border-slate-200 pt-8">
            <p className="mb-4 text-sm font-medium text-slate-700">Chủ đề:</p>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <motion.span
                  key={tag}
                  whileHover={{ scale: 1.05 }}
                  className="inline-block rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-blue-100"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 rounded-lg border border-slate-200 bg-white p-8 text-center"
        >
          <h3 className="text-xl font-bold text-slate-900">Sẵn sàng nâng tầm cửa hàng?</h3>
          <p className="mt-2 text-slate-600">Khám phá các mẫu website và giải pháp để bắt đầu.</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700"
          >
            Khám phá cửa hàng
          </Link>
        </motion.div>
      </motion.section>
    </article>
  );
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center text-slate-500">
            Đang tải bài viết...
          </div>
        </div>
      }
    >
      <BlogDetailContent slug={slug} />
    </Suspense>
  );
}
