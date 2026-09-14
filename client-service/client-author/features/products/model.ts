import type { Category, Product } from "@/generated/api";

const accents = [
  "from-stone-200 via-zinc-100 to-white",
  "from-violet-200 via-purple-100 to-white",
  "from-cyan-100 via-sky-50 to-white",
  "from-slate-100 via-neutral-50 to-white",
  "from-fuchsia-100 via-pink-50 to-white",
  "from-amber-100 via-orange-50 to-white",
] as const;

const priceTones = ["blue", "violet", "emerald", "rose"] as const;

function paletteIndex(value: string, length: number) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0) % length;
}

export type ProductFilters = {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "popular";
};

export type ProductViewModel = {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  description: string;
  badge: string;
  highlight: string;
  accent: (typeof accents)[number];
  priceTone: (typeof priceTones)[number];
  plans: string[];
  inStock: boolean;
};

export type CategoryOption = {
  label: string;
  value: string;
};

export function toProductViewModel(product: Product): ProductViewModel {
  const slug = product.slug ?? product.id ?? "product";
  const plans = product.variants?.flatMap((variant) => (variant.name ? [variant.name] : [])) ?? [];

  return {
    id: product.id ?? slug,
    slug,
    name: product.name ?? "Sản phẩm",
    categoryName: product.category?.name ?? "Chưa phân loại",
    categorySlug: product.category?.slug ?? "",
    price: product.price?.amount ?? 0,
    currency: product.price?.currency ?? "VND",
    rating: product.rating?.average ?? 0,
    reviews: product.rating?.count ?? 0,
    description: product.shortDescription ?? product.description ?? "Thông tin đang được cập nhật.",
    badge: product.badge ?? "Nổi bật",
    highlight: product.highlight ?? "",
    accent: accents[paletteIndex(slug, accents.length)],
    priceTone: priceTones[paletteIndex(slug, priceTones.length)],
    plans: plans.length > 0 ? plans : ["Tiêu chuẩn"],
    inStock: product.inStock ?? false,
  };
}

export function toCategoryOption(category: Category): CategoryOption {
  return {
    label: category.name ?? "Chưa đặt tên",
    value: category.slug ?? "",
  };
}
