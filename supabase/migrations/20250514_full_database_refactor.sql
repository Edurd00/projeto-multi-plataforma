-- ⚡ Bolt: Refatoração Completa e Resiliente do Banco de Dados
-- Garante que todas as tabelas e colunas necessárias existam, ajustando schemas antigos.

-- 1. TABELA: Configurações do Tenant (Loja)
CREATE TABLE IF NOT EXISTS public.tenant_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name text NOT NULL DEFAULT 'Minha Loja',
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

-- 3. TABELA: Produtos (com tratamento para schema antigo)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        CREATE TABLE public.products (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
            title text NOT NULL,
            description text,
            price numeric NOT NULL DEFAULT 0,
            promo_price numeric,
            image_url text,
            in_stock boolean DEFAULT true,
            shipping_fee numeric DEFAULT 0,
            attributes jsonb DEFAULT '[]',
            colors jsonb DEFAULT '[]',
            featured boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now()
        );
    ELSE
        -- Ajusta colunas da tabela existente
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='products' AND column_name='title') THEN
            ALTER TABLE public.products RENAME COLUMN name TO title;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='products' AND column_name='in_stock') THEN
            -- Se existe 'active', renomeia para 'in_stock'. Se não, cria 'in_stock'.
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='products' AND column_name='active') THEN
                ALTER TABLE public.products RENAME COLUMN active TO in_stock;
            ELSE
                ALTER TABLE public.products ADD COLUMN in_stock boolean DEFAULT true;
            END IF;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='products' AND column_name='promo_price') THEN
            ALTER TABLE public.products ADD COLUMN promo_price numeric;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='products' AND column_name='shipping_fee') THEN
            ALTER TABLE public.products ADD COLUMN shipping_fee numeric DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='products' AND column_name='attributes') THEN
            ALTER TABLE public.products ADD COLUMN attributes jsonb DEFAULT '[]';
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name='products' AND column_name='colors') THEN
            ALTER TABLE public.products ADD COLUMN colors jsonb DEFAULT '[]';
        END IF;
    END IF;
END $$;

-- 4. TABELA: Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    delivery_address text,
    payment_method text,
    total_amount numeric NOT NULL DEFAULT 0,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- 5. TABELA: Itens do Pedido (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid, -- Mantido sem FK rígida para UUID caso products ainda use bigint
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

-- ⚡ ÍNDICES DE PERFORMANCE (Bolt Optimization) Resilientes

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Índice parcial condicional à existência da coluna (que garantimos acima)
CREATE INDEX IF NOT EXISTS idx_products_in_stock_featured ON public.products(in_stock, featured) WHERE in_stock = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Inserir Tenant padrão se não existir
INSERT INTO public.tenant_settings (store_name, primary_color, secondary_color)
SELECT 'Minha Loja', '#3b82f6', '#1e3a8a'
WHERE NOT EXISTS (SELECT 1 FROM public.tenant_settings LIMIT 1);
