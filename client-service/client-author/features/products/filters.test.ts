import { describe, expect, it } from "vitest";
import { buildProductSearchParams } from "./filters";

describe("buildProductSearchParams", () => {
  it("omits a category when the all-categories filter is selected", () => {
    expect(
      buildProductSearchParams({
        page: 1,
        limit: 12,
        search: "lamp",
        category: undefined,
        sort: "popular",
      }).toString(),
    ).toBe("q=lamp&sort=popular");
  });
});
