import type { LandingPage } from "@/generated/api";

const accents = [
  "from-sky-700 via-blue-600 to-cyan-400",
  "from-slate-950 via-indigo-900 to-blue-700",
  "from-amber-500 via-orange-400 to-rose-400",
] as const;

function paletteIndex(value: string) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0) % accents.length;
}

export type LandingPageFilters = {
  page: number;
  limit: number;
};

export type LandingPageViewModel = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  thumbnailUrl: string;
  features: string[];
  accent: (typeof accents)[number];
};

export function toLandingPageViewModel(page: LandingPage): LandingPageViewModel {
  const slug = page.slug ?? page.id ?? "landing-page";

  return {
    id: page.id ?? slug,
    slug,
    title: page.title ?? "Landing page",
    category: page.category ?? "Chưa phân loại",
    description: page.description ?? "Thông tin đang được cập nhật.",
    price: page.price?.amount ?? 0,
    currency: page.price?.currency ?? "VND",
    thumbnailUrl: page.thumbnailUrl ?? "",
    features: page.features ?? [],
    accent: accents[paletteIndex(slug)],
  };
}
