"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

type ProductActionsProps = {
  product: {
    id: string;
    name: string;
    price: number;
    accent: string;
    plans: string[];
  };
};

export function ProductActions({ product }: ProductActionsProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedPlan, setSelectedPlan] = useState(product.plans[0]);
  const [contactOpen, setContactOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    addItem({
      id: `${product.id}-${selectedPlan.toLowerCase().replaceAll(" ", "-")}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      accent: product.accent,
      plan: selectedPlan,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="mt-8">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
        Gói triển khai
      </p>
      <div className="flex flex-wrap gap-3">
        {product.plans.map((plan) => (
          <button
            key={plan}
            type="button"
            onClick={() => setSelectedPlan(plan)}
            className={`rounded-full border px-3 py-2 text-sm transition ${
              selectedPlan === plan
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
            }`}
          >
            {plan}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setContactOpen((value) => !value)}
          className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
        >
          Liên hệ
        </button>
        <button
          type="button"
          onClick={addToCart}
          className="inline-flex h-12 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-medium text-white transition hover:bg-slate-700 sm:px-4 sm:text-sm"
        >
          {added ? "Đã thêm ✓" : "Giỏ hàng"}
        </button>
        <Link
          href="/payment"
          className="inline-flex h-12 items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-2 text-xs font-medium text-white transition hover:bg-slate-700 sm:px-4 sm:text-sm"
        >
          Mua ngay
        </Link>
      </div>

      {contactOpen && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Trao đổi về website của bạn</p>
          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:gap-4">
            <a href="tel:0814111321" className="font-semibold text-blue-700 underline">
              0814111321
            </a>
            <a href="mailto:lmqiuhdev@gmail.com" className="font-semibold text-blue-700 underline">
              lmqiuhdev@gmail.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
