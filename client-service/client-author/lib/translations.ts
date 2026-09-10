export type Language = "en" | "vi" | "sv";

export const languageOptions: { value: Language; label: string }[] = [
  { value: "en", label: "Anh" },
  { value: "vi", label: "Việt" },
  { value: "sv", label: "Svenska" },
];

export function resolveLocale(value?: string | string[] | null): Language {
  const normalized = Array.isArray(value) ? value[0] : value;

  if (normalized === "vi") return "vi";
  if (normalized === "sv") return "sv";
  return "en";
}

export const translations = {
  en: {
    home: "Home",
    landing: "Landing",
    products: "Products",
    blogs: "Blogs",
    cart: "Cart",
    payment: "Payment",
    explore: "Explore",
    store: "Storefront",
    templateLibrary: "Template library",
    heroTitle: "Sell more with clean digital experiences.",
    heroDescription:
      "Launch polished product pages, premium landing page templates, and conversion-ready checkout flows with less friction.",
    exploreTemplates: "Explore templates",
    shopProducts: "Shop products",
    designSales: "Design sales",
    ratings: "Ratings",
    fasterLaunch: "Faster launch",
    marketFavorite: "Market favorite",
    popularLanding: "Popular landing pages",
    viewAll: "View all",
    shopNow: "Shop now",
    featuredProducts: "Featured products",
    viewCatalog: "View catalog",
    browseProducts: "Browse products",
    landingPagesForEveryBrand: "Landing pages for every brand story",
    viewDemo: "View demo",
    from: "From",
    author: "Author",
    support: "Support",
    footerTagline:
      "Build, buy and launch your next digital storefront with polished landing pages, premium products, and frictionless payments.",
  },
  vi: {
    home: "Trang chủ",
    landing: "Landing",
    products: "Sản phẩm",
    blogs: "Blog",
    cart: "Giỏ hàng",
    payment: "Thanh toán",
    explore: "Khám phá",
    store: "Cửa hàng",
    templateLibrary: "Thư viện mẫu",
    heroTitle: "Bán hàng hiệu quả hơn với trải nghiệm sáng tạo và sạch đẹp.",
    heroDescription:
      "Ra mắt các trang sản phẩm, mẫu landing page cao cấp và quy trình thanh toán tối ưu để tăng tỷ lệ chuyển đổi.",
    exploreTemplates: "Khám phá mẫu",
    shopProducts: "Mua sản phẩm",
    designSales: "Doanh số thiết kế",
    ratings: "Đánh giá",
    fasterLaunch: "Ra mắt nhanh hơn",
    marketFavorite: "Yêu thích thị trường",
    popularLanding: "Landing page phổ biến",
    viewAll: "Xem tất cả",
    shopNow: "Mua ngay",
    featuredProducts: "Sản phẩm nổi bật",
    viewCatalog: "Xem danh mục",
    browseProducts: "Duyệt sản phẩm",
    landingPagesForEveryBrand: "Landing page cho mọi câu chuyện thương hiệu",
    viewDemo: "Xem demo",
    from: "Từ",
    author: "Tác giả",
    support: "Hỗ trợ",
    footerTagline:
      "Xây dựng, mua và khởi chạy cửa hàng kỹ thuật số tiếp theo với landing page tinh tế, sản phẩm cao cấp và thanh toán liền mạch.",
  },
  sv: {
    home: "Hem",
    landing: "Landing",
    products: "Produkter",
    blogs: "Bloggar",
    cart: "Kundvagn",
    payment: "Betalning",
    explore: "Utforska",
    store: "Butik",
    templateLibrary: "Mallbibliotek",
    heroTitle: "Sälj mer med rena och moderna digitala upplevelser.",
    heroDescription:
      "Lansera polerade produktssidor, premium landningssidor och betalningsflöden som ökar konverteringen med mindre friktion.",
    exploreTemplates: "Utforska mallar",
    shopProducts: "Handla produkter",
    designSales: "Designförsäljning",
    ratings: "Betyg",
    fasterLaunch: "Snabbare lansering",
    marketFavorite: "Marknadsfavorit",
    popularLanding: "Populära landningssidor",
    viewAll: "Se alla",
    shopNow: "Köp nu",
    featuredProducts: "Utvalda produkter",
    viewCatalog: "Se katalog",
    browseProducts: "Bläddra i produkter",
    landingPagesForEveryBrand: "Landningssidor för varje varumärkesberättelse",
    viewDemo: "Se demo",
    from: "Från",
    author: "Författare",
    support: "Support",
    footerTagline:
      "Bygg, köp och lansera din nästa digitala storefront med polerade landningssidor, premiumprodukter och smidig betalning.",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
