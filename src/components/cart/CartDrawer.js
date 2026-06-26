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
      <div id="cart-overlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${overlayClass}">
        <div id="cart-panel" class="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${panelClass}">
          
          <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white relative">
            <div class="flex items-center gap-3">
              <div class="bg-lojaPrimaria/10 p-2 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-lojaPrimaria" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-black text-gray-900 tracking-tight">Sua Sacola</h2>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${cart.length} itens selecionados</p>
              </div>
            </div>
            <button id="close-cart" class="group bg-gray-50 p-3 rounded-2xl hover:bg-red-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
        .filter(([_, v]) => v)
        .map(([_, v]) => v).join(' / ');

      return `
                  <div class="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-lojaPrimaria/20 transition-colors">
                    <div class="relative">
                      <img src="${item.product.image_url || 'https://via.placeholder.com/100'}" class="w-20 h-20 rounded-xl object-cover bg-gray-50 border border-gray-50" />
                    </div>
                    <div class="flex-grow flex flex-col justify-between py-0.5">
                      <div>
                        <h4 class="text-sm font-bold text-gray-900 line-clamp-1 leading-tight">${item.product.title}</h4>
                       
                       ${attrsText ? `
                          <div class="mt-1.5">
                            <span class="text-[9px] font-black uppercase tracking-widest text-lojaPrimaria bg-lojaPrimaria/5 px-2 py-1 rounded-lg">
                              ${attrsText}
                            </span>
                          </div>
                        ` : ''}                      
                          </div>
                      <div class="flex justify-between items-center mt-3">
                        <span class="text-base font-black text-gray-900">${formatCurrency(finalPrice * item.quantity)}</span>
                        <div class="flex items-center bg-gray-50 rounded-xl p-1 gap-1">
                          <button data-id="${item.cartItemId}" class="js-cart-dec w-7 h-7 flex items-center justify-center bg-white text-gray-400 font-bold hover:text-red-500 rounded-lg shadow-sm transition-colors">-</button>
                          <span class="w-6 text-center text-xs font-black text-gray-900">${item.quantity}</span>
                          <button data-id="${item.cartItemId}" class="js-cart-inc w-7 h-7 flex items-center justify-center bg-white text-gray-400 font-bold hover:text-lojaPrimaria rounded-lg shadow-sm transition-colors">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
    }).join('')}
          </div>

          ${cart.length > 0 ? `
            <div class="p-6 border-t border-gray-100 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
              <div class="space-y-3 text-sm">
                <div class="flex justify-between text-gray-500 font-medium"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
                <div class="flex justify-between text-gray-500 font-medium"><span>Frete</span><span>${deliveryFee === 0 ? '<span class="text-green-500 font-bold">Grátis</span>' : formatCurrency(deliveryFee)}</span></div>
                <div class="flex justify-between text-xl font-black text-gray-900 pt-4 border-t border-gray-50">
                  <span>Total</span><span>${formatCurrency(total)}</span>
                </div>
              </div>
              
              <button id="go-to-checkout" class="w-full bg-gray-900 hover:bg-lojaPrimaria text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-gray-200 uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 group">
                Finalizar Pedido
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
    // Forçar reflow para animação funcionar
    void overlay.offsetWidth;
    overlay.classList.remove('opacity-0');
    panel.classList.remove('translate-x-full');
  },

  close() {
    this.isOpen = false;
    const overlay = document.getElementById('cart-overlay');
    const panel = document.getElementById('cart-panel');
    if (!overlay || !panel) return;

    overlay.classList.add('opacity-0');
    panel.classList.add('translate-x-full');
    setTimeout(() => overlay.classList.add('hidden'), 500);
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