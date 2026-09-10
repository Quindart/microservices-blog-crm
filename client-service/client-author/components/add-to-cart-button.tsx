"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    accent: string;
    plans: string[];
  };
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedPlan, setSelectedPlan] = useState(product.plans[0]);
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
      <button
        type="button"
        onClick={addToCart}
        className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        {added ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ"}
      </button>
    </div>
  );
}
