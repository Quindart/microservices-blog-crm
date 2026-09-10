"use client";

import { useState } from "react";

export function ContactOptions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 sm:w-auto"
      >
        Liên hệ với chúng tôi
      </button>

      {open && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Trao đổi về website của bạn</p>
          <p className="mt-1 text-slate-600">Chọn một phương thức để được tư vấn chi tiết.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="tel:0814111321"
              className="font-semibold text-blue-700 underline underline-offset-4"
            >
              0814111321
            </a>
            <a
              href="mailto:lmqiuhdev@gmail.com"
              className="font-semibold text-blue-700 underline underline-offset-4"
            >
              lmqiuhdev@gmail.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
