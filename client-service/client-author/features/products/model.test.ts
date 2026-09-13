import { describe, expect, it } from "vitest";
import { toCategoryOption, toProductViewModel } from "./model";

describe("toProductViewModel", () => {
  it("maps nested API values into a complete render model", () => {
    const product = toProductViewModel({
      id: "p1",
      slug: "aurora-lamp",
      name: "Aurora",
      category: { id: "c1", name: "Website thương hiệu", slug: "brand" },
      shortDescription: "Mô tả ngắn",
      price: { amount: 1_290_000, currency: "VND" },
      rating: { average: 4.9, count: 184 },
      variants: [
        {
          id: "v1",
          name: "Cơ bản",
          price: { amount: 1_290_000, currency: "VND" },
        },
      ],
      inStock: true,
    });

    expect(product).toMatchObject({
      id: "p1",
      slug: "aurora-lamp",
      name: "Aurora",
      categoryName: "Website thương hiệu",
      categorySlug: "brand",
      description: "Mô tả ngắn",
      price: 1_290_000,
      currency: "VND",
      rating: 4.9,
      reviews: 184,
      plans: ["Cơ bản"],
      inStock: true,
    });
    expect(product.accent).toContain("from-");
  });

  it("fills stable defaults for optional API fields", () => {
    const first = toProductViewModel({ slug: "minimal" });
    const second = toProductViewModel({ slug: "minimal" });

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      id: "minimal",
      slug: "minimal",
      name: "Sản phẩm",
      price: 0,
      rating: 0,
      reviews: 0,
      plans: ["Tiêu chuẩn"],
      inStock: false,
    });
  });
});

describe("toCategoryOption", () => {
  it("uses the category slug as the API filter value", () => {
    expect(toCategoryOption({ name: "Thiết kế", slug: "design" })).toEqual({
      label: "Thiết kế",
      value: "design",
    });
  });
});
