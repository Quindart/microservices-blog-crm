import { describe, expect, it } from "vitest";
import { createQueryClient } from "./query-client";

describe("createQueryClient", () => {
  it("keeps storefront reads fresh for five minutes", () => {
    const options = createQueryClient().getDefaultOptions().queries;

    expect(options?.staleTime).toBe(5 * 60 * 1000);
    expect(options?.refetchOnWindowFocus).toBe(false);
    expect(options?.retry).toBe(1);
  });
});
