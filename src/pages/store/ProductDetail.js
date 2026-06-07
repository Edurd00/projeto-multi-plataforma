import { productService } from '../../services/productService.js';

export const ProductDetail = {
  async render(productId) {
    const product = await productService.getById(productId);

    if (!product) {
      return `
        <div class="container mx-auto px-4 py-16 text-center">
          <h2 class="text-2xl font-bold text-gray-800">Produto não encontrado.</h2>
          <p class="text-gray-500 mt-2">O item que você busca foi removido ou não existe.</p>
        </div>
      `;
    }

    const formatCurrency = (value) => 
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Extrai atributos dinâmicos salvos no JSONB (Ex: cores, tamanhos, adicionais)
    const attributes = product.attributes || {};

    return `
      <div class="container mx-auto px-4 max-w-5xl py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="w-full bg-gray-50 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
            <img src="${product.image_url || 'https://via.placeholder.com/600'}" alt="${product.title}" class="w-full h-full object-cover" />
          </div>

          <div class="flex flex-col justify-between">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-primary mb-1 block">
                ${product.categories?.name || 'Geral'}
              </span>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">${product.title}</h1>
              <p class="text-gray-600 text-sm leading-relaxed mb-6">${product.description || 'Sem descrição.'}</p>
              
              <div class="mb-6 p-4 bg-gray-50 rounded-xl">
                ${product.promo_price ? `
                  <span class="text-sm text-gray-400 line-through block">${formatCurrency(product.price)}</span>
                  <span class="text-3xl font-black text-red-600">${formatCurrency(product.promo_price)}</span>
                ` : `
                  <span class="text-3xl font-black text-primary">${formatCurrency(product.price)}</span>
                `}
              </div>

              <div id="dynamic-attributes" class="space-y-4 mb-6">
                ${Object.entries(attributes).map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return `
                      <div>
                        <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">${key}</label>
                        <select name="attr_${key}" class="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-primary focus:outline-none">
                          ${value.map(option => `<option value="${option}">${option}</option>`).join('')}
                        </select>
                      </div>
                    `;
                  }
                  return '';
                }).join('')}
              </div>
            </div>

            <div class="pt-4 border-t border-gray-100 flex gap-4">
              <div class="w-1/3 flex border border-gray-200 rounded-lg items-center justify-between p-1 bg-gray-50">
                <button id="btn-dec" class="px-3 font-bold text-gray-600 hover:text-gray-900">-</button>
                <span id="qty-display" class="font-semibold text-sm">1</span>
                <button id="btn-inc" class="px-3 font-bold text-gray-600 hover:text-gray-900">+</button>
              </div>
              <button id="btn-buy-now" class="w-2/3 bg-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition shadow-sm flex items-center justify-center gap-2">
                Comprar Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(container, productId) {
    let quantity = 1;
    const qtyDisplay = container.querySelector('#qty-display');
    const btnInc = container.querySelector('#btn-inc');
    const btnDec = container.querySelector('#btn-dec');
    const btnBuyNow = container.querySelector('#btn-buy-now');

    if (!qtyDisplay) return;

    btnInc.onclick = () => { quantity++; qtyDisplay.innerText = quantity; };
    btnDec.onclick = () => { if (quantity > 1) { quantity--; qtyDisplay.innerText = quantity; } };

    btnBuyNow.onclick = () => {
      alert(`Fluxo direto: Iniciando compra de ${quantity} unidades!`);
    };
  }
};