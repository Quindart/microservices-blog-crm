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
  highlight: string;
  badge: string;
  colors: string[];
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
    slug: "luxury-brand",
    title: "Luxury Brand",
    category: "Fashion",
    description: "A premium storefront for luxury campaigns and seasonal launches.",
    price: 390,
    accent: "from-slate-900 via-slate-700 to-zinc-500",
    features: ["Conversion-first blocks", "High-end product showcase", "Checkout UI ready"],
  },
  {
    slug: "saas-growth",
    title: "SaaS Growth",
    category: "Software",
    description: "A modern SaaS landing page designed for demos, pricing, and leads.",
    price: 290,
    accent: "from-cyan-600 via-sky-500 to-indigo-500",
    features: ["Demo request funnel", "Feature comparison", "Lead capture sections"],
  },
  {
    slug: "beauty-studio",
    title: "Beauty Studio",
    category: "Beauty",
    description: "Clean editorial layouts for beauty brands, tutorials, and product sets.",
    price: 240,
    accent: "from-rose-500 via-pink-500 to-orange-400",
    features: ["Editorial storytelling", "UGC sections", "Bundle promos"],
  },
];

export const products: Product[] = [
  {
    id: "aurora-lamp",
    name: "Aurora Lamp",
    category: "Home Decor",
    price: 79,
    rating: 4.9,
    reviews: 184,
    description: "A warm ambient lamp that adds soft lighting to modern living spaces.",
    highlight: "Best seller",
    badge: "New",
    colors: ["Sand", "Onyx", "Ivory"],
    accent: "from-stone-200 via-zinc-100 to-white",
  },
  {
    id: "velvet-chair",
    name: "Velvet Chair",
    category: "Furniture",
    price: 249,
    rating: 4.8,
    reviews: 94,
    description: "Comfort-first seating with sculpted lines and a soft-touch fabric finish.",
    highlight: "Limited stock",
    badge: "Hot",
    colors: ["Forest", "Plum", "Camel"],
    accent: "from-violet-200 via-purple-100 to-white",
  },
  {
    id: "atlas-bottle",
    name: "Atlas Bottle",
    category: "Lifestyle",
    price: 42,
    rating: 4.7,
    reviews: 320,
    description: "Insulated steel hydration bottle designed for city commuting and daily routines.",
    highlight: "Eco pick",
    badge: "Popular",
    colors: ["Ocean", "Slate", "Rose"],
    accent: "from-cyan-100 via-sky-50 to-white",
  },
  {
    id: "milo-watch",
    name: "Milo Watch",
    category: "Accessories",
    price: 189,
    rating: 4.9,
    reviews: 121,
    description: "Minimal timepiece with a refined dial and a titanium-inspired finish.",
    highlight: "Premium",
    badge: "Top rated",
    colors: ["Silver", "Graphite", "Champagne"],
    accent: "from-slate-100 via-neutral-50 to-white",
  },
  {
    id: "nova-headset",
    name: "Nova Headset",
    category: "Electronics",
    price: 139,
    rating: 4.8,
    reviews: 208,
    description: "Wireless audio focused on comfort, clarity, and immersive day-long listening.",
    highlight: "Most loved",
    badge: "Editor’s choice",
    colors: ["Pearl", "Ink", "Blush"],
    accent: "from-fuchsia-100 via-pink-50 to-white",
  },
  {
    id: "harbor-throw",
    name: "Harbor Throw",
    category: "Textiles",
    price: 68,
    rating: 4.6,
    reviews: 77,
    description:
      "Layered knit throw with a soft hand-feel ideal for cozy corners and nightly reading.",
    highlight: "Giftable",
    badge: "Cozy",
    colors: ["Stone", "Moss", "Sand"],
    accent: "from-amber-100 via-orange-50 to-white",
  },
];

export const blogs: Blog[] = [
  {
    slug: "web-design-trends-2025",
    title: "Web Design Trends for 2025: Minimalism Meets Motion",
    excerpt:
      "Explore the latest design trends that are reshaping digital experiences in 2025, from whiteframe aesthetics to sophisticated micro-interactions.",
    content:
      "This comprehensive guide covers the most influential web design trends shaping the digital landscape in 2025...",
    category: "Design",
    author: "Alex Chen",
    publishedAt: "2025-08-28",
    readTime: 8,
    image: "design-trends-2025",
    tags: ["design", "trends", "web", "2025"],
  },
  {
    slug: "ecommerce-checkout-optimization",
    title: "Optimizing E-commerce Checkout Flows for Maximum Conversions",
    excerpt:
      "Learn proven strategies to reduce cart abandonment and increase conversion rates through streamlined checkout design.",
    content:
      "Checkout flow optimization is critical for e-commerce success. Discover best practices based on extensive A/B testing...",
    category: "E-commerce",
    author: "Sarah Mitchell",
    publishedAt: "2025-08-25",
    readTime: 12,
    image: "ecommerce-checkout",
    tags: ["ecommerce", "conversion", "ux", "checkout"],
  },
  {
    slug: "animation-performance-nextjs",
    title: "Performance-Optimized Animations with Framer Motion in Next.js",
    excerpt:
      "Master the art of smooth, performant animations using Framer Motion while maintaining optimal page load speeds.",
    content:
      "Animations can significantly enhance user experience but can also impact performance. Learn how to balance both effectively...",
    category: "Development",
    author: "Jordan Kumar",
    publishedAt: "2025-08-22",
    readTime: 10,
    image: "animation-performance",
    tags: ["animation", "nextjs", "performance", "framer-motion"],
  },
  {
    slug: "color-psychology-branding",
    title: "Color Psychology in Branding: Blue & Black Combinations",
    excerpt:
      "Understand how strategic color choices, particularly blue and black, influence brand perception and user behavior.",
    content:
      "Color is one of the most powerful tools in branding. This deep dive explores the psychology behind popular color combinations...",
    category: "Branding",
    author: "Emma Rodriguez",
    publishedAt: "2025-08-20",
    readTime: 9,
    image: "color-psychology",
    tags: ["branding", "color", "psychology", "design"],
  },
  {
    slug: "responsive-typography-guide",
    title: "The Complete Guide to Responsive Typography",
    excerpt:
      "Master fluid typography techniques that scale beautifully across all devices while maintaining readability and hierarchy.",
    content:
      "Typography is often overlooked in responsive design, but it's crucial for user experience. Learn how to implement responsive...",
    category: "Design",
    author: "Michael Park",
    publishedAt: "2025-08-18",
    readTime: 11,
    image: "responsive-typography",
    tags: ["typography", "responsive", "design", "css"],
  },
  {
    slug: "personalization-ecommerce",
    title: "Personalization Strategies That Actually Work in 2025",
    excerpt:
      "Discover data-driven personalization techniques to increase customer engagement and lifetime value in modern e-commerce.",
    content:
      "Personalization has become essential for competitive e-commerce platforms. This guide covers proven strategies that drive results...",
    category: "E-commerce",
    author: "Lisa Thompson",
    publishedAt: "2025-08-15",
    readTime: 13,
    image: "personalization-ecommerce",
    tags: ["personalization", "ecommerce", "ai", "conversion"],
  },
];
