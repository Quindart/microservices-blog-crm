# Author storefront

The storefront uses the Go service's OpenAPI document to generate typed API
clients. Product and blog categories are filters for their respective lists;
they do not have standalone pages.

## Environment

Copy `.env.example` to `.env.local`. The defaults expect the Go backend at
`http://localhost:8080`:

```bash
OPENAPI_SCHEMA_URL=http://localhost:8080/api.yml
API_PROXY_TARGET=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=/backend-api
```

`OPENAPI_SCHEMA_URL` is used only by the generation scripts. Browser requests
use the Next.js `/backend-api` rewrite, so the frontend source does not depend
on the backend repository path.

## Development

Start only the frontend when the backend is already running:

```bash
pnpm dev
```

Start both services from this package:

```bash
pnpm dev:fullstack
```

The full-stack command starts the Go service, waits for `/health`, downloads
`api.yml`, regenerates the typed client, and then starts Next.js. The backend
listens on port 8080 with the current Go configuration, and the frontend opens
on [http://localhost:3000](http://localhost:3000).

## OpenAPI generation

With the backend available at `OPENAPI_SCHEMA_URL`, run:

```bash
pnpm sync:openapi
pnpm generate:api
```

`sync:openapi` validates the downloaded YAML before replacing
`openapi/api.yml`. `generate:api` performs that sync and writes types and API
services to `generated/api`. Commit the schema snapshot and generated output so
the frontend can still install, type-check, and build without a live backend.

Do not edit files in `generated/api` by hand. Put request options, query keys,
view-model mapping, and React Query hooks under `lib/api` and `features`.

## Validation

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

## Local storefront seed

Start the Go backend once so GORM creates the storefront tables, then run the
idempotent seed for the author storefront:

```bash
PGPASSWORD=password_b psql -h localhost -p 5433 -U user_b -d author_storefront \
  -f database/seed.sql
```

The seed contains the products, variants, media, landing pages, blog content,
and contact records used by the storefront flows. Its stable IDs and slugs make
it safe to run repeatedly in a local database.
