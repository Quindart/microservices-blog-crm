"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { languageOptions, resolveLocale, translations } from "@/lib/translations";
import { useCartStore } from "@/lib/cart-store";

const navItems: { href: string; key: keyof typeof translations.en }[] = [
  { href: "/", key: "home" },
  { href: "/landing", key: "landing" },
  { href: "/products", key: "products" },
  { href: "/blogs", key: "blogs" },
  { href: "/cart", key: "cart" },
  { href: "/payment", key: "payment" },
];

export function SiteHeader() {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));
  const t = translations[locale];
  const itemCount = useCartStore((state) =>
    state.items.reduce((count, item) => count + item.quantity, 0),
  );
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const getLangHref = (lang: "en" | "vi" | "sv") => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("lang", lang);
    return `${window.location.pathname}?${next.toString()}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={t.home}>
          <div className="relative h-11 w-11">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f8fafc_0%,#dbeafe_20%,#60a5fa_35%,#1e293b_60%,#0f172a_100%)] shadow-[0_12px_24px_rgba(14,116,144,0.35)]" />
            <div className="absolute inset-[7px] rounded-full border border-white/80 bg-white/20 backdrop-blur-sm" />
            <div className="absolute inset-x-1 top-[15px] h-[18px] rounded-full border-[2px] border-cyan-200/80 border-t-transparent border-b-transparent opacity-90" />
            <div className="absolute inset-x-2 bottom-[16px] h-[18px] rounded-full border-[2px] border-sky-200/80 border-t-transparent border-b-transparent opacity-90" />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              {t.author}
            </p>
            <p className="text-base font-semibold text-slate-900">{t.store}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href + (searchParams.toString() ? `?${searchParams.toString()}` : "")}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {t[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 sm:flex">
            {languageOptions.map((option) => (
              <Link
                key={option.value}
                href={getLangHref(option.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  locale === option.value
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>

          <Link
            href={"/products" + (searchParams.toString() ? `?${searchParams.toString()}` : "")}
            className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
          >
            {t.explore}
          </Link>
          <Link
            href={"/cart" + (searchParams.toString() ? `?${searchParams.toString()}` : "")}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            {t.cart}
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1 text-xs">
              {hydrated ? itemCount : 0}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
