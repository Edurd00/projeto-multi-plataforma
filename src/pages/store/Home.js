import { supabase } from '../../config/supabase.js';

export const Home = {
  // Estado local controlado para filtragem em memória
  selectedCategoryId: null,
  allProducts: [],

  async render() {
    // 1. Busca produtos, categorias e as configurações da loja em paralelo
    const [productsRes, categoriesRes, tenantRes] = await Promise.all([
      supabase.from('products').select('*').eq('in_stock', true).order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('tenant_settings').select('*').maybeSingle()
    ]);

    this.allProducts = productsRes.data || [];
    const categories = categoriesRes.data || [];
    const tenantSettings = tenantRes.data || {};

    // 2. Fallbacks seguros caso o administrador não tenha preenchido os campos ainda
    const storeName = tenantSettings.store_name || 'Nossa Vitrine';
    const heroTitle = tenantSettings.hero_title || 'Bem-vindo à nossa Vitrine';
    const heroSubtitle = tenantSettings.hero_subtitle || 'Navegue pelas nossas categorias, monte seu carrinho e finalize seu pedido diretamente pelo WhatsApp de forma rápida e prática.';
    // Exemplo de como usar no seu componente de Home
    const heroStyle = tenantSettings.hero_image_url
      ? `background-image: url('${tenantSettings.hero_image_url}'); background-size: cover; background-position: center;`
      : 'background-color: #333;';

    // Aplique na sua tag da Hero:
    // <section style="${heroStyle}" class="relative h-[400px] ...">
    // Dados para o Footer
    const storePhone = tenantSettings.whatsapp_number || 'Não informado';
    const storeAddress = tenantSettings.address || 'Atendimento Online / Retirada a Combinar';

    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return `
      <!-- O CABEÇALHO ANTIGO FOI REMOVIDO DAQUI PARA ACABAR COM O BUG DA DUPLICIDADE -->

      <!-- BANNER HERO (AGORA É O TOPO REAL DA PÁGINA HOME) -->
      <section class="bg-gradient-to-r from-primary to-secondary text-white py-16 px-4 text-center">
        <div class="max-w-4xl mx-auto space-y-4">
          <h2 class="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight">
            ${heroTitle}
          </h2>
          <p class="text-base md:text-lg opacity-90 max-w-2xl mx-auto font-medium">
            ${heroSubtitle}
          </p>
        </div>
      </section>

      <main class="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        <!-- BARRA DE FILTRAGEM POR CATEGORIAS -->
        <section class="space-y-3">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Categorias</h3>
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="categories-filter-bar">
            <button 
              data-category-id="all" 
              class="js-category-btn px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap shadow-sm border ${!this.selectedCategoryId ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}"
            >
              Todos os Itens
            </button>
            ${categories.map(cat => {
      const isActive = this.selectedCategoryId === cat.id;
      return `
                <button 
                  data-category-id="${cat.id}" 
                  class="js-category-btn px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap shadow-sm border ${isActive ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}"
                >
                  ${cat.name}
                </button>
              `;
    }).join('')}
          </div>
        </section>

        <!-- LISTAGEM DE PRODUTOS -->
        <section class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-black text-gray-800 tracking-tight">Cardápio / Catálogo</h3>
          </div>
          
          <div id="products-grid-container" class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${this.renderProductsHTML(this.allProducts, formatCurrency)}
          </div>
        </section>

      </main>

      <!-- FOOTER COMPLETO COM REDES, CONTATO E ENDEREÇO -->
      <footer class="bg-white border-t border-gray-200 mt-16 py-10 px-4">
        <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-gray-100 pb-8">
          
          <!-- Coluna 1: Endereço -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Nosso Endereço</h4>
            <p class="text-sm text-gray-600 font-medium leading-relaxed">
              ${storeAddress}
            </p>
          </div>

          <!-- Coluna 2: Contato -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Canais de Contato</h4>
            <p class="text-sm text-gray-600 font-medium">
              <strong>WhatsApp / Tel:</strong> ${storePhone}
            </p>
          </div>

          <!-- Coluna 3: Redes Sociais (Apenas Ícones) -->
          <div class="space-y-2">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Siga-nos nas Redes</h4>
            <div class="flex items-center gap-3 pt-1">
              
              ${tenantSettings.instagram_url ? `
                <a href="${tenantSettings.instagram_url}" target="_blank" rel="noopener noreferrer" 
                   class="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-gray-600 hover:text-black transition-all flex items-center justify-center" 
                   title="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              ` : ''}

              ${tenantSettings.facebook_url ? `
                <a href="${tenantSettings.facebook_url}" target="_blank" rel="noopener noreferrer" 
                   class="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-gray-600 hover:text-black transition-all flex items-center justify-center" 
                   title="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
              ` : ''}

            </div>
          </div>
        </div>

        <!-- Créditos Inferiores -->
        <div class="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
          <p>&copy; 2026 ${storeName}. Todos os direitos reservados.</p>
          
          <a href="/?page=admin" class="hover:underline opacity-60 hover:opacity-100 transition-opacity">
            Área do Lojista
          </a>
        </div>
      </footer>
    `;
  },
  // 1. ADICIONE ESSA FUNÇÃO AQUI (O MODAL)
  openOptionModal(prod) {
    const modalHTML = `
      <div id="option-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl space-y-4">
          <h3 class="font-bold text-gray-800 text-lg">Selecione o tamanho:</h3>
          <p class="text-sm text-gray-600">${prod.title}</p>
          <div class="flex flex-wrap gap-2">
            ${prod.attributes.map(attr => `
              <button class="size-btn border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition">
                ${attr}
              </button>
            `).join('')}
          </div>
          <button id="close-modal" class="text-gray-400 text-sm underline w-full pt-2">Cancelar</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.onclick = () => {
        const selectedSize = btn.innerText;
        // Dispara o evento com o tamanho escolhido
        window.dispatchEvent(new CustomEvent('global:add-to-cart', {
          detail: { id: prod.id, size: selectedSize }
        }));
        document.getElementById('option-modal').remove();
      };
    });

    document.getElementById('close-modal').onclick = () => document.getElementById('option-modal').remove();
  },

  // 2. ATUALIZE O SEU BINDATTCARTBUTTONS COM ESTA LÓGICA
  bindAddToCartButtons(targetContainer) {
    targetContainer.querySelectorAll('.js-add-to-cart').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const prod = this.allProducts.find(p => p.id === id);

        // Verifica se o produto tem atributos (tamanhos)
        if (prod && prod.attributes && prod.attributes.length > 0) {
          this.openOptionModal(prod);
        } else {
          // Se não tiver, adiciona direto
          window.dispatchEvent(new CustomEvent('global:add-to-cart', { detail: { id } }));
        }
      };
    });
  },

  // Redesenha estritamente o grid de cards sem remontar a estrutura da página
  renderProductsHTML(products, formatCurrency) {
    const filtered = this.selectedCategoryId
      ? products.filter(p => p.category_id === this.selectedCategoryId)
      : products;

    if (filtered.length === 0) {
      return `
        <div class="col-span-full text-center py-12 text-gray-400 text-sm">
          Nenhum produto disponível nesta categoria no momento.
        </div>
      `;
    }

    return filtered.map(prod => {
      const hasPromo = prod.promo_price && prod.promo_price < prod.price;

      // Lógica para tratar os tamanhos (JSON no banco)
      const attributes = Array.isArray(prod.attributes) ? prod.attributes : [];

      return `
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition">
          <div class="relative overflow-hidden aspect-square bg-gray-50">
            <img src="${prod.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="${prod.title}" />
            ${hasPromo ? `<span class="absolute top-2 left-2 bg-red-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase shadow-sm">Promoção</span>` : ''}
          </div>
          
          <div class="p-3 flex-grow flex flex-col justify-between space-y-2">
            <div>
              <h4 class="text-sm font-bold text-gray-800 leading-tight">${prod.title}</h4>
              
              ${prod.description ? `<p class="text-[11px] text-gray-500 mt-1 line-clamp-2">${prod.description}</p>` : ''}
              
              ${attributes.length > 0 ? `
                <div class="mt-2 flex flex-wrap gap-1">
                  ${attributes.map(attr => `<span class="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-bold uppercase">${attr}</span>`).join('')}
                </div>
              ` : ''}
            </div>
            
            <div class="space-y-2">
              <div class="flex flex-col">
                ${hasPromo ? `
                  <span class="text-xs text-gray-400 line-through">${formatCurrency(prod.price)}</span>
                  <span class="text-base font-black text-red-600">${formatCurrency(prod.promo_price)}</span>
                ` : `
                  <span class="text-base font-black text-gray-900">${formatCurrency(prod.price)}</span>
                `}
              </div>
              
              <button data-id="${prod.id}" class="js-add-to-cart w-full bg-primary text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition hover:bg-opacity-95 shadow-sm">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  bindEvents(container) {
    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const gridContainer = container.querySelector('#products-grid-container');

    container.querySelectorAll('.js-category-btn').forEach(btn => {
      btn.onclick = () => {
        const catId = btn.getAttribute('data-category-id');
        this.selectedCategoryId = catId === 'all' ? null : catId;

        container.querySelectorAll('.js-category-btn').forEach(b => {
          b.className = "js-category-btn px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap shadow-sm border bg-white text-gray-600 border-gray-100 hover:bg-gray-50";
        });
        btn.className = "js-category-btn px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap shadow-sm border bg-primary text-white border-primary";

        if (gridContainer) {
          gridContainer.innerHTML = this.renderProductsHTML(this.allProducts, formatCurrency);
          this.bindAddToCartButtons(gridContainer);
        }
      };
    });

    this.bindAddToCartButtons(container);
  },

  // Dentro do seu Home.js, na função bindAddToCartButtons
  bindAddToCartButtons(targetContainer) {
    targetContainer.querySelectorAll('.js-add-to-cart').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const prod = this.allProducts.find(p => p.id === id);

        // Se tiver atributos (tamanhos), abre o modal de escolha
        if (prod.attributes && prod.attributes.length > 0) {
          this.openOptionModal(prod);
        } else {
          // Se não tiver, adiciona direto
          window.dispatchEvent(new CustomEvent('global:add-to-cart', { detail: { id } }));
        }
      };
    });
  }

};
