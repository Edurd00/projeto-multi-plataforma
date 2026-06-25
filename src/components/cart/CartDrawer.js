import { appContext } from '../../context/AppContext.js';

export const CartDrawer = {
  // Controle de estado visual mantido em memória durante a sessão
  isOpen: false,

  render() {
    const { cart, tenant } = appContext.getState();

    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const subtotal = cart.reduce((sum, item) => {
      const price = item.product.promo_price && item.product.promo_price < item.product.price
        ? item.product.promo_price
        : item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    const deliveryFee = tenant?.delivery_fee ? Number(tenant.delivery_fee) : 0;
    const total = subtotal + deliveryFee;

    // Avalia o estado de abertura atual para injetar as classes corretas do Tailwind sem fechar
    const overlayClass = this.isOpen ? '' : 'hidden opacity-0';
    const panelClass = this.isOpen ? 'translate-x-0' : 'translate-x-full';

    return `
      <div id="cart-overlay" class="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${overlayClass}">
        <div id="cart-panel" class="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${panelClass}">
          
          <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 bg-lojaPrimaria/10 rounded-xl flex items-center justify-center text-lojaPrimaria">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-black text-gray-900 uppercase tracking-tight">Carrinho</h2>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${cart.length} itens selecionados</p>
              </div>
            </div>
            <button id="close-cart" class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="flex-grow overflow-y-auto p-4 space-y-4">
            ${cart.length === 0 ? `
              <div class="h-full flex flex-col items-center justify-center text-center p-8">
                <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <h3 class="text-gray-900 font-bold">Carrinho vazio</h3>
                <p class="text-gray-400 text-xs mt-1">Explore nossa vitrine e adicione seus produtos favoritos aqui.</p>
              </div>
            ` : cart.map(item => {
      const finalPrice = item.product.promo_price && item.product.promo_price < item.product.price
        ? item.product.promo_price
        : item.product.price;

      const attrsText = Object.entries(item.selectedAttributes)
        .map(([k, v]) => `${k}: ${v}`).join(', ');

      return `
                  <div class="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div class="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-50">
                      <img src="${item.product.image_url || ''}" class="w-full h-full object-cover" onerror="this.src='https://via.placeholder.com/100'" />
                    </div>
                    <div class="flex-grow flex flex-col justify-between py-0.5">
                      <div>
                        <h4 class="text-sm font-bold text-gray-900 line-clamp-1">${item.product.title}</h4>
                        ${attrsText ? `<p class="text-[10px] text-lojaPrimaria font-black uppercase tracking-widest mt-1">${attrsText}</p>` : ''}
                      </div>
                      <div class="flex justify-between items-center mt-2">
                        <span class="text-sm font-black text-gray-900">${formatCurrency(finalPrice * item.quantity)}</span>
                        <div class="flex items-center bg-gray-100 rounded-lg p-1">
                          <button data-id="${item.cartItemId}" class="js-cart-dec w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 font-bold transition">-</button>
                          <span class="w-8 text-center text-xs font-bold text-gray-900">${item.quantity}</span>
                          <button data-id="${item.cartItemId}" class="js-cart-inc w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 font-bold transition">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
    }).join('')}
          </div>

          ${cart.length > 0 ? `
            <div class="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
              <div class="space-y-2">
                <div class="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span class="text-gray-900">${formatCurrency(subtotal)}</span>
                </div>
                <div class="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Entrega</span>
                  <span class="text-green-600">${deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}</span>
                </div>
                <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span class="text-lg font-black text-gray-900 uppercase tracking-tight">Total</span>
                  <span class="text-xl font-black text-lojaPrimaria">${formatCurrency(total)}</span>
                </div>
              </div>
              
              <button id="go-to-checkout" class="w-full bg-lojaPrimaria text-white font-black py-4 rounded-2xl shadow-lg shadow-lojaPrimaria/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest">
                Finalizar Pedido
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
    const panel = container.querySelector('#cart-panel');
    const checkoutBtn = container.querySelector('#go-to-checkout');

    if (closeBtn) closeBtn.onclick = () => this.close();

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target.id === 'cart-overlay') this.close();
      };
    }

    if (panel) {
      panel.onclick = (e) => e.stopPropagation();
    }

    if (checkoutBtn && onCheckoutClick) {
      checkoutBtn.onclick = () => {
        this.close();
        onCheckoutClick();
      };
    }

    // Ações reativas sem perder o foco ou fechar o container
    container.querySelectorAll('.js-cart-inc').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const { cart } = appContext.getState();
        const item = cart.find(i => i.cartItemId === id);
        if (item) appContext.addToCart(item.product, 1, item.selectedAttributes);
      };
    });

    container.querySelectorAll('.js-cart-dec').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const { cart } = appContext.getState();
        const item = cart.find(i => i.cartItemId === id);
        if (item) {
          if (item.quantity > 1) {
            appContext.addToCart(item.product, -1, item.selectedAttributes);
          } else {
            appContext.removeFromCart(id);
          }
        }
      };
    });
  }
};
