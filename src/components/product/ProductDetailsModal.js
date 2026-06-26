export const ProductDetailsModal = {
  render(product) {
    const hasDiscount = product.promo_price && product.promo_price < product.price;
    const finalPrice = hasDiscount ? product.promo_price : product.price;
    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const placeholderImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;

    return `
      <div id="product-modal-root" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" id="modal-backdrop"></div>

        <div class="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
          <button id="close-product-modal" class="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="w-full md:w-1/2 aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
            <img
              src="${product.image_url || ''}"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';"
              class="w-full h-full object-cover"
              alt="${product.title}"
            />
          </div>

          <div class="w-full md:w-1/2 p-8 flex flex-col justify-between">
            <div class="space-y-4">
              <div>
                <span class="text-xs font-bold text-lojaPrimaria uppercase tracking-wider">${product.categories?.name || 'Produto'}</span>
                <h2 class="text-3xl font-black text-gray-900 leading-tight">${product.title}</h2>
              </div>

              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-black text-gray-900">${formatCurrency(finalPrice)}</span>
                ${hasDiscount ? `<span class="text-lg text-gray-400 line-through">${formatCurrency(product.price)}</span>` : ''}
              </div>

              <div class="border-t border-gray-100 pt-4">
                <h4 class="text-xs font-bold text-gray-400 uppercase mb-2">Descrição</h4>
                <p class="text-gray-600 leading-relaxed">${product.description || 'Nenhuma descrição disponível para este produto.'}</p>
              </div>

              ${product.attributes && product.attributes.length > 0 ? `
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-gray-400 uppercase">Tamanhos Disponíveis</h4>
                  <div class="flex flex-wrap gap-2">
                    ${product.attributes.map(attr => `
                      <button class="js-attr-btn px-4 py-2 border-2 border-gray-100 rounded-xl text-sm font-bold hover:border-lojaPrimaria transition" data-attr="${attr}">${attr}</button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${product.colors && product.colors.length > 0 ? `
                <div class="space-y-3">
                  <h4 class="text-xs font-bold text-gray-400 uppercase">Cores</h4>
                  <div class="flex flex-wrap gap-2">
                    ${product.colors.map(color => `
                      <button class="js-color-btn px-4 py-2 border-2 border-gray-100 rounded-xl text-sm font-bold hover:border-lojaPrimaria transition" data-color="${color}">${color}</button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="mt-8 space-y-4">
              <div class="flex items-center gap-4">
                <div class="flex items-center border-2 border-gray-100 rounded-2xl p-1">
                  <button id="qty-minus" class="p-2 hover:bg-gray-50 rounded-xl transition text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                  </button>
                  <input type="number" id="qty-input" value="1" min="1" class="w-12 text-center font-bold text-gray-800 bg-transparent focus:outline-none" readonly />
                  <button id="qty-plus" class="p-2 hover:bg-gray-50 rounded-xl transition text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                <button id="modal-add-to-cart" class="flex-grow bg-lojaPrimaria text-white font-bold py-4 rounded-2xl shadow-lg shadow-lojaPrimaria/20 hover:scale-[1.02] active:scale-[0.98] transition">
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(container, product, onAdd) {
    const root = container.querySelector('#product-modal-root');
    const closeBtn = container.querySelector('#close-product-modal');
    const backdrop = container.querySelector('#modal-backdrop');
    const qtyInput = container.querySelector('#qty-input');
    const qtyPlus = container.querySelector('#qty-plus');
    const qtyMinus = container.querySelector('#qty-minus');
    const addBtn = container.querySelector('#modal-add-to-cart');

    let selectedAttr = null;
    let selectedColor = null;

    const close = () => {
      root.classList.add('fade-out');
      setTimeout(() => root.remove(), 300);
    };

    closeBtn.onclick = close;
    backdrop.onclick = close;

    qtyPlus.onclick = () => qtyInput.value = parseInt(qtyInput.value) + 1;
    qtyMinus.onclick = () => {
      if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    };

    container.querySelectorAll('.js-attr-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.js-attr-btn').forEach(b => b.classList.replace('border-lojaPrimaria', 'border-gray-100'));
        btn.classList.replace('border-gray-100', 'border-lojaPrimaria');
        selectedAttr = btn.getAttribute('data-attr');
      };
    });

    container.querySelectorAll('.js-color-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.js-color-btn').forEach(b => b.classList.replace('border-lojaPrimaria', 'border-gray-100'));
        btn.classList.replace('border-gray-100', 'border-lojaPrimaria');
        selectedColor = btn.getAttribute('data-color');
      };
    });

    addBtn.onclick = () => {
      if (product.attributes?.length > 0 && !selectedAttr) {
        alert("Por favor, selecione um tamanho.");
        return;
      }
      if (product.colors?.length > 0 && !selectedColor) {
        alert("Por favor, selecione uma cor.");
        return;
      }

      onAdd({
        quantity: parseInt(qtyInput.value),
        size: selectedAttr,
        color: selectedColor
      });

      const originalText = addBtn.innerText;
      addBtn.innerText = '✓ Adicionado!';
      addBtn.classList.add('bg-green-600');

      setTimeout(() => {
        close();
      }, 1000);
    };
  }
};
