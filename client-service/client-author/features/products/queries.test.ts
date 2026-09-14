import { describe, expect, it } from "vitest";
import { productQueries } from "./queries";

describe("productQueries keys", () => {
  it("separates product lists with different API filters", () => {
    const first = productQueries.keys.list({
      page: 1,
      limit: 12,
      search: "aurora",
      category: "brand",
      sort: "popular",
    });
    const second = productQueries.keys.list({
      page: 1,
      limit: 12,
      search: "velvet",
      category: "brand",
      sort: "popular",
    });

    expect(first).not.toEqual(second);
  });

  it("keys a detail response by slug", () => {
    expect(productQueries.keys.detail("aurora-lamp")).toEqual([
      "products",
      "detail",
      "aurora-lamp",
    ]);
  });

  it("uses one stable category key", () => {
    expect(productQueries.keys.categories).toEqual(["products", "categories"]);
  });
});
