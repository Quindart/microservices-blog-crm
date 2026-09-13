# Client Author OpenAPI and React Query Design

## Goal

Replace the product, category-filter, blog, and landing-page mock data in
`client-service/client-author` with a generated OpenAPI SDK and focused TanStack
Query hooks. Keep the frontend portable so it can move to a separate repository
without relying on a relative path to the Go source tree.

## Scope

This work covers:

- downloading the OpenAPI YAML document from a URL configured by the frontend;
- generating TypeScript types and API service functions from that downloaded
  document;
- configuring the generated client independently for browser and server use;
- adding TanStack Query options and hooks for product lists, product details,
  product categories, blog lists, blog details, blog categories, landing-page
  lists, and landing-page details;
- replacing mock-data reads in the existing product, blog, and landing-page
  routes;
- using product and blog categories as list filters;
- providing an optional monorepo development command that starts the Go API,
  waits for it to become healthy, generates the client, and starts Next.js.

This work does not add a `/categories` UI route, change backend business logic,
or generate hooks for cart, checkout, contacts, or other API groups.

## Configuration and Repository Independence

The frontend owns an `.env.example` with these values:

```dotenv
OPENAPI_SCHEMA_URL=http://localhost:8080/api.yml
API_PROXY_TARGET=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=/backend-api
```

`OPENAPI_SCHEMA_URL` is tool-only configuration. It is read by the schema sync
script and is never exposed to browser code. `API_PROXY_TARGET` is read by
Next.js to proxy browser API traffic to the deployed backend. The browser-facing
generated client reads `NEXT_PUBLIC_API_BASE_URL`, whose default same-origin
path is `/backend-api`.

The frontend never reads `../../golang-crm/api.yml`. It saves the downloaded
document as `client-service/client-author/openapi/api.yml`, then generates the
SDK into `client-service/client-author/generated/api`. The schema snapshot and
generated SDK are committed so regular frontend builds do not require a live
backend. Explicit regeneration remains strict: it fails rather than silently
using an old schema when `OPENAPI_SCHEMA_URL` cannot be fetched or returns an
invalid response.

The sync script loads `.env.local` first and `.env` second, matching the local
frontend configuration convention. It writes to a temporary file, validates
that the response is a non-empty OpenAPI YAML document, and renames the file
only after validation. A failed sync therefore preserves the last known-good
snapshot.

## Development Commands

The package scripts have separate responsibilities:

- `pnpm dev` starts only Next.js. This remains the normal command when frontend
  and backend live in separate repositories or are started independently.
- `pnpm sync:openapi` downloads the document configured by
  `OPENAPI_SCHEMA_URL` into `openapi/api.yml`.
- `pnpm generate:api` runs the schema sync and then generates the TypeScript SDK.
- `pnpm dev:backend` starts the current monorepo Go API from the `golang-crm`
  working directory so its `.env` and embedded spec paths resolve correctly.
- `pnpm dev:fullstack` starts the Go API, waits for its `/health` endpoint,
  regenerates the SDK, then starts Next.js. When this repository is later split,
  only this convenience command is monorepo-specific; the generation and
  frontend commands remain portable.

The existing Go service already serves `GET /api.yml`, so no backend endpoint or
handler change is needed. The expected local port remains `8080`, but every URL
used by frontend tooling or runtime traffic comes from frontend environment
configuration.

## Runtime Architecture

Next.js rewrites `/backend-api/:path*` to `${API_PROXY_TARGET}/api/:path*`.
Browser requests therefore use the frontend origin and do not require a backend
CORS change. A production deployment can point `API_PROXY_TARGET` at a remote
backend without regenerating the SDK.

The generated SDK is treated as immutable generated code. Handwritten modules
around it provide:

1. a browser client configured with `NEXT_PUBLIC_API_BASE_URL`;
2. a new server client per server request configured with `API_PROXY_TARGET`;
3. stable query-key factories;
4. query-options factories that call generated services and unwrap successful
   response data;
5. custom hooks that use those query-options factories; and
6. presentation mappers that normalize optional generated fields into the
   complete values required by existing UI components.

Creating a server client per request avoids shared mutable client configuration
across concurrent server renders. Query options accept an optional API client,
so Server Components can prefetch against the absolute backend URL while Client
Components use the same query key and the same-origin browser client.

## Data Flow and Rendering Boundaries

List and detail routes use the TanStack Query hydration pattern recommended by
the installed Next.js documentation. The Server Component resolves route and
search parameters, creates a request-scoped QueryClient, prefetches the matching
query through the server API client, and wraps a Client Component in a
`HydrationBoundary`. The Client Component calls the corresponding custom hook
and reuses the hydrated cache.

The render boundary follows this order:

1. read route or search state;
2. call custom hooks at the top of the Client Component;
3. derive view models and filter state with pure functions or memoized selectors;
4. return loading, error, and empty states early;
5. pass complete view models to presentational components;
6. render JSX without API response unwrapping or field-shape conversion.

This preserves current server-rendered content for initial navigation while
letting TanStack Query own cache reuse, background refresh, and filter changes
in the browser. It also prevents request waterfalls by prefetching independent
list and category queries together.

Product filters use the category slug expected by `GET /api/products`. Blog
filters use the blog category slug expected by `GET /api/blogs`. Search and
category remain encoded in URL search parameters, so links are shareable and
back/forward navigation restores the selected filters. Filter changes retain
the previous list while the new query is fetching.

## Feature Modules

The handwritten data layer is organized by domain rather than by generated
file type:

- `features/products/api.ts` owns product/category query keys, query options,
  and `useProducts`, `useProduct`, and `useProductCategories` hooks.
- `features/products/model.ts` maps generated products and categories to the
  complete product view models used by the UI.
- `features/blogs/api.ts` owns blog/category query keys, query options, and
  `useBlogs`, `useBlog`, and `useBlogCategories` hooks.
- `features/blogs/model.ts` maps generated blog responses to blog view models.
- `features/landing-pages/api.ts` owns landing query keys, query options, and
  `useLandingPages` and `useLandingPage` hooks.
- `features/landing-pages/model.ts` maps landing responses to landing view models.

Shared API client creation and generated-response error conversion live under
`lib/api`. The application-wide QueryClient provider lives in a small Client
Component imported by the root layout. Page-specific screen components live
next to their routes and own orchestration only; existing visual markup is
preserved as presentational components.

## Cache Policy

Catalog and content data changes less frequently than interactive cart data.
The shared QueryClient uses a five-minute `staleTime`, disables refetch on window
focus, and retries failed read requests once. Query keys include every API input
that changes the response: pagination, search, category, tag, author, sort, and
slug. List queries use placeholder data from the immediately previous query to
avoid layout flicker during filter changes.

The page size is explicit rather than depending on backend defaults. Current
list pages request enough records for their existing grids and can expose
pagination later without changing query-key structure.

## Error, Empty, and Not-Found Behavior

The generated SDK is called with error throwing enabled. A shared error adapter
converts generated HTTP errors into an application error containing status and
a user-safe message.

- Network and 5xx failures render a retry action that calls the query refetch.
- Empty list results render a domain-specific empty state while preserving the
  active filters.
- A 404 from a detail endpoint renders the route's existing not-found experience.
- Background refresh errors keep successfully cached data visible and show a
  small non-blocking status instead of replacing the page.
- Missing optional fields in the current OpenAPI schemas receive stable display
  defaults in presentation mappers, never inside JSX.

Schema sync errors include the configured host and HTTP status but do not print
credentials or the full environment. Generation stops before modifying
generated output if the sync step fails.

## Testing and Verification

The implementation adds focused tests for behavior with material failure risk:

- schema sync downloads a valid YAML document atomically and preserves the old
  snapshot on HTTP or validation failure;
- query-key factories distinguish different filters and reuse the same key for
  server prefetch and client hooks;
- presentation mappers correctly adapt nested OpenAPI response fields and fill
  optional display defaults;
- list screens pass URL filters to hooks and render loading, error, empty, and
  successful states;
- detail screens request the route slug and render the not-found state for a
  generated 404.

Verification runs API generation against the live Go endpoint, TypeScript type
checking, ESLint, targeted tests, and a production Next.js build. A local smoke
check starts `dev:fullstack`, confirms `/health`, `/api.yml`, and the Next.js
proxy, then opens the product, blog, and landing list/detail routes with seeded
data.

## Acceptance Criteria

- No product, blog, landing-page, or category-filter page imports the mock data.
- `openapi/api.yml` is sourced from `OPENAPI_SCHEMA_URL`; generation contains no
  relative dependency on the backend repository.
- Generated code contains types and callable services for the selected OpenAPI
  operations and is never hand-edited.
- Product and blog category filters use their respective backend endpoints and
  category slugs.
- All selected list/detail pages use custom TanStack Query hooks with stable
  query keys, visible loading/error/empty states, and hydrated initial data.
- API-shape conversion and state derivation happen before presentational JSX.
- `pnpm dev` works with an independently started backend, and
  `pnpm dev:fullstack` provides the current monorepo convenience workflow.
- Changing the frontend environment URLs is sufficient to point schema sync and
  runtime traffic to a separately deployed backend.
