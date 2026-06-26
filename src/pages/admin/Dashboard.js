import { supabase } from '../../config/supabase.js';
import { injectTheme } from '../../config/theme.js';
import { ImageUpload } from '../../components/ImageUpload.js';

export const Dashboard = {
  searchQuery: '',
  activeTab: 'products', // 'products' or 'orders'
  isDarkMode: localStorage.getItem('admin-dark-mode') === 'true',

  async render() {
    try {
      const [ordersRes, productsRes, categoriesRes, tenantRes] = await Promise.all([
        supabase.from('orders').select('*, order_items(*, products(title))').order('created_at', { ascending: false }),
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('tenant_settings').select('*').maybeSingle()
      ]);

      const orders = ordersRes.data || [];
      let products = productsRes.data || [];
      const categories = categoriesRes.data || [];
      const tenant = tenantRes.data || {};

      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Filter products based on search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        products = products.filter(p =>
          p.title.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.categories?.name && p.categories.name.toLowerCase().includes(query))
        );
      }

      const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

      return `
        <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 md:p-8">
          <div class="max-w-7xl mx-auto space-y-8">

            <!-- TOP BAR -->
            <div class="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div class="flex items-center gap-4">
                <button id="toggle-dark-mode" class="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:scale-110 transition">
                  ${this.isDarkMode
                    ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>`
                    : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`
                  }
                </button>
                <div class="h-6 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
                <button id="toggle-store-status" class="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition ${tenant.is_open !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                   <div class="w-2 h-2 rounded-full animate-pulse ${tenant.is_open !== false ? 'bg-green-500' : 'bg-red-500'}"></div>
                   ${tenant.is_open !== false ? 'LOJA ABERTA' : 'LOJA FECHADA'}
                </button>
              </div>

              <div class="flex items-center gap-2">
                <button id="tab-products" class="px-4 py-2 rounded-xl text-xs font-black transition ${this.activeTab === 'products' ? 'bg-lojaPrimaria text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}">PRODUTOS</button>
                <button id="tab-orders" class="px-4 py-2 rounded-xl text-xs font-black transition ${this.activeTab === 'orders' ? 'bg-lojaPrimaria text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}">PEDIDOS</button>
              </div>
            </div>

            <!-- CABEÇALHO ADMIN -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div>
                <h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Painel de Controle</h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Gerenciando: <span class="text-lojaPrimaria font-bold">${tenant.store_name || 'Nova Loja'}</span></p>
              </div>
              <div class="flex items-center gap-3 w-full md:w-auto">
                <a href="/" class="flex-grow md:flex-grow-0 text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold px-6 py-3 rounded-2xl text-sm transition">
                  Ver Vitrine
                </a>
              </div>
            </div>

            ${this.activeTab === 'products' ? this.renderProductsTab(products, categories, tenant, formatCurrency) : this.renderOrdersTab(orders, formatCurrency)}

          </div>
        </div>

        <!-- MODAL DE EXCLUSÃO -->
        <div id="delete-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 hidden">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-8 relative shadow-2xl border border-gray-100 dark:border-gray-700">
            <h3 class="text-center text-xl font-black text-gray-900 dark:text-white mb-2">Confirmar Exclusão</h3>
            <p class="text-center text-gray-500 dark:text-gray-400 text-sm mb-2">Deseja excluir <span id="delete-item-name" class="font-bold text-gray-900 dark:text-white"></span>?</p>
            <p class="text-center text-red-500 text-[10px] font-bold uppercase tracking-widest mb-8">Esta ação não poderá ser desfeita.</p>
            <div class="grid grid-cols-2 gap-4">
              <button id="btn-cancel-delete" class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-2xl hover:bg-gray-200 transition">Cancelar</button>
              <button id="btn-confirm-delete" class="bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition">Excluir</button>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      console.error("FALHA CRÍTICA NO DASHBOARD:", err);
      return `<div class="p-20 text-center text-red-500 font-bold bg-white rounded-3xl shadow-xl">Erro: ${err.message}</div>`;
    }
  },

  renderProductsTab(products, categories, tenant, formatCurrency) {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- COLUNA ESQUERDA: CONFIGS & FORM -->
        <div class="lg:col-span-5 space-y-8">

          <!-- CONFIGURAÇÕES -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button onclick="document.getElementById('tenant-form-body').classList.toggle('hidden')" class="w-full p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center group">
              <h3 class="font-black text-gray-900 dark:text-white text-lg">Configurações da Loja</h3>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-lojaPrimaria transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>

            <form id="admin-tenant-form" class="p-6 space-y-6 hidden" id="tenant-form-body">
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Nome da Marca</label>
                  <input type="text" id="conf-name" value="${tenant.store_name || ''}" required class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-lojaPrimaria transition" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${ImageUpload.render('logo', tenant.logo_url, 'Logotipo')}
                  ${ImageUpload.render('hero', tenant.hero_image_url, 'Banner Hero')}
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Cor Primária</label>
                    <input type="color" id="conf-primary" value="${tenant.primary_color || '#3b82f6'}" class="w-full h-10 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Cor Secundária</label>
                    <input type="color" id="conf-secondary" value="${tenant.secondary_color || '#1e3a8a'}" class="w-full h-10 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-900" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">WhatsApp</label>
                  <input type="text" id="conf-phone" value="${tenant.whatsapp_number || ''}" required class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm dark:text-white focus:ring-2 focus:ring-lojaPrimaria" />
                </div>
              </div>
              <button type="submit" class="w-full bg-lojaPrimaria text-white font-black py-4 rounded-2xl shadow-lg hover:scale-[1.01] transition">Salvar Configurações</button>
            </form>
          </div>

          <!-- FORM PRODUTO -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
            <h3 class="font-black text-gray-900 dark:text-white text-lg" id="product-form-title">Novo Produto</h3>
            <form id="admin-product-form" class="space-y-4">
              <input type="hidden" id="prod-id" value="" />
              <input type="text" id="prod-title" required class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm dark:text-white" placeholder="Título do Produto" />

              <div class="grid grid-cols-2 gap-4">
                <select id="prod-category" required class="bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm dark:text-white">
                  <option value="" disabled selected>Categoria...</option>
                  ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                  <option value="new">+ Criar Nova</option>
                </select>
                <input type="text" id="new-category-name" class="hidden bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl p-3 text-sm dark:text-white" placeholder="Nome da Categoria" />
                <input type="number" id="prod-stock" value="10" required class="bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm dark:text-white" placeholder="Estoque" />
              </div>

              <textarea id="prod-description" class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm dark:text-white h-24" placeholder="Descrição Detalhada"></textarea>

              <div class="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" id="prod-price" required class="bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm dark:text-white" placeholder="Preço (R$)" />
                <input type="number" step="0.01" id="prod-promo" class="bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm dark:text-white" placeholder="Promoção (Opcional)" />
              </div>

              ${ImageUpload.render('prod', '', 'Imagem do Produto')}

              <input type="text" id="prod-attributes" class="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl p-3 text-sm dark:text-white" placeholder="Atributos: P, M, G ou Azul, Verde" />

              <button type="submit" id="btn-product-submit" class="w-full bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-green-700 transition">Adicionar ao Catálogo</button>
            </form>
          </div>
        </div>

        <!-- COLUNA DIREITA: LISTAGEM -->
        <div class="lg:col-span-7 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h3 class="font-black text-gray-900 dark:text-white text-lg">Seus Produtos</h3>
              <div class="relative w-full md:w-64">
                <input type="text" id="admin-search" value="${this.searchQuery}" placeholder="Buscar produto..." class="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs dark:text-white focus:ring-2 focus:ring-lojaPrimaria transition" />
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin">
              ${products.map(prod => {
                const temDesconto = prod.promo_price && Number(prod.price) > Number(prod.promo_price);
                const isCritical = (prod.stock || 0) <= 3;
                return `
                  <div class="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition shadow-sm">
                    <div class="flex items-center gap-4 min-w-0">
                      <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src="${prod.image_url || ''}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100';" />
                        ${!prod.is_active ? `<div class="absolute inset-0 bg-black/60 flex items-center justify-center"><span class="text-[8px] text-white font-black">PAUSADO</span></div>` : ''}
                      </div>
                      <div class="min-w-0">
                        <h4 class="text-sm font-bold text-gray-900 dark:text-white truncate">${prod.title}</h4>
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-xs font-black text-lojaPrimaria">${formatCurrency(prod.promo_price || prod.price)}</span>
                          <span class="text-[10px] text-gray-400 font-bold uppercase">${prod.categories?.name || 'Geral'}</span>
                        </div>
                        <div class="flex items-center gap-2 mt-1">
                          ${isCritical
                            ? `<span class="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-lg border border-red-100 animate-pulse">⚠️ ESTOQUE CRÍTICO: ${prod.stock || 0}</span>`
                            : `<span class="text-[10px] text-gray-500">Estoque: ${prod.stock || 0} un</span>`
                          }
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                       <button onclick="window.toggleProductActive('${prod.id}', ${!prod.is_active})" class="p-2 rounded-xl transition ${prod.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}" title="${prod.is_active ? 'Pausar' : 'Ativar'}">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       </button>
                       <button onclick="window.cloneProduct('${prod.id}')" class="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition" title="Clonar">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                       </button>
                       <button onclick="window.editAdminProduct('${prod.id}')" class="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                       </button>
                       <button onclick="window.deleteAdminProduct('${prod.id}', '${prod.title}')" class="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition" title="Excluir">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderOrdersTab(orders, formatCurrency) {
    const statuses = [
      { id: 'pending', label: '📥 Novos', color: 'blue' },
      { id: 'preparing', label: '🍳 Em Preparo', color: 'yellow' },
      { id: 'shipped', label: '🚚 Saiu p/ Entrega', color: 'green' }
    ];

    const getOrdersByStatus = (status) => orders.filter(o => o.status === status);

    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${statuses.map(s => `
          <div class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <h3 class="font-black text-gray-900 dark:text-white uppercase tracking-widest text-xs">${s.label}</h3>
              <span class="bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">${getOrdersByStatus(s.id).length}</span>
            </div>
            <div class="space-y-3">
              ${getOrdersByStatus(s.id).map(order => `
                <div class="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="text-sm font-bold text-gray-900 dark:text-white">${order.customer_name}</h4>
                      <p class="text-[10px] text-gray-400 font-medium">${new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • ${order.payment_method}</p>
                    </div>
                    <span class="text-xs font-black text-lojaPrimaria">${formatCurrency(order.total_amount)}</span>
                  </div>
                  <p class="text-[11px] text-gray-500 line-clamp-2">${order.delivery_address || 'Retirada'}</p>

                  <div class="space-y-1 py-2 border-t border-gray-50 dark:border-gray-700/50">
                    ${order.order_items?.map(item => `
                      <div class="flex justify-between text-[10px]">
                        <span class="text-gray-600 dark:text-gray-400 font-medium">${item.quantity}x ${item.products?.title || 'Produto'}</span>
                      </div>
                    `).join('')}
                  </div>

                  <div class="flex gap-2 pt-2">
                    ${s.id === 'pending' ? `
                      <button onclick="window.updateOrderStatus('${order.id}', 'preparing')" class="flex-grow bg-yellow-50 text-yellow-600 text-[10px] font-black py-2 rounded-xl hover:bg-yellow-100 transition uppercase tracking-tighter">Preparar</button>
                    ` : s.id === 'preparing' ? `
                      <button onclick="window.updateOrderStatus('${order.id}', 'shipped')" class="flex-grow bg-green-50 text-green-600 text-[10px] font-black py-2 rounded-xl hover:bg-green-100 transition uppercase tracking-tighter">Despachar</button>
                    ` : ''}
                    <button onclick="window.openOrderWhatsApp('${order.customer_phone}')" class="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.52.909 3.284 1.389 5.083 1.391 5.446.002 9.879-4.431 9.882-9.88.001-2.641-1.03-5.124-2.903-6.999-1.872-1.875-4.355-2.908-6.998-2.908-5.448 0-9.881 4.432-9.884 9.881-.001 1.838.513 3.633 1.488 5.191l-.991 3.616 3.702-.972zm10.177-6.238c-.276-.138-1.636-.808-1.89-.9-.252-.092-.437-.138-.62.138-.184.276-.712.9-.873 1.084-.159.184-.32.207-.597.069-.276-.138-1.169-.431-2.227-1.374-.824-.735-1.38-1.644-1.541-1.921-.161-.276-.017-.425.12-.563.125-.124.276-.322.415-.483.138-.161.184-.276.276-.46.092-.184.046-.345-.023-.483-.069-.138-.62-1.495-.85-2.046-.224-.541-.47-.466-.645-.475-.165-.008-.354-.01-.543-.01s-.497.071-.757.345c-.26.274-1 1.009-1 2.459s1.055 2.846 1.203 3.045c.148.199 2.077 3.172 5.031 4.449.703.304 1.252.486 1.679.622.705.226 1.348.194 1.856.118.566-.085 1.636-.669 1.865-1.315.23-.647.23-1.201.161-1.315-.069-.115-.253-.207-.529-.345z"/></svg>
                    </button>
                  </div>
                </div>
              `).join('')}
              ${getOrdersByStatus(s.id).length === 0 ? `<div class="border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center text-gray-300 dark:text-gray-600 text-xs font-bold uppercase tracking-widest">Vazio</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  bindEvents(container, onRefresh) {
    // Tab switching
    container.querySelector('#tab-products').onclick = () => { this.activeTab = 'products'; onRefresh(); };
    container.querySelector('#tab-orders').onclick = () => { this.activeTab = 'orders'; onRefresh(); };

    // Dark Mode
    container.querySelector('#toggle-dark-mode').onclick = () => {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('admin-dark-mode', this.isDarkMode);
      onRefresh();
    };

    // Store Status
    container.querySelector('#toggle-store-status').onclick = async () => {
      const { data: tenant } = await supabase.from('tenant_settings').select('id, is_open').maybeSingle();
      if (tenant) {
        await supabase.from('tenant_settings').update({ is_open: !tenant.is_open }).eq('id', tenant.id);
        onRefresh();
      }
    };

    // Search
    const searchInput = container.querySelector('#admin-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        // Optimization: only re-render the list part or just trigger refresh
        // For simplicity with this architecture, we refresh
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => onRefresh(), 300);
      };
    }

    // Tenant Form
    const tenantForm = container.querySelector('#admin-tenant-form');
    if (tenantForm) {
      ImageUpload.bindEvents('logo');
      ImageUpload.bindEvents('hero');
      tenantForm.onsubmit = async (e) => {
        e.preventDefault();
        const updatedData = {
          store_name: container.querySelector('#conf-name').value,
          logo_url: container.querySelector('#url-logo').value,
          hero_image_url: container.querySelector('#url-hero').value,
          whatsapp_number: container.querySelector('#conf-phone').value,
          primary_color: container.querySelector('#conf-primary').value,
          secondary_color: container.querySelector('#conf-secondary').value
        };
        const { data: current } = await supabase.from('tenant_settings').select('id').maybeSingle();
        if (current) await supabase.from('tenant_settings').update(updatedData).eq('id', current.id);
        else await supabase.from('tenant_settings').insert(updatedData);
        injectTheme(updatedData.primary_color, updatedData.secondary_color);
        onRefresh();
      };
    }

    // Product Form
    const productForm = container.querySelector('#admin-product-form');
    if (productForm) {
      ImageUpload.bindEvents('prod');
      const catSelect = container.querySelector('#prod-category');
      const newCatInput = container.querySelector('#new-category-name');
      catSelect.onchange = () => {
        newCatInput.classList.toggle('hidden', catSelect.value !== 'new');
      };

      productForm.onsubmit = async (e) => {
        e.preventDefault();
        let catId = catSelect.value;
        if (catId === 'new') {
          const name = newCatInput.value;
          const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
          const { data: newCat } = await supabase.from('categories').insert({ name, slug }).select().single();
          catId = newCat.id;
        }

        const payload = {
          title: container.querySelector('#prod-title').value,
          category_id: catId,
          stock: parseInt(container.querySelector('#prod-stock').value),
          description: container.querySelector('#prod-description').value,
          price: parseFloat(container.querySelector('#prod-price').value),
          promo_price: container.querySelector('#prod-promo').value ? parseFloat(container.querySelector('#prod-promo').value) : null,
          image_url: container.querySelector('#url-prod').value,
          attributes: container.querySelector('#prod-attributes').value.split(',').map(s => s.trim()).filter(s => s)
        };

        const prodId = container.querySelector('#prod-id').value;
        if (prodId) await supabase.from('products').update(payload).eq('id', prodId);
        else await supabase.from('products').insert(payload);
        onRefresh();
      };
    }

    // Global actions
    window.toggleProductActive = async (id, status) => {
      await supabase.from('products').update({ is_active: status }).eq('id', id);
      onRefresh();
    };

    window.cloneProduct = async (id) => {
      const { data: prod } = await supabase.from('products').select('*').eq('id', id).single();
      if (prod) {
        container.querySelector('#prod-id').value = ''; // New product
        container.querySelector('#prod-title').value = `${prod.title} (Cópia)`;
        container.querySelector('#prod-category').value = prod.category_id;
        container.querySelector('#prod-stock').value = prod.stock;
        container.querySelector('#prod-description').value = prod.description || '';
        container.querySelector('#prod-price').value = prod.price;
        container.querySelector('#prod-promo').value = prod.promo_price || '';
        container.querySelector('#url-prod').value = prod.image_url || '';
        container.querySelector('#prod-attributes').value = Array.isArray(prod.attributes) ? prod.attributes.join(', ') : '';
        const preview = container.querySelector('#preview-prod');
        if (preview) preview.src = prod.image_url || '';
        container.querySelector('#product-form-title').innerText = 'Clonar Produto';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.editAdminProduct = async (id) => {
      const { data: prod } = await supabase.from('products').select('*').eq('id', id).single();
      if (prod) {
        container.querySelector('#prod-id').value = prod.id;
        container.querySelector('#prod-title').value = prod.title;
        container.querySelector('#prod-category').value = prod.category_id;
        container.querySelector('#prod-stock').value = prod.stock;
        container.querySelector('#prod-description').value = prod.description || '';
        container.querySelector('#prod-price').value = prod.price;
        container.querySelector('#prod-promo').value = prod.promo_price || '';
        container.querySelector('#url-prod').value = prod.image_url || '';
        container.querySelector('#prod-attributes').value = Array.isArray(prod.attributes) ? prod.attributes.join(', ') : '';
        const preview = container.querySelector('#preview-prod');
        if (preview) preview.src = prod.image_url || '';
        container.querySelector('#product-form-title').innerText = 'Editar Produto';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const deleteModal = container.querySelector('#delete-modal');
    window.deleteAdminProduct = (id, title) => {
      this.itemToDelete = id;
      container.querySelector('#delete-item-name').innerText = title;
      deleteModal.classList.remove('hidden');
    };
    container.querySelector('#btn-cancel-delete').onclick = () => deleteModal.classList.add('hidden');
    container.querySelector('#btn-confirm-delete').onclick = async () => {
      await supabase.from('products').delete().eq('id', this.itemToDelete);
      deleteModal.classList.add('hidden');
      onRefresh();
    };

    window.updateOrderStatus = async (id, status) => {
      await supabase.from('orders').update({ status }).eq('id', id);
      onRefresh();
    };

    window.openOrderWhatsApp = (phone) => {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    };
  }
};
