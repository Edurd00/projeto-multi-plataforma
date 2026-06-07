import { appContext } from '../../context/AppContext.js';

export const CheckoutModal = {
  render() {
    const cartItems = appContext.getState().cart || [];

    // Função de formatação para garantir R$ e casas decimais
    const formatCurrency = (value) => 
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // 1. Cálculo do frete (pega o maior valor entre os itens)
    const deliveryFee = cartItems.reduce((max, item) => {
      const itemShipping = parseFloat(item.product?.shipping_fee || 0);
      return itemShipping > max ? itemShipping : max;
    }, 0);

    // 2. Cálculo do subtotal (buscando dentro de item.product)
    const totalCartAmount = cartItems.reduce((sum, item) => {
      const prod = item.product || {};
      // Verifica se tem preço promocional válido
      const price = (prod.promo_price && prod.promo_price < prod.price) 
        ? Number(prod.promo_price) 
        : Number(prod.price || 0);
      
      const quantity = Number(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);

    // 3. Soma final
    const totalWithDelivery = totalCartAmount + deliveryFee;

    // 4. Texto da entrega
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
              <textarea id="form-address" required class="w-full border border-gray-200 rounded-lg p-2.5 text-sm h-16 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Rua, número, bairro"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Forma de Pagamento *</label>
              <select id="form-payment" required class="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
            <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-sm mt-4">
              Confirmar e Enviar para WhatsApp
            </button>
          </form>
        </div>
      </div>
    `;
  },
  
  // Mantenha os métodos open, close e bindEvents exatamente como você já tinha antes
  open() { 
    const container = document.getElementById('checkout-modal-container');
    if (container) {
      container.innerHTML = this.render();
      this.bindEvents(container, window.currentCheckoutCallback || (() => {}));
    }
    document.getElementById('checkout-modal')?.classList.remove('hidden'); 
  },
  
  close() { document.getElementById('checkout-modal')?.classList.add('hidden'); },

  bindEvents(container, onComplete) {
    const closeBtn = container.querySelector('#close-checkout');
    const form = container.querySelector('#checkout-form');
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