export const initialCategories = [
  { id: 'cat-1', name: 'Roupas', slug: 'roupas' },
  { id: 'cat-2', name: 'Calçados', slug: 'calcados' },
  { id: 'cat-3', name: 'Acessórios', slug: 'acessorios' },
  { id: 'cat-4', name: 'Eletrônicos', slug: 'eletronicos' }
];

export const initialTenantSettings = {
  id: 'tenant-1',
  store_name: 'Minha Loja Demo',
  primary_color: '#3B82F6',
  secondary_color: '#1D4ED8',
  logo_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
  phone: '11999999999',
  is_open: true
};

export const initialBanners = [
  {
    id: 'ban-1',
    title: 'Nova Coleção de Verão',
    subtitle: 'Confira as últimas tendências com frete grátis!',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    link: '#',
    is_active: true
  }
];

export const initialPromotions = [
  {
    id: 'promo-1',
    title: 'Oferta Especial',
    discount_percentage: 20,
    banner_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
    is_active: true
  }
];

export const initialProducts = [
  {
    id: 'prod-1',
    title: 'Camiseta Premium Algodão',
    description: 'Camiseta 100% algodão penteado, toque macio e excelente caimento.',
    price: 89.90,
    promo_price: 69.90,
    category_id: 'cat-1',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    is_featured: true,
    in_stock: true,
    stock: 15,
    is_active: true,
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Branco', 'Azul'],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'prod-2',
    title: 'Tênis Esportivo Runner Pro',
    description: 'Tênis de alta performance para corridas e treinos com amortecimento em gel.',
    price: 299.90,
    promo_price: null,
    category_id: 'cat-2',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    is_featured: true,
    in_stock: true,
    stock: 8,
    is_active: true,
    sizes: ['38', '39', '40', '41', '42'],
    colors: ['Vermelho', 'Preto'],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'prod-3',
    title: 'Relógio Smartwatch Urban',
    description: 'Monitoramento de frequência cardíaca, contador de passos e notificações no pulso.',
    price: 199.90,
    promo_price: 159.90,
    category_id: 'cat-4',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    is_featured: false,
    in_stock: true,
    stock: 2,
    is_active: true,
    sizes: [],
    colors: ['Preto', 'Prata'],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'prod-4',
    title: 'Mochila Urbana Impermeável',
    description: 'Mochila com compartimento para notebook de até 15.6 polegadas e entrada USB externa.',
    price: 149.90,
    promo_price: null,
    category_id: 'cat-3',
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    is_featured: true,
    in_stock: true,
    stock: 20,
    is_active: true,
    sizes: [],
    colors: ['Cinza', 'Preto'],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'prod-5',
    title: 'Fone de Ouvido Bluetooth Sem Fio',
    description: 'Cancelamento de ruído ativo, bateria com duração de até 24 horas e som HD.',
    price: 179.90,
    promo_price: 139.90,
    category_id: 'cat-4',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    is_featured: true,
    in_stock: true,
    stock: 12,
    is_active: true,
    sizes: [],
    colors: ['Preto'],
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const initialOrders = [
  {
    id: 'ord-1001',
    customer_name: 'Maria Silva',
    customer_phone: '11988887777',
    customer_address: 'Rua das Flores, 123 - São Paulo/SP',
    payment_method: 'Pix',
    delivery_type: 'Entrega',
    status: 'pending',
    total: 159.80,
    items: [
      { product_id: 'prod-1', title: 'Camiseta Premium Algodão', quantity: 1, unit_price: 69.90, options: { size: 'M', color: 'Preto' } },
      { product_id: 'prod-1', title: 'Camiseta Premium Algodão', quantity: 1, unit_price: 89.90, options: { size: 'G', color: 'Branco' } }
    ],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ord-1002',
    customer_name: 'João Oliveira',
    customer_phone: '21977776666',
    customer_address: 'Av. Brasil, 500 - Rio de Janeiro/RJ',
    payment_method: 'Cartão de Crédito',
    delivery_type: 'Retirada',
    status: 'preparing',
    total: 299.90,
    items: [
      { product_id: 'prod-2', title: 'Tênis Esportivo Runner Pro', quantity: 1, unit_price: 299.90, options: { size: '41', color: 'Preto' } }
    ],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];
