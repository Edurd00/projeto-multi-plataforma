-- ==========================================
-- E-COMMERCE MULTI-NICHO - DATABASE SCHEMA
-- Compatible with Supabase (PostgreSQL)
-- ==========================================

-- 1. EXTENSIONS (Ensure UUID support)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: tenant_settings
-- Stores global store identity and configuration
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT NOT NULL,
    logo_url TEXT,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_image_url TEXT,
    whatsapp_number TEXT NOT NULL,
    instagram_url TEXT,
    facebook_url TEXT,
    address TEXT,
    primary_color TEXT DEFAULT '#3b82f6',
    secondary_color TEXT DEFAULT '#1e3a8a',
    delivery_fee NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLE: categories
-- Product categorization for filtering
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLE: products
-- Catalog items
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    promo_price NUMERIC(10,2),
    image_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    attributes JSONB DEFAULT '[]'::jsonb, -- Sizes like ["P", "M", "G"]
    colors JSONB DEFAULT '[]'::jsonb,     -- Colors like ["Preto", "Branco"]
    shipping_fee NUMERIC(10,2) DEFAULT 0.00,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLE: orders
-- Header information for customer orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT,
    payment_method TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLE: order_items
-- Line items for each order
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    selected_attributes JSONB DEFAULT '{}'::jsonb, -- e.g., {"size": "G", "color": "Preto"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- SUPABASE STORAGE CONFIGURATION (Notes)
-- ==========================================
-- 1. Create a public bucket named 'images' in Supabase Storage.
-- 2. Add an RLS policy to allow 'public' to SELECT images.
-- 3. Add an RLS policy to allow 'authenticated' users to INSERT/UPDATE/DELETE.

-- ==========================================
-- SECURITY (RLS)
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read access
-- Security Policies (Strict RLS)

-- [TENANT SETTINGS]
-- Anonymous: Read only
CREATE POLICY "Public Read Tenant" ON tenant_settings FOR SELECT USING (true);
-- Authenticated: Full access
CREATE POLICY "Admin Manage Tenant" ON tenant_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- [CATEGORIES]
-- Anonymous: Read only
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
-- Authenticated: Full access
CREATE POLICY "Admin Manage Categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- [PRODUCTS]
-- Anonymous: Read only
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
-- Authenticated: Full access
CREATE POLICY "Admin Manage Products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- [ORDERS]
-- Anonymous: Insert only (Checkout)
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
-- Authenticated: Read & Update
CREATE POLICY "Admin Manage Orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin Update Orders" ON orders FOR UPDATE TO authenticated USING (true);

-- [ORDER ITEMS]
-- Anonymous: Insert only
CREATE POLICY "Public Insert Order Items" ON order_items FOR INSERT WITH CHECK (true);
-- Authenticated: Read
CREATE POLICY "Admin Read Order Items" ON order_items FOR SELECT TO authenticated USING (true);
