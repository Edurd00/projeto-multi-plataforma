import { appContext } from '../../context/AppContext.js';

export const CheckoutModal = {
  render() {
    const { cart } = appContext.getState();
    const cartItems = cart || [];

    const formatCurrency = (value) => 
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.promo_price || item.price || item.product?.promo_price || item.product?.price || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);

    return `
      <div id="checkout-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>📱 Finalizar no WhatsApp</span>
            </h3>
            <button id="close-checkout" class="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg hover:bg-gray-100 text-lg transition">
              ✕
            </button>
          </div>
          
          <div class="bg-blue-50/50 rounded-xl p-4 space-y-2 border border-blue-100 text-xs md:text-sm">
            <h4 class="font-bold text-blue-900 uppercase text-[11px] tracking-wider mb-1">Resumo do Pedido</h4>
            <div class="flex justify-between text-gray-600">
              <span>Subtotal (${cartItems.reduce((s, i) => s + i.quantity, 0)} itens):</span>
              <span class="font-bold text-gray-800">${formatCurrency(subtotal)}</span>
            </div>
            <div class="flex justify-between text-gray-600 items-center">
              <span>Entrega:</span>
              <span class="font-bold text-emerald-600">A combinar / Grátis</span>
            </div>
            <div class="flex justify-between text-base font-black text-gray-900 border-t border-blue-100 pt-2 mt-1">
              <span>Total Geral:</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
          </div>
          
          <form id="checkout-form" class="space-y-3.5">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Seu Nome *</label>
              <input type="text" id="form-name" required class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ex: Maria Silva" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">WhatsApp de Contato *</label>
              <input type="tel" id="form-phone" required class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ex: 11999999999" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Endereço de Entrega *</label>
              <textarea id="form-address" required class="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-16 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Rua, número, bairro e complemento"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Forma de Pagamento *</label>
              <select id="form-payment" required class="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
            <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md mt-4 flex items-center justify-center gap-2">
              <span>Enviar Pedido para o WhatsApp</span>
            </button>
          </form>
        </div>
      </div>
    `;
  },

  open() { 
    const container = document.getElementById('checkout-modal-container');
    if (container) {
      container.innerHTML = this.render();
      this.bindEvents(container, window.currentCheckoutCallback || (() => {}));
    }
  },
  
  close() {
    const container = document.getElementById('checkout-modal-container');
    if (container) container.innerHTML = '';
  },

  bindEvents(container, onComplete) {
    const closeBtn = container.querySelector('#close-checkout');
    const form = container.querySelector('#checkout-form');
    window.currentCheckoutCallback = onComplete;
    if (closeBtn) closeBtn.onclick = () => this.close();
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const data = {
          name: container.querySelector('#form-name').value,
          phone: container.querySelector('#form-phone').value,
          address: container.querySelector('#form-address').value,
          payment: container.querySelector('#form-payment').value,
          deliveryType: 'Entrega'
        };
        onComplete(data);
      };
    }
  }
};
