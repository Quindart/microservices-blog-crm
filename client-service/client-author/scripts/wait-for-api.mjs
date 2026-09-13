import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { config } from "dotenv";

config({ path: ".env.local", override: false, quiet: true });
config({ path: ".env", override: false, quiet: true });

export async function waitForApi({
  schemaUrl = process.env.OPENAPI_SCHEMA_URL,
  timeoutMs = 30_000,
  intervalMs = 500,
  fetchImpl = fetch,
  now = Date.now,
  sleep = delay,
} = {}) {
  if (!schemaUrl) {
    throw new Error("OPENAPI_SCHEMA_URL is required");
  }

  const healthUrl = new URL("/health", schemaUrl).toString();
  const startedAt = now();
  let attempts = 0;
  let lastFailure = "no response";

  while (attempts === 0 || now() - startedAt < timeoutMs) {
    attempts += 1;

    try {
      const response = await fetchImpl(healthUrl);
      if (response.ok) {
        return { attempts, healthUrl };
      }
      lastFailure = `HTTP ${response.status}`;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }

    const remainingMs = timeoutMs - (now() - startedAt);
    if (remainingMs > 0) {
      await sleep(Math.min(intervalMs, remainingMs));
    }
  }

  throw new Error(
    `Backend did not become healthy within ${timeoutMs}ms (${healthUrl}; last failure: ${lastFailure})`,
  );
}

const isCli = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isCli) {
  const result = await waitForApi();
  console.log(`Backend is healthy at ${result.healthUrl} after ${result.attempts} attempt(s)`);
}
