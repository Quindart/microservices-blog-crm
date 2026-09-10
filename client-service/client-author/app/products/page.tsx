import Link from "next/link";
import { products } from "@/lib/mock-data";

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            Shop collection
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Best products for thoughtful living
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Filter</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Sort</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
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
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    {product.category}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">{product.name}</h2>
                </div>
                <span className="text-lg font-semibold text-slate-900">${product.price}</span>
              </div>

              <p className="text-sm leading-6 text-slate-600">{product.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>★ {product.rating}</span>
                  <span>({product.reviews})</span>
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                  View details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
