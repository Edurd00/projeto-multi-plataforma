import {
  initialProducts,
  initialCategories,
  initialTenantSettings,
  initialBanners,
  initialPromotions,
  initialOrders
} from '../data/mockData.js';

// Helper de armazenamento local para persistência de dados em memória/localStorage
function getStorageItem(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
}

// Inicia armazenamento
let products = getStorageItem('mock_products', initialProducts);
let categories = getStorageItem('mock_categories', initialCategories);
let tenantSettings = getStorageItem('mock_tenant', initialTenantSettings);
let banners = getStorageItem('mock_banners', initialBanners);
let promotions = getStorageItem('mock_promotions', initialPromotions);
let orders = getStorageItem('mock_orders', initialOrders);
let currentUser = getStorageItem('mock_session', null);

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- AUTH MOCK ---
  auth: {
    async signInWithPassword({ email, password }) {
      await delay();
      if (email && password) {
        currentUser = { id: 'user-demo-123', email, name: 'Lojista Demo' };
        setStorageItem('mock_session', currentUser);
        return { data: { user: currentUser, session: { user: currentUser } }, error: null };
      }
      return { data: null, error: { message: 'E-mail e senha são obrigatórios' } };
    },

    async signOut() {
      await delay();
      currentUser = null;
      localStorage.removeItem('mock_session');
      return { error: null };
    },

    async getSession() {
      await delay(100);
      return { data: { session: currentUser ? { user: currentUser } : null }, error: null };
    }
  },

  // --- PRODUCTS MOCK ---
  products: {
    async getAll({ categoryId, searchQuery, orderBy = 'featured', storefrontOnly = false } = {}) {
      await delay();
      let list = [...products];

      if (storefrontOnly) {
        list = list.filter(p => p.in_stock && p.is_active);
      }

      if (categoryId) {
        list = list.filter(p => p.category_id === categoryId);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        list = list.filter(p =>
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.description && p.description.toLowerCase().includes(query))
        );
      }

      if (orderBy === 'asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (orderBy === 'desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (orderBy === 'featured') {
        list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      }

      // Popula dados de categoria nos produtos
      const result = list.map(prod => ({
        ...prod,
        categories: categories.find(c => c.id === prod.category_id) || null
      }));

      return { data: result, error: null };
    },

    async getById(id) {
      await delay();
      const product = products.find(p => p.id === id);
      if (!product) return { data: null, error: { message: 'Produto não encontrado' } };

      const category = categories.find(c => c.id === product.category_id);
      return { data: { ...product, categories: category ? { name: category.name } : null }, error: null };
    },

    async create(productData) {
      await delay();
      const newProd = {
        id: 'prod-' + Date.now(),
        title: productData.title || '',
        description: productData.description || '',
        price: parseFloat(productData.price) || 0,
        promo_price: productData.promo_price ? parseFloat(productData.promo_price) : null,
        category_id: productData.category_id || null,
        image_url: productData.image_url || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80',
        is_featured: !!productData.is_featured,
        in_stock: productData.in_stock !== undefined ? productData.in_stock : true,
        stock: parseInt(productData.stock) || 0,
        is_active: productData.is_active !== undefined ? productData.is_active : true,
        sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
        colors: Array.isArray(productData.colors) ? productData.colors : [],
        created_at: new Date().toISOString()
      };
      products.unshift(newProd);
      setStorageItem('mock_products', products);
      return { data: newProd, error: null };
    },

    async update(id, updates) {
      await delay();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) return { data: null, error: { message: 'Produto não encontrado' } };

      const updated = { ...products[index], ...updates };
      if (updates.price !== undefined) updated.price = parseFloat(updates.price);
      if (updates.promo_price !== undefined) updated.promo_price = updates.promo_price ? parseFloat(updates.promo_price) : null;
      if (updates.stock !== undefined) updated.stock = parseInt(updates.stock);

      products[index] = updated;
      setStorageItem('mock_products', products);
      return { data: updated, error: null };
    },

    async delete(id) {
      await delay();
      products = products.filter(p => p.id !== id);
      setStorageItem('mock_products', products);
      return { data: true, error: null };
    }
  },

  // --- CATEGORIES MOCK ---
  categories: {
    async getAll() {
      await delay();
      const list = [...categories].sort((a, b) => a.name.localeCompare(b.name));
      return { data: list, error: null };
    },

    async create({ name, slug }) {
      await delay();
      const newCat = {
        id: 'cat-' + Date.now(),
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-')
      };
      categories.push(newCat);
      setStorageItem('mock_categories', categories);
      return { data: newCat, error: null };
    }
  },

  // --- TENANT MOCK ---
  tenant: {
    async get() {
      await delay();
      return { data: tenantSettings, error: null };
    },

    async update(updates) {
      await delay();
      tenantSettings = { ...tenantSettings, ...updates };
      setStorageItem('mock_tenant', tenantSettings);
      return { data: tenantSettings, error: null };
    }
  },

  // --- ORDERS MOCK ---
  orders: {
    async getAll() {
      await delay();
      const list = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { data: list, error: null };
    },

    async create({ customer_name, customer_phone, customer_address, payment_method, delivery_type, cartItems }) {
      await delay();
      const total = cartItems.reduce((acc, item) => {
        const itemPrice = item.promo_price || item.price;
        return acc + (itemPrice * item.quantity);
      }, 0);

      const newOrder = {
        id: 'ord-' + Math.floor(1000 + Math.random() * 9000),
        customer_name,
        customer_phone,
        customer_address,
        payment_method,
        delivery_type,
        status: 'pending',
        total,
        items: cartItems.map(item => ({
          product_id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.promo_price || item.price,
          options: item.selectedOptions || {}
        })),
        created_at: new Date().toISOString()
      };

      orders.unshift(newOrder);
      setStorageItem('mock_orders', orders);
      return { data: newOrder, error: null };
    },

    async updateStatus(orderId, status) {
      await delay();
      const index = orders.findIndex(o => o.id === orderId);
      if (index === -1) return { data: null, error: { message: 'Pedido não encontrado' } };
      orders[index].status = status;
      setStorageItem('mock_orders', orders);
      return { data: orders[index], error: null };
    }
  },

  // --- BANNERS MOCK ---
  banners: {
    async getAll() {
      await delay();
      return { data: banners.filter(b => b.is_active), error: null };
    }
  },

  // --- PROMOTIONS MOCK ---
  promotions: {
    async getAll() {
      await delay();
      return { data: promotions.filter(p => p.is_active), error: null };
    }
  }
};
