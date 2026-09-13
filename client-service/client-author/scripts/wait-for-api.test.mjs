import assert from "node:assert/strict";
import test from "node:test";
import { waitForApi } from "./wait-for-api.mjs";

test("waits for the backend health endpoint derived from the schema URL", async () => {
  const requests = [];
  let attempts = 0;

  const result = await waitForApi({
    schemaUrl: "http://127.0.0.1:8080/api.yml",
    intervalMs: 10,
    timeoutMs: 100,
    fetchImpl: async (url) => {
      requests.push(url);
      attempts += 1;
      return { ok: attempts === 2, status: attempts === 2 ? 200 : 503 };
    },
    sleep: async () => {},
  });

  assert.deepEqual(requests, [
    "http://127.0.0.1:8080/health",
    "http://127.0.0.1:8080/health",
  ]);
  assert.equal(result.attempts, 2);
});

test("fails when the backend does not become healthy before the timeout", async () => {
  let clock = 0;

  await assert.rejects(
    waitForApi({
      schemaUrl: "http://127.0.0.1:8080/api.yml",
      intervalMs: 50,
      timeoutMs: 100,
      fetchImpl: async () => ({ ok: false, status: 503 }),
      now: () => clock,
      sleep: async (milliseconds) => {
        clock += milliseconds;
      },
    }),
    /Backend did not become healthy within 100ms/,
  );
});

test("requires the OpenAPI schema URL", async () => {
  await assert.rejects(waitForApi({ schemaUrl: "" }), /OPENAPI_SCHEMA_URL is required/);
});
