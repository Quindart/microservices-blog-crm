"use client";

import Link from "next/link";
import { ProductActions } from "@/components/product-actions";
import { useProduct } from "@/features/products/hooks";
import { formatVnd } from "@/lib/utils";

const priceToneClasses = {
  blue: "text-blue-700",
  emerald: "text-emerald-700",
  violet: "text-violet-700",
  rose: "text-rose-700",
};

export function ProductDetailScreen({ slug }: { slug: string }) {
  const productQuery = useProduct(slug);
  const product = productQuery.data;

  if (productQuery.isPending) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Không thể tải sản phẩm</h1>
        <button
          type="button"
          onClick={() => void productQuery.refetch()}
          className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Quay lại thư viện website
      </Link>

      <div className="grid gap-8 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)] lg:grid-cols-2 lg:p-8">
        <div className={`rounded-3xl bg-linear-to-br ${product.accent} p-6`}>
          <div className="flex h-full min-h-[430px] flex-col justify-between rounded-3xl border border-white/50 bg-white/35 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                {product.badge}
              </span>
              <span className="text-base font-medium text-slate-700">★ {product.rating}</span>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-24 rounded-full bg-slate-900/20" />
              <div className="h-4 w-36 rounded-full bg-slate-900/10" />
              <div className="h-48 rounded-3xl bg-white/40" />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            {product.categoryName}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            {product.name}
          </h1>
          <div className="mt-5 flex items-center gap-3 text-sm text-slate-600">
            <span>★ {product.rating}</span>
            <span>({product.reviews} đánh giá)</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={`text-4xl font-bold ${priceToneClasses[product.priceTone]}`}>
              {formatVnd(product.price)}
            </span>
            <span className="pb-1 text-sm text-slate-500">Bao gồm tư vấn triển khai</span>
          </div>

          <p className="mt-6 text-base leading-7 text-slate-600">{product.description}</p>
          <ProductActions product={product} />
        </div>
      </div>
    </div>
  );
}
