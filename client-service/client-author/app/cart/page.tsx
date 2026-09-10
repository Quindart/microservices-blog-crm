"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LuShoppingCart } from "react-icons/lu";
import { useCartStore } from "@/lib/cart-store";
import { formatVnd } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const visibleItems = hydrated ? items : [];

  const subtotal = visibleItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
          Giỏ hàng của bạn
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
          Sẵn sàng thanh toán
        </h1>
      </div>

      {visibleItems.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <LuShoppingCart aria-hidden="true" className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Giỏ hàng đang trống</h2>
          <p className="mt-2 text-sm text-slate-500">Thêm một website để xem báo giá tại đây.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700"
          >
            Xem các website
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]"
              >
                <div className={`h-24 w-24 shrink-0 rounded-2xl bg-linear-to-br ${item.accent}`} />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-5">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                    {item.plan && (
                      <p className="mt-1 text-sm text-slate-500">Gói triển khai: {item.plan}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span className="min-w-5 text-center text-sm text-slate-700">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-xs text-slate-500 underline hover:text-slate-900"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      {formatVnd(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-slate-500">{formatVnd(item.price)} / gói</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Tóm tắt đơn hàng</h2>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Tạm tính</span>
                <span>{formatVnd(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vận chuyển</span>
                <span>Miễn phí triển khai</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-medium text-slate-900">
                <span>Tổng cộng</span>
                <span>{formatVnd(total)}</span>
              </div>
            </div>
            <Link
              href="/payment"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Tiến hành thanh toán
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
