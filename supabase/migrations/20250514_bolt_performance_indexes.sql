-- ⚡ Bolt: Database Performance Optimization
-- Otimização de performance via índices para acelerar buscas e joins comuns.

-- 1. Índices para Chaves Estrangeiras (Foreign Keys)
-- Melhora performance de JOINs e deleções em cascata.
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 2. Índices para Filtros e Ordenação Frequentes
-- Acelera a vitrine (Home) e o Dashboard Admin.

-- Busca por produtos ativos e em destaque (Vitrine)
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products(active, featured) WHERE active = true;

-- Ordenação por data de criação (Listagens)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Busca por slug de categoria (Filtros de URL/Navegação)
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Filtro de banners ativos e posição (Carrossel/Hero)
CREATE INDEX IF NOT EXISTS idx_banners_active_position ON public.banners(active, position) WHERE active = true;
