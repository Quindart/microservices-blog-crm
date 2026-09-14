import { describe, expect, it } from "vitest";
import { toBlogViewModel, toBlogCategoryOption } from "./model";

describe("toBlogViewModel", () => {
  it("normalizes nested category and author data", () => {
    const blog = toBlogViewModel({
      slug: "web-design-trends-2025",
      title: "Xu hướng thiết kế web",
      excerpt: "Tóm tắt",
      content: "Nội dung",
      category: { id: "c1", name: "Thiết kế", slug: "thiet-ke" },
      author: { name: "Alex Chen", slug: "alex-chen" },
      publishedAt: "2026-09-08T09:11:43+07:00",
      readTime: 8,
      coverImageUrl: "/images/blog/design.webp",
      tags: ["web", "ux"],
    });

    expect(blog).toEqual({
      slug: "web-design-trends-2025",
      title: "Xu hướng thiết kế web",
      excerpt: "Tóm tắt",
      content: "Nội dung",
      categoryName: "Thiết kế",
      categorySlug: "thiet-ke",
      authorName: "Alex Chen",
      publishedAt: "2026-09-08T09:11:43+07:00",
      readTime: 8,
      coverImageUrl: "/images/blog/design.webp",
      tags: ["web", "ux"],
      imageLabel: "WE",
    });
  });

  it("fills safe defaults when optional API fields are missing", () => {
    expect(toBlogViewModel({})).toMatchObject({
      slug: "blog",
      title: "Bài viết",
      categoryName: "Chưa phân loại",
      authorName: "Tác giả",
      readTime: 0,
      tags: [],
      imageLabel: "BL",
    });
  });
});

describe("toBlogCategoryOption", () => {
  it("uses the category slug as the list filter", () => {
    expect(toBlogCategoryOption({ name: "Thiết kế", slug: "thiet-ke" })).toEqual({
      label: "Thiết kế",
      value: "thiet-ke",
    });
  });
});
