import { supabase } from '../../config/supabase.js';
import { ProductDetailsModal } from '../../components/product/ProductDetailsModal.js';

export const Home = {
  selectedCategoryId: null,
  allProducts: [],

  async render() {
    try {
      const [productsRes, categoriesRes, tenantRes] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('tenant_settings').select('*').maybeSingle()
      ]);

      if (productsRes.error) console.error("Erro produtos:", productsRes.error);
      if (categoriesRes.error) console.error("Erro categorias:", categoriesRes.error);
      if (tenantRes.error) console.error("Erro tenant:", tenantRes.error);

      this.allProducts = productsRes.data || [];
      const categories = categoriesRes.data || [];
      const tenant = tenantRes.data || {};

      const heroStyle = tenant.hero_image_url
        ? `style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${tenant.hero_image_url}'); background-size: cover; background-position: center;"`
        : `style="background-color: var(--cor-primaria, ${tenant.primary_color || '#3b82f6'});"`;

      const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

      return `
        <section class="relative w-full h-[400px] md:h-[500px] flex items-center justify-center text-center px-4" ${heroStyle}>
          <div class="max-w-4xl mx-auto space-y-4 md:space-y-6 relative z-10 text-white drop-shadow-2xl">
            <h2 class="text-4xl md:text-7xl font-black uppercase tracking-tight leading-none">${tenant.hero_title || 'Bem-vindo'}</h2>
            <p class="text-lg md:text-2xl font-medium opacity-90">${tenant.hero_subtitle || ''}</p>
          </div>
          <div class="absolute inset-0 bg-black/20 pointer-events-none"></div>
        </section>

        <main class="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-16">
          <section class="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
            <button data-category-id="all" class="js-category-btn whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all border ${!this.selectedCategoryId ? 'bg-lojaPrimaria text-white shadow-lg shadow-lojaPrimaria/20 border-lojaPrimaria' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'}">Todos</button>
            ${categories.map(cat => `
              <button data-category-id="${cat.id}" class="js-category-btn whitespace-nowrap px-6 py-3 rounded-full text-sm font-bold transition-all border ${this.selectedCategoryId === cat.id ? 'bg-lojaPrimaria text-white shadow-lg shadow-lojaPrimaria/20 border-lojaPrimaria' : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'}">${cat.name}</button>
            `).join('')}
          </section>

          <section id="products-grid-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 px-1 md:px-0">
            ${this.renderProductsHTML(this.allProducts, formatCurrency)}
          </section>
        </main>

        <!-- RODAPÉ MODERNO E COMPACTO -->
        <footer class="bg-white border-t border-gray-100 pt-12 pb-20">
          <div class="max-w-4xl mx-auto px-4 text-center space-y-8">
            <div class="space-y-4">
              <h3 class="text-lg font-black text-gray-900 uppercase tracking-tighter">${tenant.store_name || 'VITRINE'}</h3>
              <p class="text-xs text-gray-500 leading-relaxed max-w-md mx-auto font-medium">${tenant.footer_bio || 'A melhor seleção de produtos para você, com entrega rápida e atendimento via WhatsApp.'}</p>
            </div>

            <div class="flex flex-col items-center gap-6">
              <div class="flex items-center justify-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <a href="#" class="hover:text-lojaPrimaria transition">Início</a>
                <span class="w-1 h-1 bg-gray-200 rounded-full"></span>
                <a href="/?page=admin" class="hover:text-lojaPrimaria transition">Painel</a>
                <span class="w-1 h-1 bg-gray-200 rounded-full"></span>
                <a href="#" class="hover:text-lojaPrimaria transition">Termos</a>
              </div>

              <!-- Ícones Sociais Minimalistas -->
              <div class="flex justify-center gap-4 mt-3">
                ${tenant.instagram_url && tenant.instagram_url !== '#' ? `
                  <a href="${tenant.instagram_url}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-gray-100 hover:bg-gradient-to-tr hover:from-yellow-500 hover:to-purple-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-sm" title="Instagram">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                ` : ''}

                ${tenant.facebook_url && tenant.facebook_url !== '#' ? `
                  <a href="${tenant.facebook_url}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-sm" title="Facebook">
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                ` : ''}
              </div>
            </div>

            <div class="pt-8 border-t border-gray-50">
                <p class="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">© 2024 ${tenant.store_name || 'Vitrine'}</p>
            </div>
          </div>
        </footer>

        <!-- BOTÃO WHATSAPP FLUTUANTE -->
        <a href="https://wa.me/${tenant.whatsapp_number?.replace(/\D/g, '')}" target="_blank" class="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 active:scale-95 group">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.52.909 3.284 1.389 5.083 1.391 5.446.002 9.879-4.431 9.882-9.88.001-2.641-1.03-5.124-2.903-6.999-1.872-1.875-4.355-2.908-6.998-2.908-5.448 0-9.881 4.432-9.884 9.881-.001 1.838.513 3.633 1.488 5.191l-.991 3.616 3.702-.972zm10.177-6.238c-.276-.138-1.636-.808-1.89-.9-.252-.092-.437-.138-.62.138-.184.276-.712.9-.873 1.084-.159.184-.32.207-.597.069-.276-.138-1.169-.431-2.227-1.374-.824-.735-1.38-1.644-1.541-1.921-.161-.276-.017-.425.12-.563.125-.124.276-.322.415-.483.138-.161.184-.276.276-.46.092-.184.046-.345-.023-.483-.069-.138-.62-1.495-.85-2.046-.224-.541-.47-.466-.645-.475-.165-.008-.354-.01-.543-.01s-.497.071-.757.345c-.26.274-1 1.009-1 2.459s1.055 2.846 1.203 3.045c.148.199 2.077 3.172 5.031 4.449.703.304 1.252.486 1.679.622.705.226 1.348.194 1.856.118.566-.085 1.636-.669 1.865-1.315.23-.647.23-1.201.161-1.315-.069-.115-.253-.207-.529-.345z"/></svg>
          <span class="absolute right-full mr-3 bg-gray-900 text-white text-xs font-bold py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Fale Conosco</span>
        </a>
      `;
    } catch (err) {
      console.error("Erro ao renderizar Home:", err);
      return `<div class="p-20 text-center">
        <h2 class="text-2xl font-black text-gray-900">Ops! Algo deu errado.</h2>
        <p class="text-gray-500 mt-2">${err.message}</p>
        <button onclick="location.reload()" class="mt-6 bg-lojaPrimaria text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Tentar Novamente</button>
      </div>`;
    }
  },

  renderProductsHTML(products, formatCurrency) {
    const filtered = this.selectedCategoryId ? products.filter(p => p.category_id === this.selectedCategoryId) : products;

    return filtered.map(prod => {
      const displayPrice = prod.promo_price || prod.price;
      const priceFrom = prod.promo_price ? prod.price : null;
      const temDesconto = priceFrom && Number(priceFrom) > Number(displayPrice);

      return `
        <div class="js-product-card group bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col h-full relative" data-id="${prod.id}">

          ${temDesconto ? `<span class="absolute top-2 left-2 md:top-3 md:left-3 bg-red-600 text-white text-[8px] md:text-[10px] font-black uppercase px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-md z-10 shadow-sm animate-pulse">PROMO</span>` : ''}

          <div class="aspect-square w-full overflow-hidden bg-gray-50 relative">
            <img
              src="${prod.image_url || ''}"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt="${prod.title || 'Produto'}"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';"
            />
          </div>
          <div class="p-2 md:p-4 flex flex-col flex-grow">
            <span class="text-[9px] md:text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5 md:mb-1">${prod.categories?.name || 'Geral'}</span>
            <h3 class="font-semibold text-gray-800 text-[11px] md:text-sm line-clamp-2 mb-1 md:mb-2 flex-grow">${prod.title}</h3>
            <div class="flex flex-col md:flex-row md:items-baseline justify-between mt-auto pt-1 md:pt-2 gap-1">
              <div class="flex items-baseline gap-1 md:gap-1.5 flex-wrap">
                ${temDesconto ? `<span class="text-[9px] md:text-xs text-gray-400 line-through">R$ ${priceFrom}</span>` : ''}
                <span class="text-sm md:text-base font-bold ${temDesconto ? 'text-red-600' : 'text-gray-900'}">${formatCurrency(displayPrice)}</span>
              </div>
              <button class="js-quick-add w-full md:w-auto bg-lojaPrimaria text-white px-2 md:px-3 py-1.5 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold hover:opacity-90 transition">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  bindEvents(container) {
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    container.querySelectorAll('.js-category-btn').forEach(btn => {
      btn.onclick = () => {
        this.selectedCategoryId = btn.dataset.categoryId === 'all' ? null : btn.dataset.categoryId;

        // Update active state classes
        container.querySelectorAll('.js-category-btn').forEach(b => {
          b.classList.remove('bg-lojaPrimaria', 'text-white', 'shadow-lg', 'shadow-lojaPrimaria/20', 'border-lojaPrimaria');
          b.classList.add('bg-white', 'text-gray-600', 'border-gray-100');
        });
        btn.classList.remove('bg-white', 'text-gray-600', 'border-gray-100');
        btn.classList.add('bg-lojaPrimaria', 'text-white', 'shadow-lg', 'shadow-lojaPrimaria/20', 'border-lojaPrimaria');

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
