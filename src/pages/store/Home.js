import { api } from '../../services/api.js';

export const Home = {
  renderSkeleton() {
    return `
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-2 md:px-0 animate-pulse">
        ${Array(8).fill(0).map(() => `
          <div class="bg-white rounded-xl p-3 border border-gray-100 flex flex-col space-y-3">
            <div class="w-full aspect-square bg-gray-200 rounded-lg"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="h-8 bg-gray-200 rounded w-full mt-2"></div>
          </div>
        `).join('')}
      </div>
    `;
  },

  async render() {
    try {
      const [
        { data: products },
        { data: categories },
        { data: tenantSettings }
      ] = await Promise.all([
        api.products.getAll({ storefrontOnly: true }),
        api.categories.getAll(),
        api.tenant.get()
      ]);

      const isStoreOpen = tenantSettings?.is_open !== false;

      return `
        <div class="min-h-screen bg-gray-50 pb-16">
          ${!isStoreOpen ? `
            <div class="bg-amber-500 text-white text-center py-2 px-4 font-semibold text-sm shadow-inner flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              No momento nossa loja está fechada para novos pedidos.
            </div>
          ` : ''}

          <!-- HERO SECTION -->
          <div class="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-lg">
            <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div class="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
              <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 drop-shadow-md">
                ${tenantSettings?.store_name || 'Bem-vindo à nossa Loja'}
              </h1>
              <p class="text-base md:text-lg text-gray-300 max-w-2xl mb-6">
                Explore as melhores ofertas e produtos de alta qualidade com entrega rápida.
              </p>
              
              <!-- SEARCH BAR -->
              <div class="w-full max-w-xl relative">
                <input
                  type="text"
                  id="search-input"
                  placeholder="Buscar produtos por nome ou descrição..."
                  class="w-full pl-11 pr-4 py-3 rounded-full text-gray-800 bg-white shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500 transition text-sm md:text-base"
                />
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- CATEGORIES BAR (STICKY) -->
          <div class="sticky top-[73px] z-30 bg-white/80 backdrop-blur-md border-b shadow-sm">
            <div class="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none items-center" id="categories-container">
              <button class="category-btn active bg-gray-900 text-white px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition shadow-sm" data-category="">
                Todos os Produtos
              </button>
              ${categories?.map(c => `
                <button class="category-btn bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition shadow-sm" data-category="${c.id}">
                  ${c.name}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- PRODUCT LISTING -->
          <main class="max-w-6xl mx-auto px-4 mt-8">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl md:text-2xl font-bold text-gray-800 tracking-tight" id="section-title">
                Produtos em Destaque
              </h2>
              <span class="text-xs md:text-sm text-gray-500 font-medium" id="product-count">
                ${products?.length || 0} produtos encontrados
              </span>
            </div>

            <!-- PRODUCT GRID -->
            <div id="product-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 px-2 md:px-0 transition-opacity duration-300">
              ${this.renderProductsHTML(products)}
            </div>
          </main>
        </div>
      `;
    } catch (error) {
      console.error('Erro ao renderizar Home:', error);
      return `<div class="p-8 text-center text-red-600 font-bold">Erro ao carregar vitrine.</div>`;
    }
  },

  renderProductsHTML(products) {
    if (!products || products.length === 0) {
      return `
        <div class="col-span-full py-16 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-lg font-semibold">Nenhum produto encontrado</p>
          <p class="text-xs text-gray-400 mt-1">Tente ajustar a busca ou filtrar por outra categoria.</p>
        </div>
      `;
    }

    return products.map(product => {
      const hasPromo = product.promo_price && product.promo_price < product.price;
      const discount = hasPromo ? Math.round(((product.price - product.promo_price) / product.price) * 100) : 0;

      return `
        <div class="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col group">
          <div class="relative overflow-hidden aspect-square bg-gray-100">
            ${hasPromo ? `
              <span class="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                ${discount}% OFF
              </span>
            ` : ''}
            <img
              src="${product.image_url}"
              alt="${product.title}"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';"
              class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>

          <div class="p-3 flex flex-col flex-1 justify-between">
            <div>
              <h3 class="font-bold text-gray-800 text-xs md:text-sm line-clamp-2 leading-tight mb-1">
                ${product.title}
              </h3>
              <p class="text-[11px] text-gray-500 line-clamp-2 mb-2">
                ${product.description || ''}
              </p>
            </div>

            <div class="mt-2">
              <div class="flex items-baseline gap-1.5 mb-2">
                ${hasPromo ? `
                  <span class="text-xs md:text-sm font-extrabold text-red-600">R$ ${product.promo_price.toFixed(2)}</span>
                  <span class="text-[11px] text-gray-400 line-through">R$ ${product.price.toFixed(2)}</span>
                ` : `
                  <span class="text-xs md:text-sm font-extrabold text-gray-900">R$ ${product.price.toFixed(2)}</span>
                `}
              </div>

              <button
                class="add-to-cart-btn w-full bg-gray-900 text-white hover:bg-gray-800 text-xs py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1"
                data-id="${product.id}"
                data-sizes='${JSON.stringify(product.sizes || [])}'
                data-colors='${JSON.stringify(product.colors || [])}'
              >
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  bindEvents(container) {
    if (!container) return;

    let selectedCategory = '';
    let searchQuery = '';

    const filterProducts = async () => {
      const grid = container.querySelector('#product-grid');
      const countSlot = container.querySelector('#product-count');
      if (grid) {
        grid.innerHTML = this.renderSkeleton();
      }

      const { data: products } = await api.products.getAll({
        categoryId: selectedCategory,
        searchQuery: searchQuery,
        storefrontOnly: true
      });

      if (grid) {
        grid.innerHTML = this.renderProductsHTML(products);
        this.bindProductButtons(container);
      }

      if (countSlot) {
        countSlot.innerText = `${products?.length || 0} produtos encontrados`;
      }
    };

    // Filtro de Categorias
    const catButtons = container.querySelectorAll('.category-btn');
    catButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        catButtons.forEach(b => {
          b.classList.remove('bg-gray-900', 'text-white');
          b.classList.add('bg-gray-100', 'text-gray-700');
        });
        btn.classList.remove('bg-gray-100', 'text-gray-700');
        btn.classList.add('bg-gray-900', 'text-white');

        selectedCategory = btn.getAttribute('data-category');
        filterProducts();
      });
    });

    // Busca com Debounce leve
    const searchInput = container.querySelector('#search-input');
    if (searchInput) {
      let timeout = null;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          searchQuery = e.target.value.trim();
          filterProducts();
        }, 300);
      });
    }

    this.bindProductButtons(container);
  },

  bindProductButtons(container) {
    const addBtns = container.querySelectorAll('.add-to-cart-btn');
    addBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const sizes = JSON.parse(btn.getAttribute('data-sizes') || '[]');
        const colors = JSON.parse(btn.getAttribute('data-colors') || '[]');

        // Micro interatividade visual
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="text-emerald-400">✓ Adicionado!</span>`;
        setTimeout(() => { btn.innerHTML = originalText; }, 1500);

        window.dispatchEvent(new CustomEvent('global:add-to-cart', {
          detail: {
            id,
            size: sizes.length > 0 ? sizes[0] : 'N/A',
            color: colors.length > 0 ? colors[0] : 'N/A'
          }
        }));
      });
    });
  }
};
