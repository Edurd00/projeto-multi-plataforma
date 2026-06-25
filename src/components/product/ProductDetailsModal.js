export const ProductDetailsModal = {
  render(product) {
    const hasDiscount = product.promo_price && product.promo_price < product.price;
    const finalPrice = hasDiscount ? product.promo_price : product.price;
    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return `
      <div id="product-modal-root" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="modal-backdrop"></div>

        <div class="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto md:overflow-visible">
          <!-- Botão Fechar no Card Expandido -->
          <button id="close-product-modal" class="absolute top-4 right-4 z-20 bg-white shadow-xl border border-gray-100 p-2.5 rounded-full hover:scale-110 transition-all font-bold text-gray-800 flex items-center gap-1 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            <span>Fechar</span>
          </button>

          <div class="w-full md:w-1/2 aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
            <!-- Fim do Vazamento no Card Expandido -->
            <img
              src="${product.image_url || ''}"
              class="w-full h-full object-cover rounded-lg"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';"
            />
          </div>

          <div class="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between bg-white">
            <div class="space-y-6">
              <div>
                <span class="text-[10px] font-black text-lojaPrimaria uppercase tracking-[0.2em]">${product.categories?.name || 'Geral'}</span>
                <h2 class="text-2xl md:text-4xl font-black text-gray-900 leading-tight mt-1">${product.title}</h2>
              </div>

              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-black text-gray-900">${formatCurrency(finalPrice)}</span>
                ${hasDiscount ? `<span class="text-base text-gray-400 line-through font-bold">${formatCurrency(product.price)}</span>` : ''}
              </div>

              <div class="space-y-2">
                <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição</h4>
                <p class="text-gray-600 leading-relaxed text-sm">${product.description || 'Nenhuma descrição detalhada.'}</p>
              </div>

              <!-- Grade de Cores (Nova Sub-categoria) -->
              ${product.colors && product.colors.length > 0 ? `
                <div class="space-y-3">
                  <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cores Disponíveis</h4>
                  <div class="flex flex-wrap gap-2">
                    ${product.colors.map(color => `
                      <button class="js-color-btn px-4 py-2 border-2 border-gray-100 rounded-2xl text-xs font-black transition-all hover:border-lojaPrimaria active:scale-95" data-color="${color}">${color}</button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              ${product.attributes && product.attributes.length > 0 ? `
                <div class="space-y-3">
                  <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tamanhos</h4>
                  <div class="flex flex-wrap gap-2">
                    ${product.attributes.map(attr => `
                      <button class="js-attr-btn px-4 py-2 border-2 border-gray-100 rounded-2xl text-xs font-black transition-all hover:border-lojaPrimaria active:scale-95" data-attr="${attr}">${attr}</button>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>

            <div class="mt-8 pt-6 border-t border-gray-50 flex items-center gap-4">
              <div class="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                <button id="qty-minus" class="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition text-gray-500 font-bold">-</button>
                <input type="number" id="qty-input" value="1" min="1" class="w-8 text-center font-black text-gray-900 bg-transparent focus:outline-none text-sm" readonly />
                <button id="qty-plus" class="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-xl transition text-gray-500 font-bold">+</button>
              </div>
              <button id="modal-add-to-cart" class="flex-grow bg-lojaPrimaria text-white font-black py-4 rounded-2xl shadow-xl shadow-lojaPrimaria/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest">
                Adicionar
              </button>
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
      root.classList.add('animate-out', 'fade-out', 'zoom-out');
      setTimeout(() => root.remove(), 300);
    };

    closeBtn.onclick = close;
    backdrop.onclick = (e) => { if(e.target === backdrop) close(); };

    qtyPlus.onclick = () => qtyInput.value = parseInt(qtyInput.value) + 1;
    qtyMinus.onclick = () => {
      if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    };

    container.querySelectorAll('.js-attr-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.js-attr-btn').forEach(b => {
            b.classList.remove('bg-lojaPrimaria', 'text-white', 'border-lojaPrimaria');
            b.classList.add('border-gray-100');
        });
        btn.classList.remove('border-gray-100');
        btn.classList.add('bg-lojaPrimaria', 'text-white', 'border-lojaPrimaria');
        selectedAttr = btn.getAttribute('data-attr');
      };
    });

    container.querySelectorAll('.js-color-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.js-color-btn').forEach(b => {
            b.classList.remove('bg-lojaPrimaria', 'text-white', 'border-lojaPrimaria');
            b.classList.add('border-gray-100');
        });
        btn.classList.remove('border-gray-100');
        btn.classList.add('bg-lojaPrimaria', 'text-white', 'border-lojaPrimaria');
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
      close();
    };
  }
};
