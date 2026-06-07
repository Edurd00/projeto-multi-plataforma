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
      <div id="cart-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${overlayClass}">
        <div id="cart-panel" class="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${panelClass}">
          
          <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 class="text-lg font-bold text-gray-800">Seu Carrinho</h2>
              <span class="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">${cart.length}</span>
            </div>
            <button id="close-cart" class="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition">
              &#x2715;
            </button>
          </div>

          <div class="flex-grow overflow-y-auto p-4 space-y-4">
            ${cart.length === 0 ? `
              <div class="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <p class="text-base font-medium">Seu carrinho está vazio</p>
                <p class="text-xs max-w-xs mt-1">Adicione produtos navegando pela nossa vitrine.</p>
              </div>
            ` : cart.map(item => {
                const finalPrice = item.product.promo_price && item.product.promo_price < item.product.price 
                  ? item.product.promo_price 
                  : item.product.price;
                
                const attrsText = Object.entries(item.selectedAttributes)
                  .map(([k, v]) => `${k}: ${v}`).join(', ');

                return `
                  <div class="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <img src="${item.product.image_url || 'https://via.placeholder.com/100'}" class="w-16 h-16 rounded-lg object-cover bg-white border" />
                    <div class="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 class="text-sm font-semibold text-gray-800 line-clamp-1">${item.product.title}</h4>
                        ${attrsText ? `<p class="text-xs text-primary font-medium mt-0.5">${attrsText}</p>` : ''}
                      </div>
                      <div class="flex justify-between items-center mt-2">
                        <span class="text-sm font-bold text-gray-900">${formatCurrency(finalPrice * item.quantity)}</span>
                        <div class="flex items-center border border-gray-200 bg-white rounded-md p-0.5 scale-90">
                          <button data-id="${item.cartItemId}" class="js-cart-dec px-2 text-gray-500 font-bold hover:bg-gray-100 rounded">-</button>
                          <span class="px-2 text-xs font-semibold">${item.quantity}</span>
                          <button data-id="${item.cartItemId}" class="js-cart-inc px-2 text-gray-500 font-bold hover:bg-gray-100 rounded">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
          </div>

          ${cart.length > 0 ? `
            <div class="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
              <div class="space-y-1.5 text-sm text-gray-600">
                <div class="flex justify-between"><span>Subtotal:</span><span class="font-medium text-gray-800">${formatCurrency(subtotal)}</span></div>
                <div class="flex justify-between"><span>Taxa de Entrega:</span><span class="font-medium text-gray-800">${deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}</span></div>
                <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-dashed">
                  <span>Total:</span><span>${formatCurrency(total)}</span>
                </div>
              </div>
              
              <button id="go-to-checkout" class="w-full bg-primary hover:bg-opacity-95 text-white font-bold py-3 rounded-xl transition shadow-sm text-center block mt-2 text-sm">
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
    const checkoutBtn = container.querySelector('#go-to-checkout');

    if (closeBtn) closeBtn.onclick = () => this.close();
    // Garante fechamento apenas clicando no fundo preto
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

    // Ações reativas sem perder o foco ou fechar o container
    container.querySelectorAll('.js-cart-inc').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const { cart } = appContext.getState();
        const item = cart.find(i => i.cartItemId === id);
        if (item) appContext.addToCart(item.product, 1, item.selectedAttributes);
      };
    });

    container.querySelectorAll('.js-cart-dec').forEach(btn => {
      btn.onclick = () => {
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