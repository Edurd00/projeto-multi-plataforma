import { supabase } from '../../config/supabase.js';
import { ProductDetailsModal } from '../../components/product/ProductDetailsModal.js';

export const Home = {
  selectedCategoryId: null,
  allProducts: [],

  async render() {
    const [productsRes, categoriesRes, tenantRes] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('tenant_settings').select('*').maybeSingle()
    ]);

    this.allProducts = productsRes.data || [];
    const categories = categoriesRes.data || [];
    const tenant = tenantRes.data || {};

    const heroStyle = tenant.hero_image_url
      ? `style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${tenant.hero_image_url}'); background-size: cover; background-position: center;"`
      : 'class="bg-gradient-to-br from-lojaPrimaria to-lojaSecundaria"';

    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return `
      <section class="relative w-full h-[500px] flex items-center justify-center text-center px-4" ${heroStyle.startsWith('style') ? heroStyle : ''} ${heroStyle.startsWith('class') ? heroStyle : ''}>
        <div class="max-w-4xl mx-auto space-y-6 relative z-10 text-white">
          <h2 class="text-5xl md:text-7xl font-black uppercase tracking-tight">${tenant.hero_title || 'Bem-vindo'}</h2>
          <p class="text-xl md:text-2xl font-medium">${tenant.hero_subtitle || ''}</p>
        </div>
      </section>

      <main class="max-w-7xl mx-auto px-4 py-12 space-y-16">
        <section class="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
          <button data-category-id="all" class="js-category-btn px-6 py-3 rounded-full text-sm font-bold transition-all border ${!this.selectedCategoryId ? 'bg-lojaPrimaria text-white' : 'bg-white text-gray-600 border-gray-100'}">Todos</button>
          ${categories.map(cat => `
            <button data-category-id="${cat.id}" class="js-category-btn px-6 py-3 rounded-full text-sm font-bold transition-all border ${this.selectedCategoryId === cat.id ? 'bg-lojaPrimaria text-white' : 'bg-white text-gray-600 border-gray-100'}">${cat.name}</button>
          `).join('')}
        </section>

        <section id="products-grid-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          ${this.renderProductsHTML(this.allProducts, formatCurrency)}
        </section>
      </main>
    `;
  },

  renderProductsHTML(products, formatCurrency) {
    const filtered = this.selectedCategoryId ? products.filter(p => p.category_id === this.selectedCategoryId) : products;
    const placeholderImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;

    return filtered.map(prod => `
      <div class="js-product-card group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-pointer" data-id="${prod.id}">
        <div class="relative aspect-square w-full overflow-hidden bg-gray-50">
          <img src="${prod.image_url || ''}" onerror="this.src='${placeholderImg}'; this.className='absolute inset-0 m-auto w-1/3 h-1/3 opacity-20';" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${prod.title}" />
        </div>
        <div class="p-6 space-y-4">
          <div>
            <span class="text-[10px] font-black text-lojaPrimaria uppercase tracking-widest">${prod.categories?.name || 'Geral'}</span>
            <h4 class="text-lg font-black text-gray-900 leading-tight">${prod.title}</h4>
          </div>
          <div class="flex items-center justify-between pt-4 border-t border-gray-50">
            <span class="text-xl font-black text-gray-900">${formatCurrency(prod.promo_price || prod.price)}</span>
            <button class="js-quick-add bg-gray-900 text-white p-3 rounded-2xl hover:bg-lojaPrimaria transition-all"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></button>
          </div>
        </div>
      </div>
    `).join('');
  },

  bindEvents(container) {
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    container.querySelectorAll('.js-category-btn').forEach(btn => {
      btn.onclick = () => {
        this.selectedCategoryId = btn.dataset.categoryId === 'all' ? null : btn.dataset.categoryId;
        container.querySelector('#products-grid-container').innerHTML = this.renderProductsHTML(this.allProducts, formatCurrency);
        this.bindCardEvents(container);
      };
    });
    this.bindCardEvents(container);
  },

  bindCardEvents(container) {
    container.querySelectorAll('.js-product-card').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('.js-quick-add')) return;
        const prod = this.allProducts.find(p => p.id === card.dataset.id);
        const modalContainer = document.getElementById('product-modal-container');
        if (modalContainer) {
          modalContainer.innerHTML = ProductDetailsModal.render(prod);
          ProductDetailsModal.bindEvents(modalContainer, prod, (detail) => {
             window.dispatchEvent(new CustomEvent('global:add-to-cart', { detail: { id: prod.id, ...detail } }));
          });
        }
      };
    });
    container.querySelectorAll('.js-quick-add').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const card = btn.closest('.js-product-card');
        if (card) {
          window.dispatchEvent(new CustomEvent('global:add-to-cart', { detail: { id: card.dataset.id } }));
        }
      };
    });
  }
};
