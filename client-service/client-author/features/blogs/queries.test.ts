import { describe, expect, it } from "vitest";
import { blogQueries } from "./queries";

describe("blogQueries keys", () => {
  it("separates list responses by every supported filter", () => {
    const base = {
      page: 1,
      limit: 12,
      category: "design",
      tag: "web",
      author: "alex",
      search: "next",
      sort: "latest" as const,
    };
    const variants = [
      { ...base, page: 2 },
      { ...base, limit: 24 },
      { ...base, category: "commerce" },
      { ...base, tag: "ux" },
      { ...base, author: "sarah" },
      { ...base, search: "react" },
    ];

    for (const filters of variants) {
      expect(blogQueries.keys.list(filters)).not.toEqual(blogQueries.keys.list(base));
    }
  });

  it("keys detail responses by slug", () => {
    expect(blogQueries.keys.detail("web-design-trends-2025")).toEqual([
      "blogs",
      "detail",
      "web-design-trends-2025",
    ]);
  });

  it("uses one stable category key", () => {
    expect(blogQueries.keys.categories).toEqual(["blogs", "categories"]);
  });
});
