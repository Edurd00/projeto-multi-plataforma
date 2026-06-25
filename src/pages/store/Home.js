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

      <!-- FOOTER MODERNO -->
      <footer class="bg-white border-t border-gray-100 pt-16 pb-24">
        <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div class="space-y-6">
            <h3 class="text-xl font-black text-gray-900 uppercase tracking-tight">${tenant.store_name || 'VITRINE'}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">${tenant.footer_bio || 'A melhor seleção de produtos para você, com entrega rápida e atendimento via WhatsApp.'}</p>
          </div>

          <div class="space-y-6">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">Navegação</h4>
            <ul class="space-y-3 text-sm font-bold text-gray-700">
              <li><a href="#" class="hover:text-lojaPrimaria transition">Início</a></li>
              <li><a href="#" class="hover:text-lojaPrimaria transition">Categorias</a></li>
              <li><a href="/?page=admin" class="hover:text-lojaPrimaria transition">Painel Administrativo</a></li>
            </ul>
          </div>

          <div class="space-y-6">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">Contato e Localização</h4>
            <ul class="space-y-3 text-sm text-gray-600">
              <li class="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>${tenant.address || 'Endereço não configurado'}</span>
              </li>
              <li class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>${tenant.whatsapp_number || ''}</span>
              </li>
            </ul>
          </div>

          <div class="space-y-6">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">Pagamento</h4>
            <div class="flex flex-wrap gap-2 opacity-50 grayscale">
              <img src="https://vignette.wikia.nocookie.net/logopedia/images/b/b2/Mastercard_2019.svg" class="h-6" alt="Mastercard" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" class="h-4" alt="Visa" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" class="h-5" alt="Paypal" />
              <img src="https://logopng.com.br/logos/pix-106.png" class="h-5" alt="Pix" />
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <p>© 2024 ${tenant.store_name || 'Vitrine'}. Todos os direitos reservados.</p>
          <div class="flex items-center gap-6">
             <a href="#" class="hover:text-gray-900 transition">Termos</a>
             <a href="#" class="hover:text-gray-900 transition">Privacidade</a>
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
    const placeholderImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;

    return filtered.map(prod => `
      <div class="js-product-card group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 cursor-pointer" data-id="${prod.id}">
        <div class="relative aspect-square w-full overflow-hidden bg-gray-50">
          <img
            src="${prod.image_url || ''}"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt="${prod.title}"
            onError="this.onerror=null; this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500';"
          />
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
