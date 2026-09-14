import { describe, expect, it } from "vitest";
import { toLandingPageViewModel } from "./model";

describe("toLandingPageViewModel", () => {
  it("maps nested price and content fields before render", () => {
    const page = toLandingPageViewModel({
      id: "l1",
      slug: "smart-home",
      title: "Smart Home",
      category: "Công nghệ",
      description: "Nhà thông minh",
      price: { amount: 1_890_000, currency: "VND" },
      thumbnailUrl: "/images/landing/smart-home.webp",
      features: ["Thiết bị", "Trải nghiệm"],
    });

    expect(page).toMatchObject({
      id: "l1",
      slug: "smart-home",
      title: "Smart Home",
      category: "Công nghệ",
      description: "Nhà thông minh",
      price: 1_890_000,
      currency: "VND",
      thumbnailUrl: "/images/landing/smart-home.webp",
      features: ["Thiết bị", "Trải nghiệm"],
    });
    expect(page.accent).toContain("from-");
  });

  it("fills stable display defaults", () => {
    const first = toLandingPageViewModel({ slug: "minimal" });
    const second = toLandingPageViewModel({ slug: "minimal" });

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      id: "minimal",
      title: "Landing page",
      price: 0,
      currency: "VND",
      features: [],
    });
  });
});
