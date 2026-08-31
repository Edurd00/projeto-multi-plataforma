import { appContext } from '../../context/AppContext.js';
import { Toast } from '../common/Toast.js';

export const CheckoutModal = {
  step: 1, // 1: Summary, 2: Delivery, 3: Payment, 4: Success
  formData: {
    name: '',
    email: '',
    phone: '',
    cep: '',
    address: '',
    paymentMethod: 'pix'
  },
  lastOrderId: '',

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

    const deliveryFee = 0; // Simulated Free Shipping
    const total = subtotal + deliveryFee;

    return `
      <div id="checkout-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          
          <!-- STEP HEADER -->
          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <h3 class="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                ${this.step === 4 ? '🎉 Pedido Confirmado!' : '🛍️ Checkout Simulado'}
              </h3>
              ${this.step < 4 ? `
                <div class="flex items-center gap-2 text-xs font-semibold text-gray-400 mt-1">
                  <span class="${this.step >= 1 ? 'text-blue-600 font-bold' : ''}">1. Resumo</span> •
                  <span class="${this.step >= 2 ? 'text-blue-600 font-bold' : ''}">2. Entrega</span> •
                  <span class="${this.step >= 3 ? 'text-blue-600 font-bold' : ''}">3. Pagamento</span>
                </div>
              ` : ''}
            </div>
            <button id="close-checkout" class="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg hover:bg-gray-100 text-lg transition">
              ✕
            </button>
          </div>

          <!-- STEP 1: ORDER SUMMARY -->
          ${this.step === 1 ? `
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                <h4 class="font-bold text-gray-700 uppercase text-xs tracking-wider">Itens do Pedido</h4>
                <div class="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  ${cartItems.map(item => `
                    <div class="flex justify-between items-center text-xs">
                      <span class="font-medium text-gray-800">${item.quantity}x ${item.title || item.product?.title}</span>
                      <span class="font-bold text-gray-900">${formatCurrency((item.promo_price || item.price) * item.quantity)}</span>
                    </div>
                  `).join('')}
                </div>

                <div class="border-t border-gray-200 pt-3 space-y-1 text-xs">
                  <div class="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span class="font-semibold text-gray-800">${formatCurrency(subtotal)}</span>
                  </div>
                  <div class="flex justify-between text-gray-600">
                    <span>Frete:</span>
                    <span class="font-semibold text-emerald-600">Grátis (Simulado)</span>
                  </div>
                  <div class="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-dashed">
                    <span>Total:</span>
                    <span>${formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <button id="btn-next-to-delivery" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md flex items-center justify-center gap-2">
                <span>Continuar para Entrega →</span>
              </button>
            </div>
          ` : ''}

          <!-- STEP 2: DELIVERY DETAILS -->
          ${this.step === 2 ? `
            <form id="form-delivery" class="space-y-3.5">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Nome Completo *</label>
                <input type="text" id="delivery-name" value="${this.formData.name}" required class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ex: Maria Silva" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">E-mail *</label>
                  <input type="email" id="delivery-email" value="${this.formData.email}" required class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="maria@email.com" />
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">WhatsApp / Telefone *</label>
                  <input type="tel" id="delivery-phone" value="${this.formData.phone}" required class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="(11) 99999-9999" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="sm:col-span-1">
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">CEP *</label>
                  <input type="text" id="delivery-cep" value="${this.formData.cep}" required class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="01000-000" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Endereço Completo *</label>
                  <input type="text" id="delivery-address" value="${this.formData.address}" required class="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Rua, nº, Bairro, Cidade/UF" />
                </div>
              </div>

              <div class="flex gap-2 pt-2">
                <button type="button" id="btn-back-to-summary" class="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition text-sm">
                  ← Voltar
                </button>
                <button type="submit" class="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md">
                  Ir para Pagamento →
                </button>
              </div>
            </form>
          ` : ''}

          <!-- STEP 3: PAYMENT SELECTION -->
          ${this.step === 3 ? `
            <div class="space-y-4">
              <div class="space-y-3">
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-700">Forma de Pagamento Simulado</label>
                <div class="grid grid-cols-2 gap-3">
                  <label class="border rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${this.formData.paymentMethod === 'pix' ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}">
                    <input type="radio" name="payment" value="pix" ${this.formData.paymentMethod === 'pix' ? 'checked' : ''} class="hidden js-pay-option" />
                    <span class="text-base">⚡ PIX</span>
                    <span class="text-[10px]">Aprovação Instantânea</span>
                  </label>

                  <label class="border rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition ${this.formData.paymentMethod === 'card' ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}">
                    <input type="radio" name="payment" value="card" ${this.formData.paymentMethod === 'card' ? 'checked' : ''} class="hidden js-pay-option" />
                    <span class="text-base">💳 Cartão de Crédito</span>
                    <span class="text-[10px]">Até 12x sem juros</span>
                  </label>
                </div>
              </div>

              <!-- PIX CONTAINER -->
              ${this.formData.paymentMethod === 'pix' ? `
                <div class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                  <p class="text-xs text-emerald-900 font-bold">Chave PIX Fictícia para Demonstração:</p>
                  <div class="bg-white border rounded-lg p-2 font-mono text-xs text-gray-700 select-all">
                    00020126580014BR.GOV.BCB.PIX0136demo-pix-key-portfolio5204000053039865405${total.toFixed(2)}
                  </div>
                  <p class="text-[10px] text-emerald-700">Ao clicar em confirmar, o pedido será finalizado no modo de testes.</p>
                </div>
              ` : `
                <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <p class="text-xs text-gray-700 font-bold">Dados do Cartão Fictício:</p>
                  <input type="text" placeholder="4532 •••• •••• 8899" disabled class="w-full bg-white border rounded-lg p-2 text-xs text-gray-500 cursor-not-allowed" />
                  <div class="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="MM/AA" disabled class="w-full bg-white border rounded-lg p-2 text-xs text-gray-500 cursor-not-allowed" />
                    <input type="text" placeholder="CVV" disabled class="w-full bg-white border rounded-lg p-2 text-xs text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
              `}

              <div class="flex gap-2 pt-2">
                <button type="button" id="btn-back-to-delivery" class="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition text-sm">
                  ← Voltar
                </button>
                <button type="button" id="btn-finish-checkout" class="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-md">
                  Confirmar Pedido Simulado
                </button>
              </div>
            </div>
          ` : ''}

          <!-- STEP 4: SUCCESS CONFIRMATION -->
          ${this.step === 4 ? `
            <div class="text-center py-6 space-y-4">
              <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                ✓
              </div>
              <div>
                <h4 class="text-xl font-extrabold text-gray-900">Pedido #${this.lastOrderId}</h4>
                <p class="text-xs text-gray-500 mt-1">Sua compra foi simulada com sucesso no portfólio!</p>
              </div>
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 space-y-1 text-left">
                <p><strong>Cliente:</strong> ${this.formData.name}</p>
                <p><strong>Endereço:</strong> ${this.formData.address}</p>
                <p><strong>Pagamento:</strong> ${this.formData.paymentMethod.toUpperCase()} (Simulado)</p>
              </div>
              <button id="btn-close-success" class="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition text-sm shadow-md">
                Voltar à Loja
              </button>
            </div>
          ` : ''}

        </div>
      </div>
    `;
  },

  open() { 
    this.step = 1;
    const container = document.getElementById('checkout-modal-container');
    if (container) {
      container.innerHTML = this.render();
      this.bindEvents(container);
    }
  },
  
  close() {
    this.step = 1;
    const container = document.getElementById('checkout-modal-container');
    if (container) container.innerHTML = '';
  },

  bindEvents(container) {
    const closeBtn = container.querySelector('#close-checkout');
    if (closeBtn) closeBtn.onclick = () => this.close();

    // Step 1 -> 2
    const btnNextDel = container.querySelector('#btn-next-to-delivery');
    if (btnNextDel) {
      btnNextDel.onclick = () => {
        this.step = 2;
        container.innerHTML = this.render();
        this.bindEvents(container);
      };
    }

    // Step 2 Form Submit -> 3
    const formDel = container.querySelector('#form-delivery');
    if (formDel) {
      formDel.onsubmit = (e) => {
        e.preventDefault();
        this.formData.name = container.querySelector('#delivery-name').value;
        this.formData.email = container.querySelector('#delivery-email').value;
        this.formData.phone = container.querySelector('#delivery-phone').value;
        this.formData.cep = container.querySelector('#delivery-cep').value;
        this.formData.address = container.querySelector('#delivery-address').value;
        this.step = 3;
        container.innerHTML = this.render();
        this.bindEvents(container);
      };
    }

    // Back Buttons
    const btnBackSum = container.querySelector('#btn-back-to-summary');
    if (btnBackSum) {
      btnBackSum.onclick = () => {
        this.step = 1;
        container.innerHTML = this.render();
        this.bindEvents(container);
      };
    }

    const btnBackDel = container.querySelector('#btn-back-to-delivery');
    if (btnBackDel) {
      btnBackDel.onclick = () => {
        this.step = 2;
        container.innerHTML = this.render();
        this.bindEvents(container);
      };
    }

    // Payment Option Change
    const payOptions = container.querySelectorAll('.js-pay-option');
    payOptions.forEach(opt => {
      opt.onchange = () => {
        this.formData.paymentMethod = opt.value;
        container.innerHTML = this.render();
        this.bindEvents(container);
      };
    });

    // Step 3 -> Finish
    const btnFinish = container.querySelector('#btn-finish-checkout');
    if (btnFinish) {
      btnFinish.onclick = () => {
        this.lastOrderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        this.step = 4;
        appContext.clearCart();
        Toast.show('Compra/Checkout simulado finalizado!', 'success');
        container.innerHTML = this.render();
        this.bindEvents(container);
      };
    }

    // Success Close
    const btnSuccessClose = container.querySelector('#btn-close-success');
    if (btnSuccessClose) {
      btnSuccessClose.onclick = () => this.close();
    }
  }
};
