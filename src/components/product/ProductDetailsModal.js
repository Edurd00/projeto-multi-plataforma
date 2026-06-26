export const ProductDetailsModal = {
  render(product) {
    const hasDiscount = product.promo_price && product.promo_price < product.price;
    const finalPrice = hasDiscount ? product.promo_price : product.price;
    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const placeholderImg = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500";

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
              onerror="this.onerror=null; this.src='${placeholderImg}';"
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
                  <div class="flex justify-between items-center">
                    <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selecione o Tamanho</h4>
                    <span id="selected-size-label" class="text-[10px] font-bold text-lojaPrimaria uppercase"></span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    ${product.attributes.map(attr => `
                      <button class="js-attr-btn px-5 py-2.5 border-2 border-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider hover:border-gray-300 transition-all active:scale-95" data-attr="${attr}">${attr}</button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${product.colors && product.colors.length > 0 ? `
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escolha a Cor</h4>
                    <span id="selected-color-label" class="text-[10px] font-bold text-lojaPrimaria uppercase"></span>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    ${product.colors.map(color => `
                      <button class="js-color-btn px-5 py-2.5 border-2 border-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider hover:border-gray-300 transition-all active:scale-95" data-color="${color}">${color}</button>
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
        container.querySelectorAll('.js-attr-btn').forEach(b => {
          b.classList.remove('border-lojaPrimaria', 'bg-lojaPrimaria/5', 'text-lojaPrimaria');
          b.classList.add('border-gray-100');
        });
        btn.classList.remove('border-gray-100');
        btn.classList.add('border-lojaPrimaria', 'bg-lojaPrimaria/5', 'text-lojaPrimaria');
        selectedAttr = btn.getAttribute('data-attr');
        const label = container.querySelector('#selected-size-label');
        if (label) label.innerText = selectedAttr;
      };
    });

    container.querySelectorAll('.js-color-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.js-color-btn').forEach(b => {
          b.classList.remove('border-lojaPrimaria', 'bg-lojaPrimaria/5', 'text-lojaPrimaria');
          b.classList.add('border-gray-100');
        });
        btn.classList.remove('border-gray-100');
        btn.classList.add('border-lojaPrimaria', 'bg-lojaPrimaria/5', 'text-lojaPrimaria');
        selectedColor = btn.getAttribute('data-color');
        const label = container.querySelector('#selected-color-label');
        if (label) label.innerText = selectedColor;
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
      close();
    };
  }
};
