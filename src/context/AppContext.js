import { api } from '../services/api.js';

class AppContext {
  constructor() {
    this.state = {
      tenant: null,
      cart: JSON.parse(localStorage.getItem('cart') || '[]'),
      isCartOpen: false
    };
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState() {
    return this.state;
  }

  async initTenant() {
    try {
      const { data, error } = await api.tenant.get();
      if (error) throw error;
      if (data) {
        this.state.tenant = data;
        this.applyTheme(data);
      }
    } catch (error) {
      console.error('Erro ao inicializar tenant:', error);
    }
  }

  applyTheme(tenant) {
    if (tenant.primary_color) {
      document.documentElement.style.setProperty('--cor-primaria', tenant.primary_color);
    }
    if (tenant.secondary_color) {
      document.documentElement.style.setProperty('--cor-secundaria', tenant.secondary_color);
    }
  }

  addToCart(product, quantity = 1, selectedOptions = {}) {
    const cart = [...this.state.cart];
    const itemKey = `${product.id}-${selectedOptions.size || ''}-${selectedOptions.color || ''}`;

    const existingIndex = cart.findIndex(item =>
      item.id === product.id &&
      item.selectedOptions?.size === selectedOptions.size &&
      item.selectedOptions?.color === selectedOptions.color
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        ...product,
        quantity,
        selectedOptions,
        itemKey
      });
    }

    this.state.cart = cart;
    localStorage.setItem('cart', JSON.stringify(cart));
    this.notify();
  }

  removeFromCart(itemKey) {
    this.state.cart = this.state.cart.filter(item => item.itemKey !== itemKey);
    localStorage.setItem('cart', JSON.stringify(this.state.cart));
    this.notify();
  }

  updateQuantity(itemKey, delta) {
    const cart = this.state.cart.map(item => {
      if (item.itemKey === itemKey) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    this.state.cart = cart;
    localStorage.setItem('cart', JSON.stringify(cart));
    this.notify();
  }

  clearCart() {
    this.state.cart = [];
    localStorage.removeItem('cart');
    this.notify();
  }
}

export const appContext = new AppContext();
