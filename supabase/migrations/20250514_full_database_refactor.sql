-- ⚡ Bolt: Refatoração Completa do Banco de Dados
-- Garante que todas as tabelas e colunas necessárias para o funcionamento do app existam.

-- 1. TABELA: Configurações do Tenant (Loja)
CREATE TABLE IF NOT EXISTS public.tenant_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name text NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#3b82f6',
    secondary_color text DEFAULT '#1e3a8a',
    whatsapp_number text,
    hero_title text,
    hero_subtitle text,
    hero_image_url text,
    address text,
    instagram_url text,
    facebook_url text,
    delivery_fee numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. TABELA: Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. TABELA: Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    price numeric NOT NULL DEFAULT 0,
    promo_price numeric,
    image_url text,
    in_stock boolean DEFAULT true,
    shipping_fee numeric DEFAULT 0,
    attributes jsonb DEFAULT '[]', -- Armazena tamanhos/variações
    colors jsonb DEFAULT '[]',     -- Armazena cores
    featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. TABELA: Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    delivery_address text,
    payment_method text,
    total_amount numeric NOT NULL DEFAULT 0,
    status text DEFAULT 'pending', -- pending, confirmed, shipped, cancelled
    created_at timestamp with time zone DEFAULT now()
);

-- 5. TABELA: Itens do Pedido (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    quantity integer NOT NULL DEFAULT 1,
    unit_price numeric NOT NULL DEFAULT 0,
    selected_attributes jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- 6. TABELA: Banners (Carrossel/Hero)
CREATE TABLE IF NOT EXISTS public.banners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text,
    subtitle text,
    image_url text NOT NULL,
    link_url text,
    position integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- ⚡ ÍNDICES DE PERFORMANCE (Bolt Optimization)

-- Chaves Estrangeiras
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Filtros e Ordenação
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products(in_stock, featured) WHERE in_stock = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_banners_active_position ON public.banners(active, position) WHERE active = true;

-- Inserir Tenant padrão se não existir (para evitar que o app quebre no primeiro boot)
INSERT INTO public.tenant_settings (store_name, primary_color, secondary_color)
SELECT 'Minha Loja', '#3b82f6', '#1e3a8a'
WHERE NOT EXISTS (SELECT 1 FROM public.tenant_settings LIMIT 1);
