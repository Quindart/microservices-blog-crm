-- Author storefront database reset, schema and local seed.
-- Target: postgres_crm on localhost:5433, database author_storefront.
-- Run with:
--   PGPASSWORD=password_b psql -h localhost -p 5433 -U user_b -d author_storefront -f database/seed.sql

BEGIN;

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    short_description TEXT,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    badge TEXT,
    highlight TEXT,
    free_shipping BOOLEAN NOT NULL DEFAULT FALSE,
    rating_average DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (rating_average BETWEEN 0 AND 5),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT NOT NULL UNIQUE,
    name TEXT,
    price DOUBLE PRECISION NOT NULL CHECK (price >= 0),
    compare_price DOUBLE PRECISION CHECK (compare_price IS NULL OR compare_price >= 0),
    currency TEXT NOT NULL DEFAULT 'VND',
    color_name TEXT,
    color_code TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_media (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'IMAGE',
    url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE product_reviews (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    content TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE landing_page_categories (
    id UUID PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE landing_pages (
    id UUID PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category_id UUID REFERENCES landing_page_categories(id) ON DELETE SET NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    price DOUBLE PRECISION NOT NULL CHECK (price >= 0),
    currency TEXT NOT NULL DEFAULT 'VND',
    meta_title TEXT,
    meta_description TEXT,
    thumbnail_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE landing_page_features (
    id UUID PRIMARY KEY,
    landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE landing_page_sections (
    id UUID PRIMARY KEY,
    landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    content JSONB NOT NULL DEFAULT '{}'::JSONB,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE blog_categories (
    id UUID PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE blog_authors (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE blog_tags (
    id UUID PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE blog_posts (
    id UUID PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    content_format TEXT NOT NULL DEFAULT 'MARKDOWN',
    category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES blog_authors(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    read_time INTEGER CHECK (read_time IS NULL OR read_time > 0),
    cover_image_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE blog_post_tags (
    post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'NEW',
    source TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE carts (
    id UUID PRIMARY KEY,
    user_id UUID,
    session_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY,
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    UNIQUE (cart_id, variant_id)
);

CREATE TABLE store_orders (
    id UUID PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID,
    status TEXT NOT NULL DEFAULT 'PENDING',
    subtotal DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    shipping_fee DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    discount DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total DOUBLE PRECISION NOT NULL DEFAULT 0 CHECK (total >= 0),
    currency TEXT NOT NULL DEFAULT 'VND',
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE store_order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variant_name TEXT,
    sku TEXT,
    unit_price DOUBLE PRECISION NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price DOUBLE PRECISION NOT NULL CHECK (total_price >= 0)
);

CREATE INDEX products_status_idx ON products(status);
CREATE INDEX products_category_id_idx ON products(category_id);
CREATE INDEX products_created_at_idx ON products(created_at);
CREATE INDEX product_variants_product_id_idx ON product_variants(product_id);
CREATE INDEX product_variants_product_id_active_idx ON product_variants(product_id, is_active);
CREATE INDEX product_media_product_id_sort_order_idx ON product_media(product_id, sort_order);
CREATE INDEX landing_pages_status_idx ON landing_pages(status);
CREATE INDEX landing_pages_category_id_idx ON landing_pages(category_id);
CREATE INDEX landing_pages_created_at_idx ON landing_pages(created_at);
CREATE INDEX landing_page_features_page_sort_idx ON landing_page_features(landing_page_id, sort_order);
CREATE INDEX blog_posts_status_published_at_idx ON blog_posts(status, published_at);
CREATE INDEX blog_posts_category_id_idx ON blog_posts(category_id);
CREATE INDEX blog_posts_author_id_idx ON blog_posts(author_id);
CREATE INDEX contacts_status_idx ON contacts(status);
CREATE INDEX contacts_created_at_idx ON contacts(created_at);
CREATE INDEX carts_session_id_idx ON carts(session_id);
CREATE INDEX store_orders_status_idx ON store_orders(status);
CREATE INDEX store_orders_created_at_idx ON store_orders(created_at);
CREATE INDEX store_order_items_order_id_idx ON store_order_items(order_id);

INSERT INTO categories (id, slug, name, description) VALUES
('10000000-0000-0000-0000-000000000001', 'thuong-hieu', 'Thương hiệu', 'Website kể câu chuyện và định vị thương hiệu.'),
('10000000-0000-0000-0000-000000000002', 'ban-hang', 'Bán hàng', 'Trải nghiệm bán hàng và giới thiệu bộ sưu tập.'),
('10000000-0000-0000-0000-000000000003', 'dich-vu', 'Dịch vụ', 'Website tạo khách hàng tiềm năng.'),
('10000000-0000-0000-0000-000000000004', 'cong-nghe', 'Công nghệ', 'Website cho sản phẩm SaaS và công nghệ.');

INSERT INTO products (id, slug, name, short_description, description, category_id, status, badge, highlight, free_shipping, rating_average, review_count) VALUES
('20000000-0000-0000-0000-000000000001', 'aurora-brand', 'Landing page thương hiệu Aurora', 'Landing page cao cấp cho thương hiệu.', 'Giao diện thanh lịch cho thương hiệu hiện đại.', '10000000-0000-0000-0000-000000000001', 'ACTIVE', 'Nổi bật', 'Bán chạy nhất', TRUE, 4.9, 184),
('20000000-0000-0000-0000-000000000002', 'velvet-commerce', 'Website nội thất Velvet', 'Website bán hàng tinh tế.', 'Bố cục ưu tiên hình ảnh và bộ sưu tập.', '10000000-0000-0000-0000-000000000002', 'ACTIVE', 'Phổ biến', 'Được nhiều khách chọn', TRUE, 4.8, 94),
('20000000-0000-0000-0000-000000000003', 'atlas-product', 'Landing page sản phẩm Atlas', 'Landing page tập trung chuyển đổi.', 'Trình bày vấn đề, giải pháp và CTA.', '10000000-0000-0000-0000-000000000001', 'ACTIVE', 'Tối ưu chuyển đổi', 'Lựa chọn hiệu quả', FALSE, 4.7, 320),
('20000000-0000-0000-0000-000000000004', 'milo-services', 'Website dịch vụ Milo', 'Website giới thiệu dịch vụ.', 'Thiết kế tạo dựng niềm tin và nhận tư vấn.', '10000000-0000-0000-0000-000000000003', 'ACTIVE', 'Đánh giá cao', 'Cao cấp', FALSE, 4.9, 121),
('20000000-0000-0000-0000-000000000005', 'nova-saas', 'Website SaaS Nova', 'Website SaaS với bảng giá và demo.', 'Nền tảng nội dung mở rộng cho SaaS.', '10000000-0000-0000-0000-000000000004', 'ACTIVE', 'Biên tập viên chọn', 'Được yêu thích', TRUE, 4.8, 208),
('20000000-0000-0000-0000-000000000006', 'harbor-portal', 'Cổng thông tin Harbor', 'Cổng thông tin có tìm kiếm nhanh.', 'Giải pháp cho tổ chức có nhiều nội dung.', '10000000-0000-0000-0000-000000000004', 'ACTIVE', 'Mới', 'Giải pháp toàn diện', TRUE, 4.6, 77);

INSERT INTO product_variants (id, product_id, sku, name, price, compare_price, currency, color_name, color_code, stock, is_default, is_active) VALUES
('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'AURORA-BASE', 'Cơ bản', 1290000, 1590000, 'VND', 'Đá tự nhiên', '#E7E5E4', 20, TRUE, TRUE),
('21000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'AURORA-PRO', 'Cao cấp', 2190000, 2590000, 'VND', 'Đen than', '#18181B', 12, FALSE, TRUE),
('21000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'VELVET-MVP', 'MVP', 1690000, NULL, 'VND', 'Tím nhạt', '#DDD6FE', 18, TRUE, TRUE),
('21000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'VELVET-GROW', 'Tăng trưởng', 2490000, NULL, 'VND', 'Tím đậm', '#7C3AED', 9, FALSE, TRUE),
('21000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'ATLAS-ONE', 'Một trang', 1090000, 1390000, 'VND', 'Xanh biển', '#BAE6FD', 30, TRUE, TRUE),
('21000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', 'MILO-INTRO', 'Giới thiệu', 1590000, NULL, 'VND', 'Xám bạc', '#F1F5F9', 15, TRUE, TRUE),
('21000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', 'NOVA-LANDING', 'Landing page', 1890000, 2290000, 'VND', 'Hồng tím', '#F5D0FE', 14, TRUE, TRUE),
('21000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000006', 'HARBOR-CONTENT', 'Nội dung', 1990000, NULL, 'VND', 'Cam ấm', '#FED7AA', 11, TRUE, TRUE);

INSERT INTO product_media (id, product_id, variant_id, type, url, alt_text, sort_order, is_primary) VALUES
('22000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'IMAGE', '/images/products/aurora-brand.webp', 'Landing page thương hiệu Aurora', 0, TRUE),
('22000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000003', 'IMAGE', '/images/products/velvet-commerce.webp', 'Website nội thất Velvet', 0, TRUE),
('22000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000005', 'IMAGE', '/images/products/atlas-product.webp', 'Landing page sản phẩm Atlas', 0, TRUE),
('22000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '21000000-0000-0000-0000-000000000006', 'IMAGE', '/images/products/milo-services.webp', 'Website dịch vụ Milo', 0, TRUE),
('22000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', '21000000-0000-0000-0000-000000000007', 'IMAGE', '/images/products/nova-saas.webp', 'Website SaaS Nova', 0, TRUE),
('22000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', '21000000-0000-0000-0000-000000000008', 'IMAGE', '/images/products/harbor-portal.webp', 'Cổng thông tin Harbor', 0, TRUE);

INSERT INTO landing_page_categories (id, slug, name) VALUES
('30000000-0000-0000-0000-000000000001', 'thuong-hieu', 'Thương hiệu'),
('30000000-0000-0000-0000-000000000002', 'cong-nghe', 'Công nghệ'),
('30000000-0000-0000-0000-000000000003', 'giao-duc', 'Giáo dục');

INSERT INTO landing_pages (id, slug, title, category_id, description, status, price, currency, meta_title, meta_description, thumbnail_url, published_at) VALUES
('31000000-0000-0000-0000-000000000001', 'smart-home', 'Smart Home', '30000000-0000-0000-0000-000000000002', 'Landing page cho hệ sinh thái nhà thông minh.', 'PUBLISHED', 1890000, 'VND', 'Smart Home - Landing page', 'Giao diện cho thương hiệu nhà thông minh.', '/images/landing/smart-home.webp', NOW() - INTERVAL '3 days'),
('31000000-0000-0000-0000-000000000002', 'financial-trading', 'Giao dịch tài chính', '30000000-0000-0000-0000-000000000002', 'Landing page cho nền tảng giao dịch tài chính.', 'PUBLISHED', 2190000, 'VND', 'Financial Trading - Landing page', 'Giao diện cho nền tảng tài chính.', '/images/landing/financial-trading.webp', NOW() - INTERVAL '2 days'),
('31000000-0000-0000-0000-000000000003', 'education', 'Giáo dục', '30000000-0000-0000-0000-000000000003', 'Landing page cho nền tảng giáo dục.', 'PUBLISHED', 1690000, 'VND', 'Education - Landing page', 'Giao diện cho sản phẩm giáo dục.', '/images/landing/education.webp', NOW() - INTERVAL '1 day');

INSERT INTO landing_page_features (id, landing_page_id, content, sort_order) VALUES
('32000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', 'Trình bày hệ sinh thái thiết bị', 0),
('32000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000001', 'Kể chuyện về trải nghiệm sống', 1),
('32000000-0000-0000-0000-000000000003', '31000000-0000-0000-0000-000000000002', 'Trình bày dữ liệu dễ hiểu', 0),
('32000000-0000-0000-0000-000000000004', '31000000-0000-0000-0000-000000000002', 'Luồng bắt đầu giao dịch', 1),
('32000000-0000-0000-0000-000000000005', '31000000-0000-0000-0000-000000000003', 'Giới thiệu chương trình học', 0),
('32000000-0000-0000-0000-000000000006', '31000000-0000-0000-0000-000000000003', 'Lộ trình và đội ngũ giảng dạy', 1);

INSERT INTO blog_categories (id, slug, name, description) VALUES
('40000000-0000-0000-0000-000000000001', 'thiet-ke', 'Thiết kế', 'Thực hành thiết kế sản phẩm số.'),
('40000000-0000-0000-0000-000000000002', 'thuong-mai-dien-tu', 'Thương mại điện tử', 'Tối ưu trải nghiệm mua sắm.'),
('40000000-0000-0000-0000-000000000003', 'lap-trinh', 'Lập trình', 'Kỹ thuật xây dựng website.');

INSERT INTO blog_authors (id, name, slug, bio, avatar_url) VALUES
('41000000-0000-0000-0000-000000000001', 'Alex Chen', 'alex-chen', 'Product designer tập trung vào trải nghiệm số.', '/images/authors/alex-chen.webp'),
('41000000-0000-0000-0000-000000000002', 'Sarah Mitchell', 'sarah-mitchell', 'Content strategist cho thương hiệu tăng trưởng.', '/images/authors/sarah-mitchell.webp'),
('41000000-0000-0000-0000-000000000003', 'Jordan Kumar', 'jordan-kumar', 'Frontend engineer yêu thích hiệu năng.', '/images/authors/jordan-kumar.webp');

INSERT INTO blog_tags (id, slug, name) VALUES
('42000000-0000-0000-0000-000000000001', 'thiet-ke', 'thiết kế'),
('42000000-0000-0000-0000-000000000002', 'chuyen-doi', 'chuyển đổi'),
('42000000-0000-0000-0000-000000000003', 'nextjs', 'Next.js'),
('42000000-0000-0000-0000-000000000004', 'hieu-nang', 'hiệu năng');

INSERT INTO blog_posts (id, slug, title, excerpt, content, content_format, category_id, author_id, status, read_time, cover_image_url, published_at) VALUES
('43000000-0000-0000-0000-000000000001', 'web-design-trends-2025', 'Xu hướng thiết kế web 2025', 'Khi tối giản gặp chuyển động tinh tế.', '# Xu hướng thiết kế web 2025', 'MARKDOWN', '40000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000001', 'PUBLISHED', 8, '/images/blog/design-trends-2025.webp', NOW() - INTERVAL '5 days'),
('43000000-0000-0000-0000-000000000002', 'ecommerce-checkout-optimization', 'Tối ưu thanh toán thương mại điện tử', 'Giảm bỏ giỏ hàng bằng quy trình tinh gọn.', '# Tối ưu checkout', 'MARKDOWN', '40000000-0000-0000-0000-000000000002', '41000000-0000-0000-0000-000000000002', 'PUBLISHED', 12, '/images/blog/ecommerce-checkout.webp', NOW() - INTERVAL '8 days'),
('43000000-0000-0000-0000-000000000003', 'animation-performance-nextjs', 'Tối ưu animation với Next.js', 'Animation mượt mà mà vẫn nhanh.', '# Animation và hiệu năng', 'MARKDOWN', '40000000-0000-0000-0000-000000000003', '41000000-0000-0000-0000-000000000003', 'PUBLISHED', 10, '/images/blog/animation-performance.webp', NOW() - INTERVAL '11 days'),
('43000000-0000-0000-0000-000000000004', 'color-psychology-branding', 'Tâm lý màu sắc trong thương hiệu', 'Kết hợp màu sắc để định hình nhận thức.', '# Màu sắc và thương hiệu', 'MARKDOWN', '40000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000001', 'PUBLISHED', 9, '/images/blog/color-psychology.webp', NOW() - INTERVAL '15 days'),
('43000000-0000-0000-0000-000000000005', 'responsive-typography-guide', 'Hướng dẫn typography responsive', 'Typography linh hoạt trên mọi thiết bị.', '# Typography responsive', 'MARKDOWN', '40000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000003', 'PUBLISHED', 11, '/images/blog/responsive-typography.webp', NOW() - INTERVAL '19 days'),
('43000000-0000-0000-0000-000000000006', 'personalization-ecommerce', 'Cá nhân hóa thương mại điện tử', 'Cá nhân hóa tạo giá trị thực cho khách hàng.', '# Cá nhân hóa', 'MARKDOWN', '40000000-0000-0000-0000-000000000002', '41000000-0000-0000-0000-000000000002', 'PUBLISHED', 13, '/images/blog/personalization.webp', NOW() - INTERVAL '23 days');

INSERT INTO blog_post_tags (post_id, tag_id) VALUES
('43000000-0000-0000-0000-000000000001', '42000000-0000-0000-0000-000000000001'),
('43000000-0000-0000-0000-000000000002', '42000000-0000-0000-0000-000000000002'),
('43000000-0000-0000-0000-000000000003', '42000000-0000-0000-0000-000000000003'),
('43000000-0000-0000-0000-000000000003', '42000000-0000-0000-0000-000000000004'),
('43000000-0000-0000-0000-000000000004', '42000000-0000-0000-0000-000000000001'),
('43000000-0000-0000-0000-000000000005', '42000000-0000-0000-0000-000000000001'),
('43000000-0000-0000-0000-000000000006', '42000000-0000-0000-0000-000000000002');

INSERT INTO contacts (id, full_name, email, phone, message, status, source, note) VALUES
('50000000-0000-0000-0000-000000000001', 'Nguyễn Minh Anh', 'minh.anh@example.com', '+84901234567', 'Tư vấn landing page cho thương hiệu mới.', 'NEW', 'homepage-contact-form', NULL),
('50000000-0000-0000-0000-000000000002', 'Trần Gia Huy', 'gia.huy@example.com', '+84907654321', 'Báo giá website bán hàng.', 'IN_PROGRESS', 'homepage-contact-form', 'Đã gửi portfolio'),
('50000000-0000-0000-0000-000000000003', 'Lê Khánh Linh', 'khanh.linh@example.com', '+84908881234', 'Quan tâm đến gói SaaS Nova.', 'RESOLVED', 'product-detail', 'Đã hoàn tất tư vấn');

COMMIT;
