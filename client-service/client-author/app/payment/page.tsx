export default function PaymentPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
          Secure checkout
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Payment details</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Cardholder name
              </label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                defaultValue="Maya Johnson"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Card number</label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                defaultValue="4242 4242 4242 4242"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Expiry</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  defaultValue="12/29"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">CVV</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  defaultValue="321"
                />
              </div>
            </div>

            <button className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
              Complete payment
            </button>
          </div>
        </div>

        <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Summary</h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Aurora Lamp</span>
              <span>$79</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Atlas Bottle x2</span>
              <span>$84</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-medium text-slate-900">
              <span>Total</span>
              <span>$163</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
