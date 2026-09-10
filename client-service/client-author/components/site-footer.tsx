"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f8fafc_0%,#dbeafe_20%,#60a5fa_35%,#1e293b_60%,#0f172a_100%)] shadow-[0_10px_18px_rgba(14,116,144,0.25)]" />
              <div className="absolute inset-[6px] rounded-full border border-white/80 bg-white/20" />
              <div className="absolute inset-x-1 top-[11px] h-[12px] rounded-full border-[2px] border-cyan-200/80 border-t-transparent border-b-transparent opacity-90" />
              <div className="absolute inset-x-2 bottom-[11px] h-[12px] rounded-full border-[2px] border-sky-200/80 border-t-transparent border-b-transparent opacity-90" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Le Minh Quang
              </p>
              <p className="text-base font-semibold text-slate-900">Studio kỹ thuật số</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Xây dựng, mua và ra mắt cửa hàng kỹ thuật số với landing page tinh tế, sản phẩm chất
            lượng và quy trình thanh toán liền mạch.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Khám phá
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <Link href="/landing" className="transition hover:text-slate-900">
                Landing page
              </Link>
            </li>
            <li>
              <Link href="/products" className="transition hover:text-slate-900">
                Website
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition hover:text-slate-900">
                Giỏ hàng
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Hỗ trợ
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>lmqiuhdev@gmail.com</li>
            <li>
              <a href="tel:0814111321" className="transition hover:text-slate-900">
                0814111321
              </a>
            </li>
            <li>Việt Nam</li>
            <li>Thứ 2–Thứ 7, 8:00–18:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>© 2026 Le Minh Quang Studio</p>
          <p>Thiết kế cho thương mại số</p>
        </div>
      </div>
    </footer>
  );
}
