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

  if (!address || typeof address === "string") {
    throw new Error("Test server did not expose a TCP port");
  }

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
  { name: "an HTTP failure", body: "unavailable", status: 503 },
  { name: "an invalid OpenAPI document", body: "name: missing-openapi", status: 200 },
]) {
  test(`preserves the previous schema after ${failure.name}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "author-openapi-"));
    const destination = join(directory, "api.yml");
    const previous = "openapi: 3.0.3\npaths: {}\n";
    await writeFile(destination, previous, "utf8");
    const endpoint = await serve(failure.body, failure.status);

    try {
      await assert.rejects(syncOpenApi({ sourceUrl: endpoint.url, destination }));
      assert.equal(await readFile(destination, "utf8"), previous);
    } finally {
      await endpoint.close();
    }
  });
}
