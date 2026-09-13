# Client Author OpenAPI and React Query Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a portable TypeScript API SDK from the frontend-configured OpenAPI URL and replace product, category-filter, blog, and landing-page mock reads with hydrated TanStack Query hooks.

**Architecture:** A frontend-owned sync script downloads and validates the OpenAPI document before Hey API generates types and flat SDK functions. Request-scoped server clients prefetch shared query options for hydration, browser hooks use a same-origin Next.js proxy, and pure mappers produce complete view models before JSX renders.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, pnpm, `@hey-api/openapi-ts` 0.99.0, generated Fetch client, TanStack Query 5, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-13-client-author-openapi-react-query-design.md`

## Global Constraints

- `OPENAPI_SCHEMA_URL`, `API_PROXY_TARGET`, and `NEXT_PUBLIC_API_BASE_URL` are frontend environment configuration.
- Frontend generation must not read `../../golang-crm/api.yml` or any backend source path.
- Generated files are committed and never hand-edited.
- Category data is used only as a product/blog filter; do not add a `/categories` route.
- API calls, state derivation, defaults, loading, errors, and empty handling occur before presentational JSX.
- The existing Go backend contract and business logic remain unchanged.
- `pnpm dev` starts only Next.js; the monorepo-only convenience command is `pnpm dev:fullstack`.
- Run every shell command through RTK according to the repository instructions.

---

### Task 1: Add an atomic, environment-driven OpenAPI sync command

**Files:**
- Create: `client-service/client-author/.env.example`
- Modify: `client-service/client-author/.gitignore`
- Modify: `client-service/client-author/package.json`
- Modify: `client-service/client-author/pnpm-lock.yaml`
- Create: `client-service/client-author/scripts/sync-openapi.mjs`
- Create: `client-service/client-author/scripts/sync-openapi.test.mjs`

**Interfaces:**
- Consumes: `OPENAPI_SCHEMA_URL` from process environment, `.env.local`, or `.env`.
- Produces: `syncOpenApi({ sourceUrl, destination }) => Promise<void>` and `pnpm sync:openapi`.

- [ ] **Step 1: Add pinned generator and sync dependencies**

Run from `client-service/client-author`:

```bash
rtk pnpm add @tanstack/react-query@^5.90.16
rtk pnpm add -D -E @hey-api/openapi-ts@0.99.0
rtk pnpm add -D dotenv@^17.2.3 yaml@^2.8.1 vitest@^4.1.11
rtk pnpm add -D concurrently@^9.2.1
```

- [ ] **Step 2: Add the public environment template and allow it through `.gitignore`**

Create `.env.example`:

```dotenv
OPENAPI_SCHEMA_URL=http://localhost:8080/api.yml
API_PROXY_TARGET=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=/backend-api
```

Add this immediately after `.env*` in `.gitignore`:

```gitignore
!.env.example
```

- [ ] **Step 3: Write failing atomic-sync tests**

Create `scripts/sync-openapi.test.mjs` with a local HTTP server and temporary directory. The assertions must cover a successful OpenAPI document, an HTTP error, and invalid YAML while proving the last known-good destination survives both failures:

```js
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { syncOpenApi } from "./sync-openapi.mjs";

async function serve(body, status = 200) {
  const server = createServer((_request, response) => {
    response.writeHead(status, { "content-type": "application/yaml" });
    response.end(body);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}/api.yml`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test("downloads a valid OpenAPI document", async () => {
  const directory = await mkdtemp(join(tmpdir(), "author-openapi-"));
  const destination = join(directory, "api.yml");
  const fixture = "openapi: 3.0.3\ninfo:\n  title: Test\n  version: 1.0.0\npaths: {}\n";
  const endpoint = await serve(fixture);
  try {
    await syncOpenApi({ sourceUrl: endpoint.url, destination });
    assert.equal(await readFile(destination, "utf8"), fixture);
  } finally {
    await endpoint.close();
  }
});

for (const failure of [
  { name: "HTTP failure", body: "unavailable", status: 503 },
  { name: "invalid OpenAPI YAML", body: "name: missing-openapi", status: 200 },
]) {
  test(`preserves the previous schema after ${failure.name}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "author-openapi-"));
    const destination = join(directory, "api.yml");
    await writeFile(destination, "openapi: 3.0.3\npaths: {}\n", "utf8");
    const endpoint = await serve(failure.body, failure.status);
    try {
      await assert.rejects(syncOpenApi({ sourceUrl: endpoint.url, destination }));
      assert.equal(await readFile(destination, "utf8"), "openapi: 3.0.3\npaths: {}\n");
    } finally {
      await endpoint.close();
    }
  });
}
```

- [ ] **Step 4: Run the sync tests and verify the missing module fails**

Run:

```bash
rtk proxy node --test scripts/sync-openapi.test.mjs
```

Expected: FAIL because `scripts/sync-openapi.mjs` does not exist.

- [ ] **Step 5: Implement the sync module and CLI**

Create `scripts/sync-openapi.mjs`:

```js
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { config } from "dotenv";
import { parse } from "yaml";

config({ path: ".env.local", override: false, quiet: true });
config({ path: ".env", override: false, quiet: true });

function validateOpenApi(source) {
  const document = parse(source);
  if (!document || typeof document !== "object" || typeof document.openapi !== "string") {
    throw new Error("Downloaded document is not an OpenAPI specification");
  }
}

export async function syncOpenApi({
  sourceUrl = process.env.OPENAPI_SCHEMA_URL,
  destination = resolve("openapi/api.yml"),
} = {}) {
  if (!sourceUrl) throw new Error("OPENAPI_SCHEMA_URL is required");
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`OpenAPI sync failed for ${new URL(sourceUrl).host}: HTTP ${response.status}`);
  }
  const source = await response.text();
  validateOpenApi(source);

  await mkdir(dirname(destination), { recursive: true });
  const temporary = `${destination}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, source, "utf8");
    await rename(temporary, destination);
  } finally {
    await rm(temporary, { force: true });
  }
}

const isCli = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  await syncOpenApi();
  const document = await readFile(resolve("openapi/api.yml"), "utf8");
  console.log(`OpenAPI schema synchronized (${Buffer.byteLength(document)} bytes)`);
}
```

- [ ] **Step 6: Add the sync and test scripts**

Merge these entries into `package.json`:

```json
{
  "scripts": {
    "sync:openapi": "node scripts/sync-openapi.mjs",
    "test:scripts": "node --test scripts/*.test.mjs",
    "test": "pnpm test:scripts"
  }
}
```

- [ ] **Step 7: Run the sync tests and commit**

```bash
rtk proxy node --test scripts/sync-openapi.test.mjs
rtk git add client-service/client-author/.env.example client-service/client-author/.gitignore client-service/client-author/package.json client-service/client-author/pnpm-lock.yaml client-service/client-author/scripts
rtk git commit -m "build: add frontend OpenAPI schema sync"
```

Expected: three Node tests PASS.

---

### Task 2: Generate the typed API SDK from the frontend snapshot

**Files:**
- Create: `client-service/client-author/openapi/api.yml`
- Create: `client-service/client-author/generated/api/**`
- Modify: `client-service/client-author/package.json`

**Interfaces:**
- Consumes: `openapi/api.yml` produced by Task 1.
- Produces: generated `listProducts`, `getProduct`, `listCategories`, `listBlogs`, `getBlog`, `listBlogCategories`, `listLandingPages`, `getLandingPage`, generated schema types, and `createClient`/`Client`.

- [ ] **Step 1: Add the deterministic generation script**

Merge this script into `package.json`:

```json
{
  "scripts": {
    "generate:api": "pnpm sync:openapi && openapi-ts -i openapi/api.yml -o generated/api"
  }
}
```

- [ ] **Step 2: Start the existing backend and verify the schema endpoint**

From `golang-crm`, run the server in one terminal:

```bash
rtk go run ./cmd
```

From `client-service/client-author`, verify the frontend-configured endpoint:

```bash
rtk proxy curl --fail --silent --show-error http://localhost:8080/api.yml
```

Expected: YAML beginning with `openapi: 3.0.3`.

- [ ] **Step 3: Generate the SDK and verify required operations**

```bash
rtk pnpm generate:api
rtk rg -n "export const (listProducts|getProduct|listCategories|listBlogs|getBlog|listBlogCategories|listLandingPages|getLandingPage)" generated/api
rtk tsc --noEmit
```

Expected: all eight operations are exported and TypeScript passes.

- [ ] **Step 4: Commit the snapshot and generated dependency**

```bash
rtk git add client-service/client-author/openapi client-service/client-author/generated client-service/client-author/package.json
rtk git commit -m "build: generate author storefront API client"
```

---

### Task 3: Add API clients, QueryClient provider, proxy, and shared errors

**Files:**
- Create: `client-service/client-author/lib/api/client.browser.ts`
- Create: `client-service/client-author/lib/api/client.server.ts`
- Create: `client-service/client-author/lib/api/errors.ts`
- Create: `client-service/client-author/lib/api/query-client.ts`
- Create: `client-service/client-author/app/providers.tsx`
- Modify: `client-service/client-author/app/layout.tsx`
- Modify: `client-service/client-author/next.config.ts`
- Create: `client-service/client-author/lib/api/query-client.test.ts`

**Interfaces:**
- Produces: `getBrowserApiClient(): Client`, `createServerApiClient(): Client`, `ApiError`, `unwrapResponse`, `createQueryClient(): QueryClient`, and `<Providers>`.
- Consumes: generated `createClient`/`Client` from Task 2 and the three environment values.

- [ ] **Step 1: Write failing QueryClient policy tests**

Create `lib/api/query-client.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createQueryClient } from "./query-client";

describe("createQueryClient", () => {
  it("uses the storefront read-cache policy", () => {
    const options = createQueryClient().getDefaultOptions().queries;
    expect(options?.staleTime).toBe(5 * 60 * 1000);
    expect(options?.refetchOnWindowFocus).toBe(false);
    expect(options?.retry).toBe(1);
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

```bash
rtk pnpm vitest run lib/api/query-client.test.ts
```

Expected: FAIL because `query-client.ts` is missing.

- [ ] **Step 3: Implement request clients and response errors**

Create the browser and server factories:

```ts
// lib/api/client.browser.ts
"use client";

import { createClient, type Client } from "@/generated/api/client";

let browserClient: Client | undefined;

export function getBrowserApiClient(): Client {
  browserClient ??= createClient({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/backend-api",
  });
  return browserClient;
}
```

```ts
// lib/api/client.server.ts
import "server-only";
import { createClient, type Client } from "@/generated/api/client";

export function createServerApiClient(): Client {
  return createClient({ baseUrl: process.env.API_PROXY_TARGET ?? "http://localhost:8080" });
}
```

Create `errors.ts`:

```ts
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function unwrapResponse<T>(response: {
  data?: T;
  error?: unknown;
  response: Response;
}): T {
  if (!response.response.ok || response.error !== undefined) {
    throw new ApiError(response.response.status, "Không thể tải dữ liệu.", response.error);
  }
  if (response.data === undefined) {
    throw new ApiError(response.response.status, "API không trả về dữ liệu.");
  }
  return response.data;
}
```

- [ ] **Step 4: Implement the QueryClient lifecycle and provider**

Create `query-client.ts` and `app/providers.tsx`:

```ts
// lib/api/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
```

```tsx
// app/providers.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createQueryClient } from "@/lib/api/query-client";

let browserQueryClient: ReturnType<typeof createQueryClient> | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return createQueryClient();
  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
```

Wrap the existing layout body contents with `<Providers>` without moving metadata or font setup.

- [ ] **Step 5: Configure the environment-driven same-origin proxy**

Replace the empty `next.config.ts` configuration with:

```ts
import type { NextConfig } from "next";

const apiTarget = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/backend-api/:path*", destination: `${apiTarget}/:path*` }];
  },
};

export default nextConfig;
```

- [ ] **Step 6: Run tests, type checking, and commit**

Before running the checks, add the unit-test command and expand the aggregate
test command in `package.json`:

```json
{
  "scripts": {
    "test:unit": "vitest run features lib",
    "test": "pnpm test:unit && pnpm test:scripts"
  }
}
```

```bash
rtk pnpm vitest run lib/api/query-client.test.ts
rtk tsc --noEmit
rtk pnpm lint
rtk git add client-service/client-author/app client-service/client-author/lib/api client-service/client-author/next.config.ts
rtk git commit -m "feat: configure storefront query runtime"
```

---

### Task 4: Add product/category queries, view models, and pages

**Files:**
- Create: `client-service/client-author/features/products/model.ts`
- Create: `client-service/client-author/features/products/model.test.ts`
- Create: `client-service/client-author/features/products/queries.ts`
- Create: `client-service/client-author/features/products/queries.test.ts`
- Create: `client-service/client-author/features/products/hooks.ts`
- Create: `client-service/client-author/app/products/products-screen.tsx`
- Create: `client-service/client-author/app/products/[id]/product-detail-screen.tsx`
- Modify: `client-service/client-author/app/products/page.tsx`
- Modify: `client-service/client-author/app/products/[id]/page.tsx`
- Modify: `client-service/client-author/components/product-actions.tsx`

**Interfaces:**
- Produces: `ProductViewModel`, `ProductFilters`, `productQueries`, `useProducts`, `useProduct`, and `useProductCategories`.
- Consumes: generated Product/Category schemas and list/detail services, API clients from Task 3.

- [ ] **Step 1: Write failing mapper and query-key tests**

The mapper test must prove nested generated fields are normalized before render:

```ts
import { describe, expect, it } from "vitest";
import { toProductViewModel } from "./model";

describe("toProductViewModel", () => {
  it("maps nested API values and creates stable display defaults", () => {
    const product = toProductViewModel({
      id: "p1",
      slug: "aurora-lamp",
      name: "Aurora",
      category: { id: "c1", name: "Brand", slug: "brand" },
      price: { amount: 1290000, currency: "VND" },
      rating: { average: 4.9, count: 184 },
      variants: [{ id: "v1", name: "Cơ bản", price: { amount: 1290000, currency: "VND" } }],
    });
    expect(product).toMatchObject({
      id: "p1",
      slug: "aurora-lamp",
      categoryName: "Brand",
      categorySlug: "brand",
      price: 1290000,
      rating: 4.9,
      reviews: 184,
      plans: ["Cơ bản"],
    });
    expect(product.accent).toContain("from-");
  });
});
```

The query test must compare keys from two searches/categories and verify the server/client client argument never appears in the key:

```ts
import { describe, expect, it } from "vitest";
import { productQueries } from "./queries";

describe("productQueries", () => {
  it("keys list responses by every filter", () => {
    const first = productQueries.keys.list({ page: 1, limit: 12, search: "a", category: "brand" });
    const second = productQueries.keys.list({ page: 1, limit: 12, search: "b", category: "brand" });
    expect(first).not.toEqual(second);
  });

  it("uses the same detail key wherever the slug is consumed", () => {
    expect(productQueries.keys.detail("aurora-lamp")).toEqual(["products", "detail", "aurora-lamp"]);
  });
});
```

- [ ] **Step 2: Run focused tests and verify missing modules fail**

```bash
rtk pnpm vitest run features/products
```

- [ ] **Step 3: Implement the pure product presentation model**

Define `ProductViewModel` with the fields consumed by the existing product cards and `ProductActions`: `id`, `slug`, `name`, `categoryName`, `categorySlug`, `price`, `currency`, `rating`, `reviews`, `description`, `badge`, `highlight`, `accent`, `priceTone`, `plans`, and `inStock`. Use a fixed palette indexed by a deterministic slug hash. Use `shortDescription` before `description`, variant names before the fallback `"Tiêu chuẩn"`, and never access optional generated fields from JSX.

The exported mapper signature is:

```ts
import type { Category, Product } from "@/generated/api";

export type ProductFilters = {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "popular";
};

export function toProductViewModel(product: Product): ProductViewModel;
export function toCategoryOption(category: Category): { label: string; value: string };
```

- [ ] **Step 4: Implement reusable product query options and client-only hooks**

`queries.ts` exports stable keys and accepts a generated client explicitly:

```ts
export const productQueries = {
  keys: {
    all: ["products"] as const,
    list: (filters: ProductFilters) => ["products", "list", filters] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    categories: ["products", "categories"] as const,
  },
  list: (filters: ProductFilters, client: Client) =>
    queryOptions({
      queryKey: productQueries.keys.list(filters),
      queryFn: async () => {
        const payload = unwrapResponse(await listProducts({ client, query: filters }));
        return {
          items: (payload.items ?? []).map(toProductViewModel),
          pagination: payload.pagination,
        };
      },
      placeholderData: keepPreviousData,
    }),
  detail: (slug: string, client: Client) =>
    queryOptions({
      queryKey: productQueries.keys.detail(slug),
      queryFn: async () => toProductViewModel(unwrapResponse(await getProduct({ client, path: { slug } }))),
    }),
  categories: (client: Client) =>
    queryOptions({
      queryKey: productQueries.keys.categories,
      queryFn: async () => unwrapResponse(await listCategories({ client })).map(toCategoryOption),
    }),
};
```

`hooks.ts` starts with `"use client"` and exports hooks that call `useQuery` with the matching option factory and `getBrowserApiClient()`.

- [ ] **Step 5: Convert the product list into orchestration plus presentation**

Make `app/products/page.tsx` an async Server Component. Normalize `q`, `category`, and `sort` from promised `searchParams`, prefetch `productQueries.list` and `productQueries.categories` in parallel with a request-scoped server client, and render:

```tsx
<HydrationBoundary state={dehydrate(queryClient)}>
  <ProductsScreen initialFilters={filters} />
</HydrationBoundary>
```

`ProductsScreen` is client-only. It calls both hooks before any conditional return, computes the current URL filters, and returns loading/error/empty states before the success JSX. Replace the current decorative filter labels with a search input, category select using category slugs as values, and sort select. `router.replace` updates URL search parameters and resets `page` to `1`. Put the existing grid markup in a pure `ProductsGrid({ products })` function and link with `product.slug`.

- [ ] **Step 6: Convert product detail with hydrated 404 handling**

The server page awaits the detail query once. Catch only `ApiError` status 404 and call `notFound()`; rethrow other server errors so the route error boundary handles them. Dehydrate the successful query and render `ProductDetailScreen`. The screen calls `useProduct(slug)` and derives `product` before the JSX; `ProductActions` accepts `ProductViewModel` (or `Pick<ProductViewModel, ...>`), with no dependency on `mock-data`.

- [ ] **Step 7: Run product tests and checks, then commit**

```bash
rtk pnpm vitest run features/products
rtk tsc --noEmit
rtk pnpm lint
rtk git add client-service/client-author/features/products client-service/client-author/app/products client-service/client-author/components/product-actions.tsx
rtk git commit -m "feat: load products and category filters from API"
```

---

### Task 5: Add blog/category queries, view models, and pages

**Files:**
- Create: `client-service/client-author/features/blogs/model.ts`
- Create: `client-service/client-author/features/blogs/model.test.ts`
- Create: `client-service/client-author/features/blogs/queries.ts`
- Create: `client-service/client-author/features/blogs/queries.test.ts`
- Create: `client-service/client-author/features/blogs/hooks.ts`
- Create: `client-service/client-author/app/blogs/blogs-screen.tsx`
- Create: `client-service/client-author/app/blogs/[slug]/blog-detail-screen.tsx`
- Modify: `client-service/client-author/app/blogs/page.tsx`
- Modify: `client-service/client-author/app/blogs/[slug]/page.tsx`

**Interfaces:**
- Produces: `BlogViewModel`, `BlogFilters`, `blogQueries`, `useBlogs`, `useBlog`, and `useBlogCategories`.
- Consumes: generated Blog/Category schemas and list/detail services.

- [ ] **Step 1: Write failing mapper and key tests**

Create `model.test.ts` with a nested API fixture and explicit expected fields:

```ts
import { describe, expect, it } from "vitest";
import { toBlogViewModel } from "./model";

describe("toBlogViewModel", () => {
  it("normalizes category, author, media, and content fields", () => {
    const blog = toBlogViewModel({
      slug: "web-design-trends-2025",
      title: "Xu hướng thiết kế web",
      excerpt: "Tóm tắt",
      content: "Nội dung",
      category: { id: "c1", name: "Thiết kế", slug: "thiet-ke" },
      author: { name: "Alex Chen", slug: "alex-chen" },
      publishedAt: "2025-08-28T00:00:00Z",
      readTime: 8,
      coverImageUrl: "https://example.com/cover.jpg",
      tags: ["web", "ux"],
    });
    expect(blog).toMatchObject({
      slug: "web-design-trends-2025",
      categoryName: "Thiết kế",
      categorySlug: "thiet-ke",
      authorName: "Alex Chen",
      coverImageUrl: "https://example.com/cover.jpg",
      tags: ["web", "ux"],
    });
  });
});
```

Create `queries.test.ts` with two fully populated filters and assert every API
input affects the key:

```ts
import { describe, expect, it } from "vitest";
import { blogQueries } from "./queries";

describe("blogQueries", () => {
  it("keys list responses by all filters", () => {
    const base = {
      page: 1,
      limit: 12,
      category: "design",
      tag: "web",
      author: "alex",
      search: "next",
      sort: "latest" as const,
    };
    for (const changed of [
      { ...base, page: 2 },
      { ...base, limit: 24 },
      { ...base, category: "commerce" },
      { ...base, tag: "ux" },
      { ...base, author: "sarah" },
      { ...base, search: "react" },
    ]) {
      expect(blogQueries.keys.list(changed)).not.toEqual(blogQueries.keys.list(base));
    }
  });

  it("keys detail responses by slug", () => {
    expect(blogQueries.keys.detail("web-design-trends-2025")).toEqual([
      "blogs",
      "detail",
      "web-design-trends-2025",
    ]);
  });
});
```

```ts
expect(blogQueries.keys.detail("web-design-trends-2025")).toEqual([
  "blogs",
  "detail",
  "web-design-trends-2025",
]);
```

- [ ] **Step 2: Run focused tests and verify missing modules fail**

```bash
rtk pnpm vitest run features/blogs
```

- [ ] **Step 3: Implement blog mappers, query options, and hooks**

Use these public interfaces:

```ts
export type BlogFilters = {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  tag?: string;
  author?: string;
  sort?: "latest";
};

export function toBlogViewModel(blog: Blog): BlogViewModel;
export const blogQueries: {
  keys: {
    list(filters: BlogFilters): readonly unknown[];
    detail(slug: string): readonly ["blogs", "detail", string];
    categories: readonly ["blogs", "categories"];
  };
  list(filters: BlogFilters, client: Client): ReturnType<typeof queryOptions>;
  detail(slug: string, client: Client): ReturnType<typeof queryOptions>;
  categories(client: Client): ReturnType<typeof queryOptions>;
};
```

Each query unwraps the generated response and maps it before returning. Each hook is client-only and supplies `getBrowserApiClient()`.

- [ ] **Step 4: Convert the blog list to server prefetch plus a client screen**

The server page normalizes `q` and `category`, then prefetches the list and categories concurrently. `BlogsScreen` calls `useBlogs` and `useBlogCategories`, updates the URL using category slugs, and makes early returns for loading/error/empty states. Remove the local `blogs.filter` and `new Set` category derivation. Preserve the current Framer Motion markup in a pure `BlogsGrid` that receives `BlogViewModel[]`.

- [ ] **Step 5: Convert the blog detail route**

Resolve the promised slug in the Server Component, await the detail query, map generated 404 to `notFound()`, dehydrate, and render the client detail screen. Replace `blog.category`, `blog.author`, and `blog.image` accesses with the complete view-model fields. Keep date formatting in a pure formatter called before JSX.

- [ ] **Step 6: Run blog tests and checks, then commit**

```bash
rtk pnpm vitest run features/blogs
rtk tsc --noEmit
rtk pnpm lint
rtk git add client-service/client-author/features/blogs client-service/client-author/app/blogs
rtk git commit -m "feat: load blogs and category filters from API"
```

---

### Task 6: Add landing-page queries, view models, and pages

**Files:**
- Create: `client-service/client-author/features/landing-pages/model.ts`
- Create: `client-service/client-author/features/landing-pages/model.test.ts`
- Create: `client-service/client-author/features/landing-pages/queries.ts`
- Create: `client-service/client-author/features/landing-pages/queries.test.ts`
- Create: `client-service/client-author/features/landing-pages/hooks.ts`
- Create: `client-service/client-author/app/landing/landing-pages-screen.tsx`
- Create: `client-service/client-author/app/landing/[slug]/landing-detail-screen.tsx`
- Modify: `client-service/client-author/app/landing/page.tsx`
- Modify: `client-service/client-author/app/landing/[slug]/page.tsx`

**Interfaces:**
- Produces: `LandingPageViewModel`, `LandingPageFilters`, `landingPageQueries`, `useLandingPages`, and `useLandingPage`.
- Consumes: generated LandingPage schema and list/detail services.

- [ ] **Step 1: Write failing mapper and key tests**

The mapper test verifies `price.amount`, currency, thumbnail URL, features, and deterministic accent mapping. Query-key tests verify page/limit and slug:

```ts
expect(landingPageQueries.keys.list({ page: 1, limit: 12 })).toEqual([
  "landing-pages",
  "list",
  { page: 1, limit: 12 },
]);
expect(landingPageQueries.keys.detail("smart-home")).toEqual([
  "landing-pages",
  "detail",
  "smart-home",
]);
```

- [ ] **Step 2: Run focused tests and verify missing modules fail**

```bash
rtk pnpm vitest run features/landing-pages
```

- [ ] **Step 3: Implement landing mappers, query options, and hooks**

Expose this shape:

```ts
export type LandingPageFilters = { page: number; limit: number };
export function toLandingPageViewModel(page: LandingPage): LandingPageViewModel;
export const landingPageQueries = {
  keys: {
    list: (filters: LandingPageFilters) => ["landing-pages", "list", filters] as const,
    detail: (slug: string) => ["landing-pages", "detail", slug] as const,
  },
  list: (filters: LandingPageFilters, client: Client) =>
    queryOptions({
      queryKey: landingPageQueries.keys.list(filters),
      queryFn: async () => {
        const payload = unwrapResponse(await listLandingPages({ client, query: filters }));
        return {
          items: (payload.items ?? []).map(toLandingPageViewModel),
          pagination: payload.pagination,
        };
      },
      placeholderData: keepPreviousData,
    }),
  detail: (slug: string, client: Client) =>
    queryOptions({
      queryKey: landingPageQueries.keys.detail(slug),
      queryFn: async () =>
        toLandingPageViewModel(
          unwrapResponse(await getLandingPage({ client, path: { slug } })),
        ),
    }),
};
```

- [ ] **Step 4: Convert landing list and detail routes**

The list page prefetches `{ page: 1, limit: 12 }`, dehydrates it, and renders a client screen. The client screen calls `useLandingPages`, handles query states before JSX, and passes mapped items into the current card grid. The detail page awaits the slug query, maps generated 404 to `notFound()`, and hydrates `LandingDetailScreen`. Preserve current visual markup and consume only `LandingPageViewModel` fields.

- [ ] **Step 5: Run landing tests and checks, then commit**

```bash
rtk pnpm vitest run features/landing-pages
rtk tsc --noEmit
rtk pnpm lint
rtk git add client-service/client-author/features/landing-pages client-service/client-author/app/landing
rtk git commit -m "feat: load landing pages from API"
```

---

### Task 7: Add the full-stack convenience command and complete verification

**Files:**
- Create: `client-service/client-author/scripts/wait-for-api.mjs`
- Create: `client-service/client-author/scripts/wait-for-api.test.mjs`
- Modify: `client-service/client-author/package.json`
- Modify: `client-service/client-author/README.md`
- Delete: `client-service/client-author/lib/mock-data.ts`

**Interfaces:**
- Produces: `waitForApi({ schemaUrl, timeoutMs, intervalMs })`, `pnpm dev:backend`, `pnpm dev:with-api`, and `pnpm dev:fullstack`.
- Consumes: `OPENAPI_SCHEMA_URL` and the current monorepo `golang-crm` path only in `dev:backend`.

- [ ] **Step 1: Write failing API wait tests**

Create a test server that returns 503 twice and 200 on the third request; assert `waitForApi` resolves. Add a permanently failing server and assert timeout rejection includes the host. The exported helper derives `/health` from the origin of `OPENAPI_SCHEMA_URL`, so no backend URL is hard-coded in the wait module.

```js
await waitForApi({ schemaUrl: endpoint.url, timeoutMs: 500, intervalMs: 10 });
await assert.rejects(
  waitForApi({ schemaUrl: failing.url, timeoutMs: 30, intervalMs: 10 }),
  /127\.0\.0\.1/,
);
```

- [ ] **Step 2: Run the wait tests and verify the missing module fails**

```bash
rtk proxy node --test scripts/wait-for-api.test.mjs
```

- [ ] **Step 3: Implement the bounded health wait**

Create `wait-for-api.mjs` with this public behavior:

```js
export async function waitForApi({
  schemaUrl = process.env.OPENAPI_SCHEMA_URL,
  timeoutMs = 30_000,
  intervalMs = 250,
} = {}) {
  if (!schemaUrl) throw new Error("OPENAPI_SCHEMA_URL is required");
  const healthUrl = new URL("/health", schemaUrl);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`API did not become healthy at ${healthUrl.host}`);
}
```

Load `.env.local` and `.env` in the same order as the sync script and add the same CLI-entry guard so importing the function does not execute it.

- [ ] **Step 4: Add independent and monorepo development scripts**

Keep `"dev": "next dev"` and merge:

```json
{
  "scripts": {
    "dev:backend": "cd ../../golang-crm && go run ./cmd",
    "dev:with-api": "node scripts/wait-for-api.mjs && pnpm generate:api && next dev",
    "dev:fullstack": "concurrently --kill-others --names backend,frontend \"pnpm dev:backend\" \"pnpm dev:with-api\""
  }
}
```

- [ ] **Step 5: Document setup and remove the unused mock module**

Update `README.md` with:

```markdown
## Generated API client

Copy `.env.example` to `.env.local` and set the schema and runtime backend URLs.

- `pnpm sync:openapi` downloads the OpenAPI snapshot.
- `pnpm generate:api` downloads the snapshot and regenerates types/services.
- `pnpm dev` runs the frontend against an independently managed backend.
- `pnpm dev:fullstack` starts the current monorepo Go backend, waits for health,
  regenerates the client, and starts Next.js.

Generated files under `generated/api` and `openapi/api.yml` are committed so a
frontend build does not depend on backend availability.
```

Confirm no source imports `lib/mock-data.ts`, then remove that file with an
`apply_patch` delete operation.

- [ ] **Step 6: Run the complete automated verification**

```bash
rtk pnpm test
rtk tsc --noEmit
rtk pnpm lint
rtk pnpm build
rtk git diff --check
```

Expected: all tests, type checks, lint, build, and whitespace validation pass.

- [ ] **Step 7: Run the live integration smoke checks**

Start the database if necessary, then start the combined development command:

```bash
rtk docker compose up -d db-crm
rtk pnpm dev:fullstack
```

In a second terminal verify:

```bash
rtk proxy curl --fail --silent http://localhost:8080/health
rtk proxy curl --fail --silent http://localhost:8080/api.yml
rtk proxy curl --fail --silent http://localhost:3000/backend-api/api/products?page=1\&limit=12
rtk proxy curl --fail --silent http://localhost:3000/products
rtk proxy curl --fail --silent http://localhost:3000/blogs
rtk proxy curl --fail --silent http://localhost:3000/landing
```

Expected: health is 200, the schema is YAML, the proxy returns paginated product JSON, and each page returns rendered HTML without mock-data imports.

- [ ] **Step 8: Commit the workflow and cleanup**

```bash
rtk git add client-service/client-author/package.json client-service/client-author/README.md client-service/client-author/scripts
rtk git add -u client-service/client-author/lib/mock-data.ts
rtk git commit -m "chore: add full-stack author development workflow"
```
