import Link from "next/link";
import { notFound } from "next/navigation";
import { landingPages } from "@/lib/mock-data";

export default async function LandingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = landingPages.find((page) => page.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className={`bg-linear-to-br ${item.accent} p-8 sm:p-10`}>
          <div className="rounded-3xl border border-white/20 bg-slate-950/10 p-6 text-white backdrop-blur-sm">
            <div className="mb-8 flex items-center justify-between gap-4 text-xs font-medium uppercase tracking-[0.24em] text-white/80">
              <span>{item.category}</span>
              <Link href="/landing" className="hover:text-white/100">
                ← Back to library
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
                Template details
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
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Purchase
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-slate-900">${item.price}</span>
              <span className="text-sm text-slate-500">one-time</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Includes the source layout, responsive sections, CTA flow, and product-ready styling.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/payment"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Buy now
              </Link>
              <button className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Add to cart
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
