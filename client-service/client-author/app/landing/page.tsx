import Link from "next/link";
import { landingPages } from "@/lib/mock-data";

export default function LandingPageDirectory() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            Template library
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Landing pages for every brand story
          </h1>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Browse products
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {landingPages.map((page) => (
          <Link
            key={page.slug}
            href={`/landing/${page.slug}`}
            className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
          >
            <div className={`h-56 bg-linear-to-br ${page.accent} p-5`}>
              <div className="flex h-full flex-col justify-between rounded-[20px] border border-white/20 bg-slate-950/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.24em] text-white/75">
                  <span>{page.category}</span>
                  <span>${page.price}</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded-full bg-white/70" />
                  <div className="h-3 w-32 rounded-full bg-white/45" />
                  <div className="h-20 rounded-2xl bg-white/10" />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">{page.title}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {page.category}
                </span>
              </div>

              <p className="text-sm leading-6 text-slate-600">{page.description}</p>

              <ul className="space-y-2 text-sm text-slate-600">
                {page.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-slate-500">From ${page.price}</span>
                <span className="text-sm font-semibold text-slate-900 group-hover:text-slate-600">
                  View demo →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
