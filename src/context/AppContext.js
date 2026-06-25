import { injectTheme } from '../config/theme.js';
import { supabase } from '../config/supabase.js';

class AppState {
  constructor() {
    this.state = {
      tenant: null,
      cart: JSON.parse(localStorage.getItem('cart')) || [],
      listeners: []
    };
  }

  subscribe(listener) {
    this.state.listeners.push(listener);
    return () => {
      this.state.listeners = this.state.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.state.listeners.forEach(listener => listener(this.getState()));
  }

  getState() {
    return { tenant: this.state.tenant, cart: this.state.cart };
  }

  async initTenant() {
    try {
      const { data, error } = await supabase
        .from('tenant_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        this.state.tenant = data;
        injectTheme(data.primary_color, data.secondary_color);
        this.notify();
      }
    } catch (err) {
      console.error("Erro ao carregar Tenant:", err.message);
    }
  }

  addToCart(product, quantity = 1, selectedAttributes = {}) {
    const cartItemId = `${product.id}-${btoa(JSON.stringify(selectedAttributes))}`;
    const existingItemIndex = this.state.cart.findIndex(item => item.cartItemId === cartItemId);

    if (existingItemIndex > -1) {
      this.state.cart[existingItemIndex].quantity += quantity;
    } else {
      this.state.cart.push({ cartItemId, product, quantity, selectedAttributes });
    }
    this.saveCart();
  }

  removeFromCart(cartItemId) {
    this.state.cart = this.state.cart.filter(item => item.cartItemId !== cartItemId);
    this.saveCart();
  }

  clearCart() {
    this.state.cart = [];
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.state.cart));
    this.notify();
  }
}

export const appContext = new AppState();