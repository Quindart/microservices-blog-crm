"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    accent: string;
    colors: string[];
  };
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    addItem({
      id: `${product.id}-${selectedColor.toLowerCase().replaceAll(" ", "-")}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      accent: product.accent,
      color: selectedColor,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <>
      <div className="mt-8">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Colors
        </p>
        <div className="flex flex-wrap gap-3">
          {product.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`rounded-full border px-3 py-2 text-sm transition ${
                selectedColor === color
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={addToCart}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {added ? "Added to cart ✓" : "Add to cart"}
        </button>
      </div>
    </>
  );
}
