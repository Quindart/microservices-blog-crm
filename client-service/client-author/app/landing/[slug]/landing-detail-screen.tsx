"use client";

import Link from "next/link";
import { useLandingPage } from "@/features/landing-pages/hooks";
import { formatVnd } from "@/lib/utils";

export function LandingDetailScreen({ slug }: { slug: string }) {
  const landingPageQuery = useLandingPage(slug);
  const item = landingPageQuery.data;

  if (landingPageQuery.isPending) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center">Đang tải landing page...</div>;
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Không thể tải landing page</h1>
        <button
          type="button"
          onClick={() => void landingPageQuery.refetch()}
          className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className={`bg-linear-to-br ${item.accent} p-8 sm:p-10`}>
          <div className="rounded-3xl border border-white/20 bg-slate-950/10 p-6 text-white backdrop-blur-sm">
            <div className="mb-8 flex items-center justify-between gap-4 text-xs font-medium uppercase tracking-[0.24em] text-white/80">
              <span>{item.category}</span>
              <Link href="/landing" className="hover:text-white/100">
                ← Quay lại thư viện
              </Link>
            </div>
            <div className="space-y-6">
              <div className="h-4 w-28 rounded-full bg-white/60" />
              <div className="h-4 w-48 rounded-full bg-white/40" />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-32 rounded-2xl bg-white/10" />
                <div className="h-32 rounded-2xl bg-white/10" />
                <div className="h-32 rounded-2xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
                Chi tiết mẫu
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{item.title}</h1>
            </div>
            <p className="text-base leading-7 text-slate-600">{item.description}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {item.features.map((feature) => (
                <div key={feature} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Mua mẫu</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-slate-900">{formatVnd(item.price)}</span>
              <span className="text-sm text-slate-500">một lần</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Bao gồm bố cục gốc, các section responsive, luồng CTA và phong cách sẵn sàng cho sản
              phẩm.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/payment"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Mua ngay
              </Link>
              <button className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Thêm vào giỏ
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
