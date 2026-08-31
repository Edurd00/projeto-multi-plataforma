import { appContext } from '../../context/AppContext.js';

export const CartDrawer = {
  isOpen: false,

  render() {
    const { cart, tenant } = appContext.getState();

    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    const subtotal = cart.reduce((sum, item) => {
      const price = item.promo_price || item.price || item.product?.promo_price || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    const deliveryFee = tenant?.delivery_fee ? Number(tenant.delivery_fee) : 0;
    const total = subtotal + deliveryFee;

    const overlayClass = this.isOpen ? '' : 'hidden opacity-0';
    const panelClass = this.isOpen ? 'translate-x-0' : 'translate-x-full';

    return `
      <div id="cart-overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${overlayClass}">
        <div id="cart-panel" class="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${panelClass}">
          
          <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 class="text-lg font-bold text-gray-800">Seu Carrinho</h2>
              <span class="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                ${cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button id="close-cart" class="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-200 transition text-lg font-bold">
              ✕
            </button>
          </div>

          <div class="flex-grow overflow-y-auto p-4 space-y-3">
            ${cart.length === 0 ? `
              <div class="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p class="text-base font-semibold text-gray-600">Seu carrinho está vazio</p>
                <p class="text-xs max-w-xs mt-1 text-gray-400">Adicione produtos navegando pela nossa vitrine.</p>
              </div>
            ` : cart.map(item => {
              const title = item.title || item.product?.title || 'Produto';
              const img = item.image_url || item.product?.image_url || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';
              const price = item.promo_price || item.price || item.product?.promo_price || item.product?.price || 0;
              const options = item.selectedOptions || item.selectedAttributes || {};
              const itemKey = item.itemKey || item.cartItemId || item.id;

              const optionsStr = Object.entries(options)
                .filter(([_, v]) => v && v !== 'N/A')
                .map(([k, v]) => `${k.toUpperCase()}: ${v}`).join(' | ');

              return `
                <div class="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 items-center">
                  <img src="${img}" class="w-16 h-16 rounded-lg object-cover bg-white border" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';" />
                  <div class="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 class="text-xs font-bold text-gray-800 line-clamp-1">${title}</h4>
                      ${optionsStr ? `
                        <p class="text-[10px] text-blue-600 font-semibold mt-0.5">${optionsStr}</p>
                      ` : ''}
                    </div>
                    <div class="flex justify-between items-center mt-2">
                      <span class="text-xs font-extrabold text-gray-900">${formatCurrency(price * item.quantity)}</span>
                      <div class="flex items-center border border-gray-200 bg-white rounded-lg px-1 py-0.5 gap-2">
                        <button data-key="${itemKey}" class="js-cart-dec text-gray-600 font-bold px-1.5 hover:bg-gray-100 rounded text-xs">-</button>
                        <span class="text-xs font-bold text-gray-800">${item.quantity}</span>
                        <button data-key="${itemKey}" class="js-cart-inc text-gray-600 font-bold px-1.5 hover:bg-gray-100 rounded text-xs">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${cart.length > 0 ? `
            <div class="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
              <div class="space-y-1.5 text-xs text-gray-600">
                <div class="flex justify-between"><span>Subtotal:</span><span class="font-semibold text-gray-800">${formatCurrency(subtotal)}</span></div>
                <div class="flex justify-between"><span>Taxa de Entrega:</span><span class="font-semibold text-gray-800">${deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}</span></div>
                <div class="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-dashed">
                  <span>Total:</span><span>${formatCurrency(total)}</span>
                </div>
              </div>
              
              <button id="go-to-checkout" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md text-center block text-sm">
                Finalizar Pedido via WhatsApp
              </button>
            </div>
          ` : ''}

        </div>
      </div>
    `;
  },

  open() {
    this.isOpen = true;
    const overlay = document.getElementById('cart-overlay');
    const panel = document.getElementById('cart-panel');
    if (!overlay || !panel) return;

    overlay.classList.remove('hidden');
    setTimeout(() => {
      overlay.classList.remove('opacity-0');
      panel.classList.remove('translate-x-full');
    }, 10);
  },

  close() {
    this.isOpen = false;
    const overlay = document.getElementById('cart-overlay');
    const panel = document.getElementById('cart-panel');
    if (!overlay || !panel) return;

    overlay.classList.add('opacity-0');
    panel.classList.add('translate-x-full');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  },

  bindEvents(container, onCheckoutClick) {
    const closeBtn = container.querySelector('#close-cart');
    const overlay = container.querySelector('#cart-overlay');
    const checkoutBtn = container.querySelector('#go-to-checkout');

    if (closeBtn) closeBtn.onclick = () => this.close();
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target.id === 'cart-overlay') this.close();
      };
    }

    if (checkoutBtn && onCheckoutClick) {
      checkoutBtn.onclick = () => {
        this.close();
        onCheckoutClick();
      };
    }

    container.querySelectorAll('.js-cart-inc').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const key = btn.getAttribute('data-key');
        appContext.updateQuantity(key, 1);
      };
    });

    container.querySelectorAll('.js-cart-dec').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const key = btn.getAttribute('data-key');
        appContext.updateQuantity(key, -1);
      };
    });
  }
};
