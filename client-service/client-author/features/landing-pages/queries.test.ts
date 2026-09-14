import { describe, expect, it } from "vitest";
import { landingPageQueries } from "./queries";

describe("landingPageQueries keys", () => {
  it("keys lists by pagination", () => {
    expect(landingPageQueries.keys.list({ page: 1, limit: 12 })).toEqual([
      "landing-pages",
      "list",
      { page: 1, limit: 12 },
    ]);
    expect(landingPageQueries.keys.list({ page: 2, limit: 12 })).not.toEqual(
      landingPageQueries.keys.list({ page: 1, limit: 12 }),
    );
  });

  it("keys detail responses by slug", () => {
    expect(landingPageQueries.keys.detail("smart-home")).toEqual([
      "landing-pages",
      "detail",
      "smart-home",
    ]);
  });
});
