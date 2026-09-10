# Product Backend Schema Suggestion

Schema này được thiết kế dựa trên UI flow hiện tại:

- Product listing
- Product detail
- Chọn màu/variant
- Add to cart
- Cart summary
- Checkout/payment
- Rating/reviews
- Filter và sort sản phẩm

Database đề xuất: **PostgreSQL** với **Prisma ORM**.

## 1. Product schema

Nên tách `Product` và `ProductVariant`. Một product có thể có nhiều màu hoặc biến thể, mỗi biến thể có SKU, giá và tồn kho riêng.

```prisma
enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum MediaType {
  IMAGE
  VIDEO
}

model Product {
  id               String        @id @default(uuid())
  slug             String        @unique
  name             String
  shortDescription String?
  description      String?
  categoryId       String?
  status           ProductStatus @default(DRAFT)

  // Marketing fields
  badge            String?       // New, Hot, Popular...
  highlight        String?       // Best seller, Eco pick...
  freeShipping     Boolean       @default(false)

  // Denormalized values for fast product listing
  ratingAverage    Decimal       @default(0) @db.Decimal(3, 2)
  reviewCount      Int           @default(0)

  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  deletedAt        DateTime?

  category         Category?     @relation(fields: [categoryId], references: [id])
  variants         ProductVariant[]
  medias           ProductMedia[]
  reviews          ProductReview[]

  @@index([status])
  @@index([categoryId])
  @@index([createdAt])
}

model ProductVariant {
  id              String   @id @default(uuid())
  productId       String
  sku             String   @unique
  name            String?  // Aurora Lamp - Sand

  price           Decimal  @db.Decimal(12, 2)
  comparePrice    Decimal? @db.Decimal(12, 2)
  currency        String   @default("USD")

  colorName       String?
  colorCode       String?  // #D8C8B0
  stock           Int      @default(0)

  isDefault       Boolean  @default(false)
  isActive        Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  medias          ProductMedia[]
  cartItems       CartItem[]
  orderItems      OrderItem[]

  @@index([productId])
  @@index([productId, isActive])
}

model ProductMedia {
  id              String    @id @default(uuid())
  productId       String
  variantId       String?
  type            MediaType @default(IMAGE)
  url             String
  altText         String?
  sortOrder       Int       @default(0)
  isPrimary       Boolean   @default(false)

  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant         ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)

  @@index([productId, sortOrder])
}

model Category {
  id              String    @id @default(uuid())
  slug            String    @unique
  name            String
  description     String?
  isActive        Boolean   @default(true)

  products        Product[]
}

model ProductReview {
  id              String   @id @default(uuid())
  productId       String
  userId          String?
  rating          Int
  title           String?
  content         String?
  isPublished     Boolean  @default(false)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, isPublished])
}
```

## 2. Landing page schema

Landing page nên là một content/template entity độc lập với product. Một landing page có thể được bán như digital product và có nhiều section để render theo thứ tự.

```prisma
enum LandingPageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum LandingPageSectionType {
  HERO
  FEATURES
  TESTIMONIALS
  PRICING
  CTA
  FAQ
  IMAGE_TEXT
  GALLERY
  CUSTOM
}

model LandingPage {
  id              String            @id @default(uuid())
  slug            String            @unique
  title           String
  categoryId      String?
  description     String?
  status          LandingPageStatus @default(DRAFT)

  // Digital product pricing
  price           Decimal           @db.Decimal(12, 2)
  currency        String            @default("USD")

  // SEO and display metadata
  metaTitle       String?
  metaDescription String?
  thumbnailUrl    String?
  publishedAt     DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  deletedAt       DateTime?

  category        LandingPageCategory? @relation(fields: [categoryId], references: [id])
  features        LandingPageFeature[]
  sections        LandingPageSection[]

  @@index([status])
  @@index([categoryId])
  @@index([createdAt])
}

model LandingPageCategory {
  id              String        @id @default(uuid())
  slug            String        @unique
  name            String
  isActive        Boolean       @default(true)

  landingPages    LandingPage[]
}

model LandingPageFeature {
  id              String      @id @default(uuid())
  landingPageId   String
  content         String
  sortOrder       Int         @default(0)

  landingPage     LandingPage @relation(fields: [landingPageId], references: [id], onDelete: Cascade)

  @@index([landingPageId, sortOrder])
}

model LandingPageSection {
  id              String               @id @default(uuid())
  landingPageId   String
  type            LandingPageSectionType
  title           String?
  content         Json
  sortOrder       Int                  @default(0)
  isVisible       Boolean              @default(true)

  landingPage     LandingPage          @relation(fields: [landingPageId], references: [id], onDelete: Cascade)

  @@index([landingPageId, sortOrder])
}
```

`LandingPageSection.content` dùng `Json` để cho phép mỗi loại section có cấu trúc khác nhau mà không cần tạo thêm table cho từng block. Ví dụ:

```json
{
  "eyebrow": "Luxury Brand",
  "heading": "Build a premium storefront",
  "description": "Conversion-first landing page for modern brands.",
  "imageUrl": "https://cdn.example.com/luxury-brand-hero.webp",
  "cta": {
    "label": "Get the template",
    "href": "/checkout/luxury-brand"
  }
}
```

### Landing page API

```text
GET  /api/landing-pages
GET  /api/landing-pages/:slug
POST /api/landing-pages/:slug/purchase
```

Response cho listing:

```json
{
  "items": [
    {
      "slug": "luxury-brand",
      "title": "Luxury Brand",
      "category": "Fashion",
      "description": "A premium storefront for luxury campaigns and seasonal launches.",
      "price": { "amount": 390, "currency": "USD" },
      "thumbnailUrl": "https://cdn.example.com/luxury-brand.webp",
      "features": [
        "Conversion-first blocks",
        "High-end product showcase",
        "Checkout UI ready"
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 3,
    "totalPages": 1
  }
}
```

## 3. Blog schema

Blog nên tách `BlogPost`, `BlogCategory`, `BlogTag` và `BlogAuthor`. Nội dung bài viết nên lưu ở dạng Markdown hoặc rich-text JSON; không nên chia nhỏ thành nhiều column nếu chưa có nhu cầu edit block-level.

```prisma
enum BlogPostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum BlogContentFormat {
  MARKDOWN
  RICH_TEXT_JSON
}

model BlogPost {
  id              String           @id @default(uuid())
  slug            String           @unique
  title           String
  excerpt         String?
  content         String
  contentFormat   BlogContentFormat @default(MARKDOWN)
  categoryId      String?
  authorId        String?
  status          BlogPostStatus   @default(DRAFT)

  readTime        Int?
  coverImageUrl   String?
  metaTitle       String?
  metaDescription String?
  publishedAt     DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  deletedAt       DateTime?

  category        BlogCategory?    @relation(fields: [categoryId], references: [id])
  author          BlogAuthor?      @relation(fields: [authorId], references: [id])
  tags            BlogPostTag[]

  @@index([status, publishedAt])
  @@index([categoryId])
  @@index([authorId])
}

model BlogCategory {
  id              String      @id @default(uuid())
  slug            String      @unique
  name            String
  description     String?
  isActive        Boolean     @default(true)

  posts           BlogPost[]
}

model BlogAuthor {
  id              String      @id @default(uuid())
  name            String
  slug            String      @unique
  bio             String?
  avatarUrl       String?
  isActive        Boolean     @default(true)

  posts           BlogPost[]
}

model BlogTag {
  id              String       @id @default(uuid())
  slug            String       @unique
  name            String

  posts           BlogPostTag[]
}

model BlogPostTag {
  postId          String
  tagId           String

  post            BlogPost     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag             BlogTag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
  @@index([tagId])
}
```

## 4. Contact schema

Form liên hệ hiện tại có ba field bắt buộc: `fullName`, `email` và `phone`. Backend nên lưu thêm trạng thái xử lý, nguồn gửi và thời gian xử lý để admin có thể quản lý lead.

```prisma
enum ContactStatus {
  NEW
  IN_PROGRESS
  RESOLVED
  SPAM
}

model Contact {
  id              String        @id @default(uuid())
  fullName        String
  email           String
  phone           String
  message         String?
  status          ContactStatus @default(NEW)
  source          String?       // homepage-contact-form, landing-page...
  note            String?
  assignedTo      String?
  resolvedAt      DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status])
  @@index([email])
  @@index([createdAt])
}
```

### Contact API

```text
POST /api/contacts
GET  /api/contacts              // admin
PATCH /api/contacts/:id         // admin cập nhật status/note
```

Request từ form hiện tại:

```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "+84901234567",
  "source": "homepage-contact-form"
}
```

`message` để nullable vì form hiện tại chưa có ô nhập nội dung. Khi bổ sung message textarea, chỉ cần gửi thêm field này, không cần đổi schema.

### Blog API

```text
GET  /api/blogs
GET  /api/blogs/:slug
GET  /api/blog-categories
GET  /api/blog-tags/:slug
```

Các query nên hỗ trợ cho blog listing:

```text
page=1
limit=12
category=e-commerce
tag=ux
author=sarah-mitchell
search=checkout
sort=latest
```

Response cho blog detail:

```json
{
  "slug": "ecommerce-checkout-optimization",
  "title": "Optimizing E-commerce Checkout Flows for Maximum Conversions",
  "excerpt": "Learn proven strategies to reduce cart abandonment and increase conversion rates through streamlined checkout design.",
  "content": "# Optimizing E-commerce Checkout Flows\n\nCheckout flow optimization is critical...",
  "contentFormat": "MARKDOWN",
  "category": {
    "slug": "e-commerce",
    "name": "E-commerce"
  },
  "author": {
    "name": "Sarah Mitchell",
    "slug": "sarah-mitchell",
    "avatarUrl": "https://cdn.example.com/authors/sarah.webp"
  },
  "publishedAt": "2025-08-25T00:00:00.000Z",
  "readTime": 12,
  "coverImageUrl": "https://cdn.example.com/blog/ecommerce-checkout.webp",
  "tags": ["ecommerce", "conversion", "ux", "checkout"]
}
```

## 5. Mapping landing page, blog và contact với mock data/form hiện tại

### Landing page

| Mock field | Backend field |
|---|---|
| `slug` | `LandingPage.slug` |
| `title` | `LandingPage.title` |
| `category` | `LandingPageCategory.name` |
| `description` | `LandingPage.description` |
| `price` | `LandingPage.price` |
| `features` | `LandingPageFeature.content` |
| `accent` | Nên thay bằng `thumbnailUrl` hoặc media URL |

### Blog

| Mock field | Backend field |
|---|---|
| `slug` | `BlogPost.slug` |
| `title` | `BlogPost.title` |
| `excerpt` | `BlogPost.excerpt` |
| `content` | `BlogPost.content` |
| `category` | `BlogCategory.name` |
| `author` | `BlogAuthor.name` |
| `publishedAt` | `BlogPost.publishedAt` |
| `readTime` | `BlogPost.readTime` |
| `image` | `BlogPost.coverImageUrl` |
| `tags` | `BlogPostTag` và `BlogTag` |

Blog hiện tại đang dùng `image` như một key text mockup. Khi kết nối backend nên trả về URL ảnh thật từ storage/CDN.

### Contact

| Form field | Backend field |
|---|---|
| `fullName` | `Contact.fullName` |
| `email` | `Contact.email` |
| `phone` | `Contact.phone` |
| form page | `Contact.source` |
| message textarea nếu bổ sung | `Contact.message` |

## 6. Cart schema

Cart có thể gắn với user khi đã đăng nhập hoặc với `sessionId` khi guest checkout.

```prisma
model Cart {
  id              String     @id @default(uuid())
  userId          String?
  sessionId       String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  items           CartItem[]

  @@index([userId])
  @@index([sessionId])
}

model CartItem {
  id              String  @id @default(uuid())
  cartId          String
  variantId       String
  quantity        Int

  cart            Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  variant         ProductVariant @relation(fields: [variantId], references: [id])

  @@unique([cartId, variantId])
}
```

## 7. Order và checkout schema

Order item cần lưu snapshot của product name, variant name và price tại thời điểm đặt hàng. Không nên đọc lại giá hiện tại từ `ProductVariant` để tính các order cũ.

```prisma
enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  COMPLETED
  CANCELLED
  REFUNDED
}

model Order {
  id              String      @id @default(uuid())
  orderNumber     String      @unique
  userId          String?
  status          OrderStatus @default(PENDING)

  subtotal        Decimal     @db.Decimal(12, 2)
  shippingFee     Decimal     @db.Decimal(12, 2)
  discount        Decimal     @default(0) @db.Decimal(12, 2)
  total           Decimal     @db.Decimal(12, 2)
  currency        String      @default("USD")

  customerName    String
  customerEmail   String
  shippingAddress Json

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  items           OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model OrderItem {
  id              String   @id @default(uuid())
  orderId         String
  variantId       String?

  // Snapshot fields
  productName     String
  variantName     String?
  sku             String?
  unitPrice       Decimal  @db.Decimal(12, 2)
  quantity        Int
  totalPrice      Decimal  @db.Decimal(12, 2)

  order           Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  variant         ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)

  @@index([orderId])
}
```

## 8. Product list API

### Request

```http
GET /api/products?page=1&limit=12&category=home-decor&minPrice=20&maxPrice=200&sort=popular&search=lamp
```

Các giá trị `sort` nên hỗ trợ:

```text
newest
price_asc
price_desc
rating
popular
```

### Response

```json
{
  "items": [
    {
      "id": "prod_aurora_lamp",
      "slug": "aurora-lamp",
      "name": "Aurora Lamp",
      "category": {
        "id": "cat_home-decor",
        "name": "Home Decor",
        "slug": "home-decor"
      },
      "shortDescription": "A warm ambient lamp for modern living spaces.",
      "price": { "amount": 79, "currency": "USD" },
      "rating": { "average": 4.9, "count": 184 },
      "badge": "New",
      "highlight": "Best seller",
      "thumbnail": {
        "url": "https://cdn.example.com/aurora-lamp.webp",
        "alt": "Aurora Lamp"
      },
      "inStock": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 6,
    "totalPages": 1
  }
}
```

## 9. Product detail API

### Request

```http
GET /api/products/aurora-lamp
```

### Response

```json
{
  "id": "prod_aurora_lamp",
  "slug": "aurora-lamp",
  "name": "Aurora Lamp",
  "category": {
    "id": "cat_home-decor",
    "name": "Home Decor",
    "slug": "home-decor"
  },
  "description": "A warm ambient lamp that adds soft lighting to modern living spaces.",
  "badge": "New",
  "highlight": "Best seller",
  "freeShipping": true,
  "rating": { "average": 4.9, "count": 184 },
  "media": [
    {
      "url": "https://cdn.example.com/aurora-lamp-main.webp",
      "alt": "Aurora Lamp front view",
      "isPrimary": true
    }
  ],
  "variants": [
    {
      "id": "variant_aurora_sand",
      "sku": "AURORA-SAND",
      "name": "Sand",
      "color": { "name": "Sand", "code": "#D8C8B0" },
      "price": { "amount": 79, "currency": "USD" },
      "stock": 12,
      "available": true
    },
    {
      "id": "variant_aurora_onyx",
      "sku": "AURORA-ONYX",
      "name": "Onyx",
      "price": { "amount": 79, "currency": "USD" },
      "stock": 0,
      "available": false
    }
  ],
  "shipping": {
    "free": true,
    "estimatedDays": "3-5 business days"
  }
}
```

## 10. Suggested cart API

### Add item to cart

```http
POST /api/cart/items
Content-Type: application/json
```

```json
{
  "variantId": "variant_aurora_sand",
  "quantity": 1
}
```

### Update quantity

```http
PATCH /api/cart/items/:itemId
Content-Type: application/json
```

```json
{
  "quantity": 2
}
```

### Get cart

```http
GET /api/cart
```

Response nên bao gồm item, variant, thumbnail và summary:

```json
{
  "items": [
    {
      "id": "cart_item_1",
      "productId": "prod_aurora_lamp",
      "variantId": "variant_aurora_sand",
      "name": "Aurora Lamp",
      "variantName": "Sand",
      "unitPrice": 79,
      "quantity": 1,
      "totalPrice": 79,
      "thumbnailUrl": "https://cdn.example.com/aurora-lamp.webp"
    }
  ],
  "summary": {
    "subtotal": 79,
    "shippingFee": 12,
    "total": 91,
    "currency": "USD"
  }
}
```

## 11. Suggested checkout API

### Create order

```http
POST /api/orders
Content-Type: application/json
```

```json
{
  "customerName": "Maya Johnson",
  "customerEmail": "maya@example.com",
  "shippingAddress": {
    "line1": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  }
}
```

Backend cần thực hiện trong transaction:

1. Load cart và kiểm tra variant còn active.
2. Kiểm tra tồn kho.
3. Chốt giá hiện tại vào `OrderItem`.
4. Tính subtotal, shipping fee, discount và total ở backend.
5. Trừ stock bằng atomic update hoặc row lock.
6. Tạo order với trạng thái `PENDING`.
7. Xóa hoặc đánh dấu cart đã checkout.
8. Tạo payment intent với payment provider.

Không nên tin các field `price`, `subtotal` hoặc `total` do frontend gửi lên.

## 12. Mapping với UI hiện tại

| UI field hiện tại | Backend field đề xuất |
|---|---|
| `id` | `Product.id` hoặc `Product.slug` |
| `name` | `Product.name` |
| `category` | `Category` relation |
| `price` | `ProductVariant.price` |
| `rating` | `Product.ratingAverage` |
| `reviews` | `Product.reviewCount` |
| `description` | `Product.description` |
| `highlight` | `Product.highlight` |
| `badge` | `Product.badge` |
| `colors` | `ProductVariant.colorName` và `colorCode` |
| `accent` | Nên thay bằng `ProductMedia.url` |
| cart quantity | `CartItem.quantity` |
| checkout price | `OrderItem.unitPrice` |
| shipping | `Order.shippingFee` |

## 13. Important implementation notes

### Price

Không dùng JavaScript `number` cho tiền ở database. Dùng `Decimal` và lưu currency rõ ràng.

### Rating

`ratingAverage` và `reviewCount` trong `Product` là dữ liệu denormalized để listing nhanh. Khi review được publish, backend cần cập nhật lại hai field này.

### Stock

Tồn kho nên nằm ở `ProductVariant`, không nằm trực tiếp ở `Product`. Khi checkout cần atomic update hoặc lock để tránh overselling.

### Image

`accent` hiện tại chỉ là Tailwind class mockup, không nên lưu vào database. Product thật nên lưu URL ảnh ở storage/CDN thông qua `ProductMedia`.

### Order snapshot

Order phải giữ lại tên, SKU và giá tại thời điểm mua. Nếu product bị đổi tên hoặc đổi giá, lịch sử order vẫn không bị sai.

## 14. MVP implementation scope

### Phase 1

- `Product`
- `ProductVariant`
- `Category`
- `ProductMedia`
- `LandingPage`
- `LandingPageFeature`
- `LandingPageSection`
- `BlogPost`
- `BlogCategory`
- `BlogAuthor`
- `BlogTag`
- `Contact`
- `Cart`
- `CartItem`
- Product list API
- Product detail API

### Phase 2

- `Order`
- `OrderItem`
- Checkout API
- Payment provider
- Stock reservation

### Phase 3

- `ProductReview`
- Search nâng cao
- Promotion/coupon
- Wishlist
- Product recommendation
- Multi-language product content

## 15. Full PostgreSQL setup

Các câu lệnh dưới đây có thể chạy bằng `psql`. `CREATE DATABASE` cần chạy bằng user có quyền tạo database.

```sql
-- Chạy phần này ở database postgres hoặc bằng user quản trị
CREATE DATABASE author_storefront;

-- Chuyển sang database vừa tạo trong psql
\connect author_storefront

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE "LandingPageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "LandingPageSectionType" AS ENUM (
  'HERO', 'FEATURES', 'TESTIMONIALS', 'PRICING', 'CTA',
  'FAQ', 'IMAGE_TEXT', 'GALLERY', 'CUSTOM'
);
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "BlogContentFormat" AS ENUM ('MARKDOWN', 'RICH_TEXT_JSON');
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'SPAM');
CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING', 'PAID', 'PROCESSING', 'SHIPPED',
  'COMPLETED', 'CANCELLED', 'REFUNDED'
);

CREATE TABLE "Category" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "Product" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  "shortDescription" TEXT,
  description TEXT,
  "categoryId" UUID REFERENCES "Category"(id) ON DELETE SET NULL,
  status "ProductStatus" NOT NULL DEFAULT 'DRAFT',
  badge TEXT,
  highlight TEXT,
  "freeShipping" BOOLEAN NOT NULL DEFAULT FALSE,
  "ratingAverage" NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK ("ratingAverage" BETWEEN 0 AND 5),
  "reviewCount" INTEGER NOT NULL DEFAULT 0 CHECK ("reviewCount" >= 0),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

CREATE TABLE "ProductVariant" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  name TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  "comparePrice" NUMERIC(12,2) CHECK ("comparePrice" IS NULL OR "comparePrice" >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  "colorName" TEXT,
  "colorCode" TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ProductMedia" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  "variantId" UUID REFERENCES "ProductVariant"(id) ON DELETE SET NULL,
  type "MediaType" NOT NULL DEFAULT 'IMAGE',
  url TEXT NOT NULL,
  "altText" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPrimary" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE "ProductReview" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  "userId" UUID,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "LandingPageCategory" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "LandingPage" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  "categoryId" UUID REFERENCES "LandingPageCategory"(id) ON DELETE SET NULL,
  description TEXT,
  status "LandingPageStatus" NOT NULL DEFAULT 'DRAFT',
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "thumbnailUrl" TEXT,
  "publishedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

CREATE TABLE "LandingPageFeature" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "landingPageId" UUID NOT NULL REFERENCES "LandingPage"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "LandingPageSection" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "landingPageId" UUID NOT NULL REFERENCES "LandingPage"(id) ON DELETE CASCADE,
  type "LandingPageSectionType" NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isVisible" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "BlogCategory" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "BlogAuthor" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  "avatarUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "BlogTag" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE "BlogPost" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  "contentFormat" "BlogContentFormat" NOT NULL DEFAULT 'MARKDOWN',
  "categoryId" UUID REFERENCES "BlogCategory"(id) ON DELETE SET NULL,
  "authorId" UUID REFERENCES "BlogAuthor"(id) ON DELETE SET NULL,
  status "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
  "readTime" INTEGER CHECK ("readTime" IS NULL OR "readTime" > 0),
  "coverImageUrl" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "publishedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

CREATE TABLE "BlogPostTag" (
  "postId" UUID NOT NULL REFERENCES "BlogPost"(id) ON DELETE CASCADE,
  "tagId" UUID NOT NULL REFERENCES "BlogTag"(id) ON DELETE CASCADE,
  PRIMARY KEY ("postId", "tagId")
);

CREATE TABLE "Contact" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fullName" TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  status "ContactStatus" NOT NULL DEFAULT 'NEW',
  source TEXT,
  note TEXT,
  "assignedTo" UUID,
  "resolvedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (length(trim("fullName")) >= 2),
  CHECK (length(trim(email)) >= 5),
  CHECK (length(trim(phone)) >= 7)
);

CREATE TABLE "Cart" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID,
  "sessionId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ("userId" IS NOT NULL OR "sessionId" IS NOT NULL)
);

CREATE TABLE "CartItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "cartId" UUID NOT NULL REFERENCES "Cart"(id) ON DELETE CASCADE,
  "variantId" UUID NOT NULL REFERENCES "ProductVariant"(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  UNIQUE ("cartId", "variantId")
);

CREATE TABLE "Order" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderNumber" TEXT NOT NULL UNIQUE,
  "userId" UUID,
  status "OrderStatus" NOT NULL DEFAULT 'PENDING',
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  "shippingFee" NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK ("shippingFee" >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "shippingAddress" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "OrderItem" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
  "variantId" UUID REFERENCES "ProductVariant"(id) ON DELETE SET NULL,
  "productName" TEXT NOT NULL,
  "variantName" TEXT,
  sku TEXT,
  "unitPrice" NUMERIC(12,2) NOT NULL CHECK ("unitPrice" >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  "totalPrice" NUMERIC(12,2) NOT NULL CHECK ("totalPrice" >= 0)
);

CREATE INDEX "Product_status_idx" ON "Product"(status);
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX "ProductVariant_productId_isActive_idx" ON "ProductVariant"("productId", "isActive");
CREATE INDEX "ProductMedia_productId_sortOrder_idx" ON "ProductMedia"("productId", "sortOrder");
CREATE INDEX "ProductReview_productId_isPublished_idx" ON "ProductReview"("productId", "isPublished");
CREATE INDEX "LandingPage_status_idx" ON "LandingPage"(status);
CREATE INDEX "LandingPage_categoryId_idx" ON "LandingPage"("categoryId");
CREATE INDEX "LandingPage_createdAt_idx" ON "LandingPage"("createdAt");
CREATE INDEX "LandingPageFeature_landingPageId_sortOrder_idx" ON "LandingPageFeature"("landingPageId", "sortOrder");
CREATE INDEX "LandingPageSection_landingPageId_sortOrder_idx" ON "LandingPageSection"("landingPageId", "sortOrder");
CREATE INDEX "BlogPost_status_publishedAt_idx" ON "BlogPost"(status, "publishedAt");
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");
CREATE INDEX "BlogPostTag_tagId_idx" ON "BlogPostTag"("tagId");
CREATE INDEX "Contact_status_idx" ON "Contact"(status);
CREATE INDEX "Contact_email_idx" ON "Contact"(email);
CREATE INDEX "Contact_createdAt_idx" ON "Contact"("createdAt");
CREATE INDEX "Cart_userId_idx" ON "Cart"("userId");
CREATE INDEX "Cart_sessionId_idx" ON "Cart"("sessionId");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "Order_status_idx" ON "Order"(status);
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- Prisma tự cập nhật @updatedAt; trigger này giúp raw SQL cũng cập nhật đúng field.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Product_set_updatedAt"
BEFORE UPDATE ON "Product"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "ProductVariant_set_updatedAt"
BEFORE UPDATE ON "ProductVariant"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "ProductReview_set_updatedAt"
BEFORE UPDATE ON "ProductReview"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "LandingPage_set_updatedAt"
BEFORE UPDATE ON "LandingPage"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "BlogPost_set_updatedAt"
BEFORE UPDATE ON "BlogPost"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "Contact_set_updatedAt"
BEFORE UPDATE ON "Contact"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "Cart_set_updatedAt"
BEFORE UPDATE ON "Cart"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "Order_set_updatedAt"
BEFORE UPDATE ON "Order"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

Chạy file bằng lệnh:

```bash
psql -U postgres -f schema.sql
```

Nếu database đã tồn tại, bỏ dòng `CREATE DATABASE author_storefront;` và thay `\connect author_storefront` bằng tên database thực tế.

## 16. Seed data SQL

Các câu lệnh dưới đây dành cho PostgreSQL, tạo khoảng 30 records cho mỗi nhóm dữ liệu chính. Chạy sau khi đã migrate Prisma schema. Các bảng lookup cũng được seed 30 records để dễ test pagination/filter.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 30 product categories
INSERT INTO "Category" (id, slug, name, "isActive")
SELECT gen_random_uuid(), 'category-' || g, 'Category ' || g, true
FROM generate_series(1, 30) AS g;

-- 30 products
INSERT INTO "Product" (
  id, slug, name, "shortDescription", description, "categoryId", status,
  badge, highlight, "freeShipping", "ratingAverage", "reviewCount"
)
SELECT
  gen_random_uuid(),
  'product-' || g,
  'Demo Product ' || g,
  'Short description for demo product ' || g,
  'Detailed description for demo product ' || g,
  (SELECT id FROM "Category" WHERE slug = 'category-' || g),
  'ACTIVE',
  CASE WHEN g % 3 = 0 THEN 'Popular' WHEN g % 3 = 1 THEN 'New' ELSE 'Featured' END,
  CASE WHEN g % 2 = 0 THEN 'Best seller' ELSE 'Eco pick' END,
  g % 2 = 0,
  (4 + (g % 10) / 10.0)::numeric(3,2),
  g * 11
FROM generate_series(1, 30) AS g;

-- 30 product variants, one variant per product
INSERT INTO "ProductVariant" (
  id, "productId", sku, name, price, currency, "colorName", "colorCode", stock, "isDefault", "isActive"
)
SELECT
  gen_random_uuid(), p.id, 'SKU-' || lpad(g::text, 4, '0'),
  'Default variant', (20 + g * 3)::numeric(12,2), 'USD',
  CASE WHEN g % 3 = 0 THEN 'Onyx' WHEN g % 3 = 1 THEN 'Sand' ELSE 'Ivory' END,
  CASE WHEN g % 3 = 0 THEN '#111827' WHEN g % 3 = 1 THEN '#D8C8B0' ELSE '#FFFFF0' END,
  10 + g, true, true
FROM generate_series(1, 30) AS g
JOIN "Product" p ON p.slug = 'product-' || g;

-- 30 product media records
INSERT INTO "ProductMedia" (id, "productId", type, url, "altText", "sortOrder", "isPrimary")
SELECT gen_random_uuid(), id, 'IMAGE',
  'https://cdn.example.com/products/product-' || g || '.webp',
  'Demo Product ' || g, 0, true
FROM generate_series(1, 30) AS g
JOIN "Product" p ON p.slug = 'product-' || g;

-- 30 landing page categories
INSERT INTO "LandingPageCategory" (id, slug, name, "isActive")
SELECT gen_random_uuid(), 'landing-category-' || g, 'Landing Category ' || g, true
FROM generate_series(1, 30) AS g;

-- 30 landing pages
INSERT INTO "LandingPage" (
  id, slug, title, "categoryId", description, status, price, currency,
  "metaTitle", "metaDescription", "thumbnailUrl", "publishedAt"
)
SELECT
  gen_random_uuid(),
  'landing-page-' || g,
  'Demo Landing Page ' || g,
  (SELECT id FROM "LandingPageCategory" WHERE slug = 'landing-category-' || g),
  'A conversion-focused landing page template for demo number ' || g,
  'PUBLISHED', (100 + g * 10)::numeric(12,2), 'USD',
  'Demo Landing Page ' || g,
  'SEO description for demo landing page ' || g,
  'https://cdn.example.com/landing/landing-page-' || g || '.webp',
  now() - (g || ' days')::interval
FROM generate_series(1, 30) AS g;

-- 30 landing page features
INSERT INTO "LandingPageFeature" (id, "landingPageId", content, "sortOrder")
SELECT gen_random_uuid(), id, 'Conversion-ready feature ' || g, 0
FROM generate_series(1, 30) AS g
JOIN "LandingPage" p ON p.slug = 'landing-page-' || g;

-- 30 landing page sections
INSERT INTO "LandingPageSection" (id, "landingPageId", type, title, content, "sortOrder", "isVisible")
SELECT
  gen_random_uuid(), id, 'HERO', 'Hero section ' || g,
  jsonb_build_object(
    'eyebrow', 'Demo template',
    'heading', 'Build a premium storefront ' || g,
    'description', 'Hero content for landing page ' || g,
    'cta', jsonb_build_object('label', 'Get started', 'href', '/checkout/landing-page-' || g)
  ), 0, true
FROM generate_series(1, 30) AS g
JOIN "LandingPage" p ON p.slug = 'landing-page-' || g;

-- 30 blog categories
INSERT INTO "BlogCategory" (id, slug, name, description, "isActive")
SELECT gen_random_uuid(), 'blog-category-' || g, 'Blog Category ' || g,
  'Description for blog category ' || g, true
FROM generate_series(1, 30) AS g;

-- 30 blog authors
INSERT INTO "BlogAuthor" (id, name, slug, bio, "isActive")
SELECT gen_random_uuid(), 'Author ' || g, 'author-' || g,
  'Short bio for author ' || g, true
FROM generate_series(1, 30) AS g;

-- 30 blog tags
INSERT INTO "BlogTag" (id, slug, name)
SELECT gen_random_uuid(), 'tag-' || g, 'Tag ' || g
FROM generate_series(1, 30) AS g;

-- 30 blog posts
INSERT INTO "BlogPost" (
  id, slug, title, excerpt, content, "contentFormat", "categoryId", "authorId",
  status, "readTime", "coverImageUrl", "metaTitle", "metaDescription", "publishedAt"
)
SELECT
  gen_random_uuid(),
  'blog-post-' || g,
  'Demo Blog Post ' || g,
  'Excerpt for demo blog post ' || g,
  '# Demo Blog Post ' || g || E'\n\nThis is demo Markdown content for blog post ' || g || '.',
  'MARKDOWN',
  (SELECT id FROM "BlogCategory" WHERE slug = 'blog-category-' || g),
  (SELECT id FROM "BlogAuthor" WHERE slug = 'author-' || g),
  'PUBLISHED', 5 + (g % 10),
  'https://cdn.example.com/blog/blog-post-' || g || '.webp',
  'Demo Blog Post ' || g,
  'SEO description for demo blog post ' || g,
  now() - (g || ' days')::interval
FROM generate_series(1, 30) AS g;

-- Link each blog post to one tag
INSERT INTO "BlogPostTag" ("postId", "tagId")
SELECT p.id, t.id
FROM generate_series(1, 30) AS g
JOIN "BlogPost" p ON p.slug = 'blog-post-' || g
JOIN "BlogTag" t ON t.slug = 'tag-' || g;

-- 30 contacts based on the homepage contact form
INSERT INTO "Contact" (
  id, "fullName", email, phone, message, status, source, note
)
SELECT
  gen_random_uuid(),
  'Demo Contact ' || g,
  'contact' || g || '@example.com',
  '+8490000' || lpad(g::text, 3, '0'),
  'I would like to learn more about your products. Contact #' || g,
  CASE WHEN g % 5 = 0 THEN 'RESOLVED' WHEN g % 4 = 0 THEN 'IN_PROGRESS' ELSE 'NEW' END,
  'homepage-contact-form',
  CASE WHEN g % 5 = 0 THEN 'Follow-up completed' ELSE NULL END
FROM generate_series(1, 30) AS g;
```

Lưu ý khi chạy seed nhiều lần: các lệnh trên sẽ tạo thêm record mới. Nếu cần chạy lặp lại, nên thêm `TRUNCATE ... CASCADE` cho môi trường local hoặc dùng `upsert` theo `slug`/`email` trong seed script.

## 17. Recommended first endpoint list

```text
GET    /api/products
GET    /api/products/:slug
GET    /api/categories
GET    /api/landing-pages
GET    /api/landing-pages/:slug
GET    /api/blogs
GET    /api/blogs/:slug
GET    /api/blog-categories
POST   /api/contacts
GET    /api/contacts
PATCH  /api/contacts/:id

GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:itemId
DELETE /api/cart/items/:itemId

POST   /api/orders
GET    /api/orders/:orderNumber
POST   /api/orders/:orderNumber/payment
```

Với UI hiện tại, schema tối thiểu nên bắt đầu từ `Product`, `ProductVariant`, `Category`, `ProductMedia`, `LandingPage`, `LandingPageFeature`, `LandingPageSection`, `BlogPost`, `BlogCategory`, `BlogAuthor`, `BlogTag`, `Contact`, `Cart`, `CartItem`, `Order` và `OrderItem`. Review, coupon và recommendation có thể bổ sung sau mà không cần thay đổi cấu trúc cốt lõi.
