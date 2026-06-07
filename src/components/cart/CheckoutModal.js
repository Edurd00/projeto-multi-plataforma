import { appContext } from '../../context/AppContext.js';

export const CheckoutModal = {
  render() {
    // 1. Recupera os itens do carrinho direto do estado global
    const cartItems = appContext.getState().cart;

    // 2. Lógica Dinâmica: Encontra o maior frete presente entre os itens do carrinho
    const deliveryFee = cartItems.reduce((max, item) => {
      const itemShipping = parseFloat(item.shipping_fee) || 0;
      return itemShipping > max ? itemShipping : max;
    }, 0);

    // 3. Calcula o subtotal dos produtos comprados
    const totalCartAmount = cartItems.reduce((sum, item) => {
      const price = item.promo_price || item.price;
      return sum + (price * item.quantity);
    }, 0);

    // 4. Soma o subtotal com o maior frete encontrado
    const totalWithDelivery = totalCartAmount + deliveryFee;

    // Conversores de moeda para formatar a exibição em Real (R$)
    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Define o texto inteligente que o cliente lerá sobre a entrega
    const deliveryText = deliveryFee > 0 
      ? formatCurrency(deliveryFee)
      : `<span class="text-green-600 font-extrabold">A combinar / Grátis 💬</span>`;

    return `
      <div id="checkout-modal" class="fixed inset-0 bg-black bg-opacity-60 z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
          
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="text-lg font-bold text-gray-900">Finalizar no WhatsApp</h3>
            <button id="close-checkout" class="text-gray-400 hover:text-gray-600 font-bold">&#x2715;</button>
          </div>
          
          <div class="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100 text-sm">
            <h4 class="font-bold text-gray-700 uppercase text-xs tracking-wider mb-1">Resumo do Pedido</h4>
            <div class="flex justify-between text-gray-600">
              <span>Subtotal dos itens:</span>
              <span class="font-medium text-gray-800">${formatCurrency(totalCartAmount)}</span>
            </div>
            <div class="flex justify-between text-gray-600 items-center">
              <span>Taxa de Entrega:</span>
              <span class="font-medium text-gray-800">${deliveryText}</span>
            </div>
            <div class="flex justify-between text-base font-black text-gray-900 border-t pt-2 mt-1">
              <span>Total Geral:</span>
              <span>${formatCurrency(totalWithDelivery)}</span>
            </div>
          </div>
          
          <form id="checkout-form" class="space-y-3.5">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Seu Nome *</label>
              <input type="text" id="form-name" required class="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Ex: João Silva" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">WhatsApp de Contato *</label>
              <input type="tel" id="form-phone" required class="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Ex: 11999999999" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Endereço de Entrega *</label>
              <textarea id="form-address" required class="w-full border border-gray-200 rounded-lg p-2.5 text-sm h-16 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Rua, número, bairro e complemento (ou Digite 'Retirada')"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Forma de Pagamento *</label>
              <select id="form-payment" required class="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
            
            <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-sm mt-4 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Confirmar e Enviar para WhatsApp
            </button>
          </form>
        </div>
      </div>
    `;
  },

  open() { 
    // Como o carrinho muda, precisamos remontar o HTML interno do container antes de exibir o modal
    const container = document.getElementById('checkout-modal-container');
    if (container) {
      container.innerHTML = this.render();
      // Remonta os listeners de clique/submit para o novo HTML injetado
      this.bindEvents(container, window.currentCheckoutCallback || (() => {}));
    }
    document.getElementById('checkout-modal')?.classList.remove('hidden'); 
  },
  
  close() { document.getElementById('checkout-modal')?.classList.add('hidden'); },

  bindEvents(container, onComplete) {
    const closeBtn = container.querySelector('#close-checkout');
    const form = container.querySelector('#checkout-form');

    // Armazena o callback globalmente para que a re-abertura dinâmica do método open() não o perca
    window.currentCheckoutCallback = onComplete;

    if (closeBtn) closeBtn.onclick = () => this.close();

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const data = {
          customerName: container.querySelector('#form-name').value,
          customerPhone: container.querySelector('#form-phone').value,
          deliveryAddress: container.querySelector('#form-address').value,
          paymentMethod: container.querySelector('#form-payment').value,
        };
        onComplete(data);
      };
    }
  }
};