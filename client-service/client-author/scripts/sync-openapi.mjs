import { randomUUID } from "node:crypto";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
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
  if (!sourceUrl) {
    throw new Error("OPENAPI_SCHEMA_URL is required");
  }

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

  return Buffer.byteLength(source);
}

const isCli = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isCli) {
  const byteLength = await syncOpenApi();
  console.log(`OpenAPI schema synchronized (${byteLength} bytes)`);
}
