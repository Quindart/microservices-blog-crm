export type LandingPage = {
  slug: string;
  title: string;
  category: string;
  description: string;
  price: number;
  accent: string;
  features: string[];
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
  comparePrice?: number;
  discountPercent?: number;
  priceTone: "blue" | "emerald" | "violet" | "rose";
  highlight: string;
  badge: string;
  plans: string[];
  accent: string;
};

export type Blog = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: number;
  image: string;
  tags: string[];
};

export const landingPages: LandingPage[] = [
  {
    slug: "smart-home",
    title: "Smart Home",
    category: "Nhà thông minh",
    description:
      "Landing page giới thiệu hệ sinh thái nhà thông minh, thiết bị kết nối và trải nghiệm sống tiện nghi.",
    price: 1890000,
    accent: "from-sky-700 via-blue-600 to-cyan-400",
    features: [
      "Trình bày hệ sinh thái thiết bị",
      "Kể chuyện về trải nghiệm sống",
      "CTA tư vấn và đăng ký lắp đặt",
    ],
  },
  {
    slug: "financial-trading",
    title: "Giao dịch tài chính",
    category: "Fintech",
    description:
      "Landing page cho nền tảng giao dịch tài chính với trọng tâm là dữ liệu, sự tin cậy và tốc độ ra quyết định.",
    price: 2190000,
    accent: "from-slate-950 via-indigo-900 to-blue-700",
    features: [
      "Trình bày dữ liệu dễ hiểu",
      "Luồng bắt đầu giao dịch",
      "Thiết kế tạo dựng niềm tin",
    ],
  },
  {
    slug: "education",
    title: "Giáo dục",
    category: "Education",
    description:
      "Landing page cho nền tảng giáo dục, khóa học và cộng đồng học tập với trải nghiệm gần gũi, rõ ràng.",
    price: 1690000,
    accent: "from-amber-500 via-orange-400 to-rose-400",
    features: [
      "Giới thiệu chương trình học",
      "Lộ trình và đội ngũ giảng dạy",
      "Đăng ký tư vấn khóa học",
    ],
  },
];

export const products: Product[] = [
  {
    id: "aurora-lamp",
    name: "Landing page thương hiệu Aurora",
    category: "Website thương hiệu",
    price: 1290000,
    rating: 4.9,
    reviews: 184,
    comparePrice: 1590000,
    discountPercent: 19,
    priceTone: "blue",
    description:
      "Landing page cao cấp giúp thương hiệu kể câu chuyện, giới thiệu sản phẩm và tạo chuyển đổi.",
    highlight: "Bán chạy nhất",
    badge: "Nổi bật",
    plans: ["Cơ bản", "Tiêu chuẩn", "Cao cấp"],
    accent: "from-stone-200 via-zinc-100 to-white",
  },
  {
    id: "velvet-chair",
    name: "Website nội thất Velvet",
    category: "Website bán hàng",
    price: 1690000,
    rating: 4.8,
    reviews: 94,
    priceTone: "violet",
    description:
      "Website bán hàng tinh tế với danh mục sản phẩm, bộ sưu tập và trải nghiệm mua sắm rõ ràng.",
    highlight: "Được nhiều khách chọn",
    badge: "Phổ biến",
    plans: ["MVP", "Tăng trưởng", "Toàn diện"],
    accent: "from-violet-200 via-purple-100 to-white",
  },
  {
    id: "atlas-bottle",
    name: "Landing page sản phẩm Atlas",
    category: "Landing page chuyển đổi",
    price: 1090000,
    rating: 4.7,
    reviews: 320,
    comparePrice: 1390000,
    discountPercent: 22,
    priceTone: "emerald",
    description:
      "Landing page tập trung vào lợi ích sản phẩm, nội dung thuyết phục và lời kêu gọi hành động rõ ràng.",
    highlight: "Lựa chọn hiệu quả",
    badge: "Tối ưu chuyển đổi",
    plans: ["Một trang", "Có CMS", "Có tích hợp"],
    accent: "from-cyan-100 via-sky-50 to-white",
  },
  {
    id: "milo-watch",
    name: "Website giới thiệu dịch vụ Milo",
    category: "Website dịch vụ",
    price: 1590000,
    rating: 4.9,
    reviews: 121,
    priceTone: "rose",
    description:
      "Website chuyên nghiệp giúp doanh nghiệp giới thiệu dịch vụ, quy trình làm việc và nhận yêu cầu tư vấn.",
    highlight: "Cao cấp",
    badge: "Đánh giá cao",
    plans: ["Giới thiệu", "Tư vấn", "Tích hợp CRM"],
    accent: "from-slate-100 via-neutral-50 to-white",
  },
  {
    id: "nova-headset",
    name: "Website SaaS Nova",
    category: "Website phần mềm",
    price: 1890000,
    rating: 4.8,
    reviews: 208,
    comparePrice: 2290000,
    discountPercent: 17,
    priceTone: "violet",
    description:
      "Website SaaS hiện đại với trang tính năng, bảng giá, đăng ký demo và nền tảng nội dung mở rộng.",
    highlight: "Được yêu thích",
    badge: "Biên tập viên chọn",
    plans: ["Landing page", "Bảng giá", "Demo và dashboard"],
    accent: "from-fuchsia-100 via-pink-50 to-white",
  },
  {
    id: "harbor-throw",
    name: "Cổng thông tin Harbor",
    category: "Hệ thống nội dung",
    price: 1990000,
    rating: 4.6,
    reviews: 77,
    priceTone: "blue",
    description:
      "Cổng thông tin có cấu trúc nội dung rõ ràng, tìm kiếm nhanh và giao diện quản trị dễ mở rộng.",
    highlight: "Giải pháp toàn diện",
    badge: "Mới",
    plans: ["Nội dung", "Tìm kiếm", "Quản trị nâng cao"],
    accent: "from-amber-100 via-orange-50 to-white",
  },
];

export const blogs: Blog[] = [
  {
    slug: "web-design-trends-2025",
    title: "Xu hướng thiết kế web 2025: Khi tối giản gặp chuyển động",
    excerpt:
      "Khám phá những xu hướng thiết kế mới đang định hình trải nghiệm số năm 2025, từ thẩm mỹ whiteframe đến các tương tác vi mô tinh tế.",
    content:
      "Hướng dẫn toàn diện về những xu hướng thiết kế web có ảnh hưởng nhất đến không gian số năm 2025...",
    category: "Thiết kế",
    author: "Alex Chen",
    publishedAt: "2025-08-28",
    readTime: 8,
    image: "design-trends-2025",
    tags: ["thiết kế", "xu hướng", "web", "2025"],
  },
  {
    slug: "ecommerce-checkout-optimization",
    title: "Tối ưu quy trình thanh toán thương mại điện tử để tăng chuyển đổi",
    excerpt:
      "Tìm hiểu các chiến lược đã được kiểm chứng để giảm bỏ giỏ hàng và tăng tỷ lệ chuyển đổi nhờ thiết kế thanh toán tinh gọn.",
    content:
      "Tối ưu quy trình thanh toán là yếu tố quan trọng để thương mại điện tử thành công. Khám phá các thực hành tốt dựa trên nhiều thử nghiệm A/B...",
    category: "Thương mại điện tử",
    author: "Sarah Mitchell",
    publishedAt: "2025-08-25",
    readTime: 12,
    image: "ecommerce-checkout",
    tags: ["thương mại điện tử", "chuyển đổi", "ux", "thanh toán"],
  },
  {
    slug: "animation-performance-nextjs",
    title: "Tối ưu hiệu năng animation với Framer Motion trong Next.js",
    excerpt:
      "Làm chủ animation mượt mà, hiệu quả với Framer Motion mà vẫn duy trì tốc độ tải trang tối ưu.",
    content:
      "Animation có thể nâng cao đáng kể trải nghiệm người dùng nhưng cũng ảnh hưởng đến hiệu năng. Học cách cân bằng cả hai yếu tố...",
    category: "Lập trình",
    author: "Jordan Kumar",
    publishedAt: "2025-08-22",
    readTime: 10,
    image: "animation-performance",
    tags: ["animation", "nextjs", "hiệu năng", "framer-motion"],
  },
  {
    slug: "color-psychology-branding",
    title: "Tâm lý màu sắc trong thương hiệu: Kết hợp xanh và đen",
    excerpt:
      "Hiểu cách lựa chọn màu sắc có chiến lược, đặc biệt là xanh và đen, tác động đến nhận thức thương hiệu và hành vi người dùng.",
    content:
      "Màu sắc là một trong những công cụ mạnh mẽ nhất của thương hiệu. Bài viết đi sâu vào tâm lý đằng sau các kết hợp màu phổ biến...",
    category: "Thương hiệu",
    author: "Emma Rodriguez",
    publishedAt: "2025-08-20",
    readTime: 9,
    image: "color-psychology",
    tags: ["thương hiệu", "màu sắc", "tâm lý", "thiết kế"],
  },
  {
    slug: "responsive-typography-guide",
    title: "Hướng dẫn toàn diện về typography responsive",
    excerpt:
      "Làm chủ kỹ thuật typography linh hoạt để hiển thị đẹp trên mọi thiết bị mà vẫn đảm bảo khả năng đọc và thứ bậc nội dung.",
    content:
      "Typography thường bị bỏ qua trong thiết kế responsive nhưng lại rất quan trọng với trải nghiệm người dùng. Học cách triển khai responsive...",
    category: "Thiết kế",
    author: "Michael Park",
    publishedAt: "2025-08-18",
    readTime: 11,
    image: "responsive-typography",
    tags: ["typography", "responsive", "thiết kế", "css"],
  },
  {
    slug: "personalization-ecommerce",
    title: "Chiến lược cá nhân hóa thực sự hiệu quả trong năm 2025",
    excerpt:
      "Khám phá các kỹ thuật cá nhân hóa dựa trên dữ liệu để tăng tương tác và giá trị vòng đời khách hàng trong thương mại điện tử hiện đại.",
    content:
      "Cá nhân hóa đã trở thành yếu tố thiết yếu với các nền tảng thương mại điện tử cạnh tranh. Hướng dẫn này trình bày các chiến lược tạo ra kết quả...",
    category: "Thương mại điện tử",
    author: "Lisa Thompson",
    publishedAt: "2025-08-15",
    readTime: 13,
    image: "personalization-ecommerce",
    tags: ["cá nhân hóa", "thương mại điện tử", "ai", "chuyển đổi"],
  },
];
