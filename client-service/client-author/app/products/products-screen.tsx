"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useProductCategories, useProducts } from "@/features/products/hooks";
import { buildProductSearchParams } from "@/features/products/filters";
import type { ProductFilters, ProductViewModel } from "@/features/products/model";
import { formatVnd } from "@/lib/utils";

const priceToneClasses = {
  blue: "text-blue-700",
  emerald: "text-emerald-700",
  violet: "text-violet-700",
  rose: "text-rose-700",
};

function ProductsGrid({ products }: { products: ProductViewModel[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
        >
          <div className={`h-64 bg-linear-to-br ${product.accent} p-5`}>
            <div className="flex h-full flex-col justify-between rounded-3xl border border-white/50 bg-white/35 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                  {product.badge}
                </span>
                <span className="text-sm font-medium text-slate-700">★ {product.rating}</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 rounded-full bg-slate-900/20" />
                <div className="h-3 w-28 rounded-full bg-slate-900/10" />
                <div className="h-20 rounded-2xl bg-white/40" />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  {product.categoryName}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{product.name}</h2>
              </div>
              <span className={`text-lg font-bold ${priceToneClasses[product.priceTone]}`}>
                Từ {formatVnd(product.price)}
              </span>
            </div>

            <p className="text-sm leading-6 text-slate-600">{product.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>★ {product.rating}</span>
                <span>({product.reviews} đánh giá)</span>
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                Xem chi tiết →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ProductsScreen({ filters }: { filters: ProductFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const productsQuery = useProducts(filters);
  const categoriesQuery = useProductCategories();

  const updateFilters = useCallback(
    (nextFilters: ProductFilters) => {
      const params = buildProductSearchParams(nextFilters);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const products = productsQuery.data?.items ?? [];
  const categories = categoriesQuery.data ?? [];
  const isPending = productsQuery.isPending || categoriesQuery.isPending;
  const blockingError =
    (!productsQuery.data && productsQuery.error) || (!categoriesQuery.data && categoriesQuery.error);

  if (isPending) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center">Đang tải sản phẩm...</div>;
  }

  if (blockingError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Không thể tải sản phẩm</h1>
        <button
          type="button"
          onClick={() => void Promise.all([productsQuery.refetch(), categoriesQuery.refetch()])}
          className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-5">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            Thư viện website
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Website được thiết kế để giúp doanh nghiệp tăng trưởng
          </h1>
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto_auto]">
          <form
            key={filters.search ?? "all"}
            className="flex gap-2"
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
              placeholder="Tìm sản phẩm..."
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400"
            />
            <button className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
              Tìm
            </button>
          </form>

          <select
            value={filters.category ?? ""}
            onChange={(event) =>
              updateFilters({ ...filters, category: event.target.value || undefined })
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            aria-label="Lọc sản phẩm theo danh mục"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={filters.sort ?? ""}
            onChange={(event) =>
              updateFilters({
                ...filters,
                sort: (event.target.value || undefined) as ProductFilters["sort"],
              })
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            aria-label="Sắp xếp sản phẩm"
          >
            <option value="">Mặc định</option>
            <option value="newest">Mới nhất</option>
            <option value="popular">Phổ biến</option>
            <option value="rating">Đánh giá cao</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Không tìm thấy sản phẩm</h2>
          <p className="mt-2 text-sm text-slate-500">Hãy thử từ khóa hoặc danh mục khác.</p>
        </div>
      ) : (
        <ProductsGrid products={products} />
      )}

      {(productsQuery.isFetching || categoriesQuery.isFetching) && (
        <p className="mt-5 text-center text-sm text-slate-500">Đang cập nhật dữ liệu...</p>
      )}
    </div>
  );
}
