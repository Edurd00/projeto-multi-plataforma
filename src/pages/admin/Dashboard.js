import { supabase } from '../../config/supabase.js';
import { injectTheme } from '../../config/theme.js';
import { ImageUpload } from '../../components/ImageUpload.js';

export const Dashboard = {
  async render() {
    try {
      const [ordersRes, productsRes, categoriesRes, tenantRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('tenant_settings').select('*').maybeSingle()
      ]);

      if (ordersRes.error) console.error("Erro ao carregar pedidos:", ordersRes.error);
      if (productsRes.error) console.error("Erro ao carregar produtos:", productsRes.error);
      if (categoriesRes.error) console.error("Erro ao carregar categorias:", categoriesRes.error);
      if (tenantRes.error) console.error("Erro ao carregar configurações:", tenantRes.error);

      const products = productsRes.data || [];
      const categories = categoriesRes.data || [];
      const tenant = tenantRes.data || {};
      const orders = ordersRes.data || [];

      const isConfigured = tenant.store_name && tenant.logo_url && tenant.whatsapp_number;

      const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

      const renderAdminProductList = (products, expandedId = null) => {
        return products.map(prod => {
          const isExpanded = prod.id === expandedId;
          const displayPrice = prod.promo_price || prod.price;
          const priceFrom = prod.promo_price ? prod.price : null;
          const temDesconto = priceFrom && Number(priceFrom) > Number(displayPrice);

          return `
            <div class="border border-gray-100 rounded-lg bg-white mb-2 overflow-hidden shadow-sm mx-1">
              <div onclick="window.toggleAdminProduct('${prod.id}')" class="p-2 flex items-center justify-between bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-all duration-150">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <div class="w-10 h-10 border border-gray-200 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    <img src="${prod.image_url || ''}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80';" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="text-[11px] font-black text-gray-800 truncate uppercase tracking-tight">${prod.title}</h4>
                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      ${temDesconto ? `<span class="line-through mr-1 opacity-50">R$ ${priceFrom}</span>` : ''}
                      <span class="${temDesconto ? 'text-red-600' : ''}">R$ ${displayPrice}</span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-2">
                  <span class="text-gray-400 p-1 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>

              <div class="${isExpanded ? 'block' : 'hidden'} p-3 border-t border-gray-100 bg-white">
                <div class="space-y-3">
                    <div>
                        <h5 class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Descrição</h5>
                        <p class="text-gray-600 leading-relaxed text-[11px]">${prod.description || 'Sem descrição.'}</p>
                    </div>
                    ${prod.colors && prod.colors.length > 0 ? `
                        <div>
                            <h5 class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cores</h5>
                            <div class="flex flex-wrap gap-1">
                                ${prod.colors.map(c => `<span class="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-600 uppercase">${c}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="flex gap-2 justify-end pt-3 mt-3 border-t border-gray-50">
                  <button type="button" onclick="event.stopPropagation(); window.editAdminProduct('${prod.id}')" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1">
                    ✏️ Editar
                  </button>
                  <button type="button" onclick="event.stopPropagation(); window.deleteAdminProduct('${prod.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1">
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      };

      return `
        <div class="min-h-screen bg-gray-50 p-3 md:p-8">
          <div class="max-w-7xl mx-auto space-y-6 md:space-y-8">

            <!-- CABEÇALHO ADMIN -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h1 class="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Painel Administrativo</h1>
                  ${isConfigured
                    ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600">Online</span>`
                    : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-100 text-yellow-600">Pendente</span>`
                  }
                </div>
                <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Loja: <span class="text-gray-900">${tenant.store_name || 'Nova Loja'}</span></p>
              </div>
              <a href="/" class="w-full md:w-auto text-center bg-gray-900 hover:bg-black text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition shadow-lg">
                Ver Minha Vitrine
              </a>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

              <!-- COLUNA ESQUERDA: CONFIGS -->
              <div class="lg:col-span-5 space-y-6 md:space-y-8">
                <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                  <div class="p-6 border-b border-gray-50 bg-gray-50/30">
                    <h3 class="font-black text-gray-900 text-base uppercase tracking-tight">Configurações Gerais</h3>
                  </div>

                  <form id="admin-tenant-form" class="p-6 space-y-6">
                    <div class="space-y-4">
                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Nome da Loja</label>
                        <input type="text" id="conf-name" value="${tenant.store_name || ''}" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-lojaPrimaria transition" />
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${ImageUpload.render('logo', tenant.logo_url, 'Logotipo')}
                        ${ImageUpload.render('hero', tenant.hero_image_url, 'Banner Hero')}
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Cor Primária</label>
                          <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-1 pr-3">
                            <input type="color" id="conf-primary" value="${tenant.primary_color || '#3b82f6'}" class="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer" />
                            <span class="text-[10px] font-mono font-black text-gray-500 uppercase">${tenant.primary_color || '#3b82f6'}</span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Cor Secundária</label>
                          <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-1 pr-3">
                            <input type="color" id="conf-secondary" value="${tenant.secondary_color || '#1e3a8a'}" class="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer" />
                            <span class="text-[10px] font-mono font-black text-gray-500 uppercase">${tenant.secondary_color || '#1e3a8a'}</span>
                          </div>
                        </div>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Instagram (URL)</label>
                           <input type="text" id="conf-instagram" value="${tenant.instagram_url || ''}" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold" />
                        </div>
                        <div>
                           <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Facebook (URL)</label>
                           <input type="text" id="conf-facebook" value="${tenant.facebook_url || ''}" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold" />
                        </div>
                      </div>
                    </div>

                    <div class="space-y-4 pt-4 border-t border-gray-50">
                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">WhatsApp (Receber Pedidos)</label>
                        <input type="text" id="conf-phone" value="${tenant.whatsapp_number || ''}" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold" placeholder="5511999999999" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Endereço Físico</label>
                        <input type="text" id="conf-address" value="${tenant.address || ''}" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold" />
                      </div>
                    </div>

                    <button type="submit" id="btn-save-tenant" class="w-full bg-lojaPrimaria text-white font-black py-4 rounded-2xl shadow-lg shadow-lojaPrimaria/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
                      <span id="btn-save-text">Salvar Alterações</span>
                      <div id="btn-save-loader" class="hidden animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    </button>
                  </form>
                </div>

                <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 space-y-4">
                   <h3 class="font-black text-gray-900 text-base uppercase tracking-tight">Categorias</h3>
                   <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                      ${categories.map(cat => `
                        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                           <span class="text-xs font-black text-gray-600 uppercase tracking-widest">${cat.name}</span>
                           <button onclick="window.deleteCategory('${cat.id}')" class="text-red-300 hover:text-red-500 transition p-1 hover:bg-red-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>
                      `).join('')}
                   </div>
                </div>
              </div>

              <!-- COLUNA DIREITA: PRODUTOS -->
              <div class="lg:col-span-7 space-y-6 md:space-y-8">
                <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 space-y-6">
                  <h3 class="font-black text-gray-900 text-base uppercase tracking-tight" id="product-form-title">Cadastrar Novo Produto</h3>
                  <form id="admin-product-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="hidden" id="prod-id" value="" />
                    <div class="space-y-4">
                      <div>
                         <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Título do Produto</label>
                         <input type="text" id="prod-title" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold" />
                      </div>
                      <div class="flex gap-2">
                        <div class="flex-1">
                             <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Categoria</label>
                             <select id="prod-category" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold">
                                <option value="" disabled selected>Selecionar...</option>
                                ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                <option value="new">+ Criar Nova</option>
                             </select>
                        </div>
                        <input type="text" id="new-category-name" class="hidden flex-grow bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm font-bold mt-5" placeholder="Nome" />
                      </div>
                      <div>
                         <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Descrição Curta</label>
                         <textarea id="prod-description" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold h-24" placeholder="Detalhes do item..."></textarea>
                      </div>
                    </div>
                    <div class="space-y-4">
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                           <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Preço (R$)</label>
                           <input type="number" step="0.01" id="prod-price" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold" />
                        </div>
                        <div>
                           <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Promo (R$)</label>
                           <input type="number" step="0.01" id="prod-promo" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold" />
                        </div>
                      </div>
                      ${ImageUpload.render('prod', '', 'Foto do Produto')}
                      <div>
                         <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Cores (separadas por vírgula)</label>
                         <input type="text" id="prod-colors" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold" placeholder="Preto, Branco, Azul" />
                      </div>
                      <div>
                         <label class="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1.5">Tamanhos (P, M, G)</label>
                         <input type="text" id="prod-attributes" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold" />
                      </div>
                    </div>
                    <button type="submit" id="btn-prod-submit" class="md:col-span-2 bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-green-700 transition uppercase text-xs tracking-widest">
                       Adicionar ao Catálogo
                    </button>
                  </form>
                </div>

                <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 space-y-6">
                  <h3 class="font-black text-gray-900 text-base uppercase tracking-tight">Catálogo</h3>
                  <div class="grid grid-cols-1 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin" id="admin-product-list">
                    ${renderAdminProductList(products, window.currentExpandedId)}
                  </div>
                </div>

                <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 space-y-6">
                  <h3 class="font-black text-gray-900 text-base uppercase tracking-tight">Pedidos Recentes</h3>
                  <div class="space-y-3">
                    ${orders.map(order => `
                      <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <div>
                          <p class="text-[11px] font-black text-gray-900 uppercase tracking-tight">${order.customer_name}</p>
                          <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">${order.payment_method} • ${formatCurrency(order.total_amount)}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}">
                          ${order.status}
                        </span>
                      </div>
                    `).join('')}
                    ${orders.length === 0 ? '<p class="text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest py-8">Nenhum pedido</p>' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="delete-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 hidden">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div class="bg-white w-full max-w-sm rounded-[2rem] p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 class="text-center text-xl font-black text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p class="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Deseja excluir <span id="delete-item-name" class="text-red-500"></span>?</p>
            <p class="text-center text-red-500 text-[9px] font-black uppercase tracking-[0.2em] mb-8 opacity-50">Esta ação é irreversível</p>
            <div class="grid grid-cols-2 gap-4">
              <button id="btn-cancel-delete" class="bg-gray-100 text-gray-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-200 transition">Cancelar</button>
              <button id="btn-confirm-delete" class="bg-red-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 transition shadow-lg shadow-red-500/20">Sim, Excluir</button>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      console.error("FALHA CRÍTICA NO DASHBOARD:", err);
      return `<div class="p-20 text-center font-black uppercase text-red-500">Erro de Conexão</div>`;
    }
  },

  bindEvents(container, onRefresh) {
    const tenantForm = container.querySelector('#admin-tenant-form');
    const productForm = container.querySelector('#admin-product-form');
    const categorySelect = container.querySelector('#prod-category');
    const newCategoryInput = container.querySelector('#new-category-name');

    ImageUpload.bindEvents('logo', (url) => { if(!url) container.querySelector('#url-logo').value = ''; });
    ImageUpload.bindEvents('hero', (url) => { if(!url) container.querySelector('#url-hero').value = ''; });
    ImageUpload.bindEvents('prod', (url) => { if(!url) container.querySelector('#url-prod').value = ''; });

    if (categorySelect) {
      categorySelect.onchange = () => {
        if (categorySelect.value === 'new') {
          newCategoryInput.classList.remove('hidden');
          newCategoryInput.required = true;
        } else {
          newCategoryInput.classList.add('hidden');
          newCategoryInput.required = false;
        }
      };
    }

    if (tenantForm) {
      tenantForm.onsubmit = async (e) => {
        e.preventDefault();
        const btnSave = container.querySelector('#btn-save-tenant');
        const btnText = container.querySelector('#btn-save-text');
        const btnLoader = container.querySelector('#btn-save-loader');

        btnSave.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');

        try {
          const updatedData = {
            store_name: container.querySelector('#conf-name').value,
            logo_url: container.querySelector('#url-logo').value,
            hero_image_url: container.querySelector('#url-hero').value,
            whatsapp_number: container.querySelector('#conf-phone').value,
            address: container.querySelector('#conf-address').value,
            primary_color: container.querySelector('#conf-primary').value,
            secondary_color: container.querySelector('#conf-secondary').value,
            instagram_url: container.querySelector('#conf-instagram').value,
            facebook_url: container.querySelector('#conf-facebook').value
          };

          const { data: currentTenant } = await supabase.from('tenant_settings').select('id').maybeSingle();

          let error;
          if (currentTenant) {
            const res = await supabase.from('tenant_settings').update(updatedData).eq('id', currentTenant.id);
            error = res.error;
          } else {
            const res = await supabase.from('tenant_settings').insert(updatedData);
            error = res.error;
          }

          if (!error) {
            injectTheme(updatedData.primary_color, updatedData.secondary_color);
            onRefresh();
          } else {
            throw error;
          }
        } catch (err) {
          alert('Erro ao salvar: ' + err.message);
          btnSave.disabled = false;
          btnText.classList.remove('hidden');
          btnLoader.classList.add('hidden');
        }
      };
    }

    const deleteModal = container.querySelector('#delete-modal');
    const deleteItemName = container.querySelector('#delete-item-name');
    const btnCancelDelete = container.querySelector('#btn-cancel-delete');
    const btnConfirmDelete = container.querySelector('#btn-confirm-delete');
    let itemToDelete = null;

    window.toggleAdminProduct = (id) => {
      window.currentExpandedId = window.currentExpandedId === id ? null : id;
      if (typeof onRefresh === 'function') onRefresh();
    };

    window.deleteAdminProduct = async (id) => {
      const { data: prod } = await supabase.from('products').select('title').eq('id', id).single();
      itemToDelete = id;
      deleteItemName.innerText = prod?.title || "este produto";
      deleteModal.classList.remove('hidden');
    };

    window.deleteCategory = async (id) => {
       if (confirm('Deseja realmente excluir esta categoria?')) {
          const { error } = await supabase.from('categories').delete().eq('id', id);
          if (error) alert("Erro ao excluir: " + error.message);
          else onRefresh();
       }
    };

    btnCancelDelete.onclick = () => deleteModal.classList.add('hidden');
    btnConfirmDelete.onclick = async () => {
      await supabase.from('products').delete().eq('id', itemToDelete);
      deleteModal.classList.add('hidden');
      onRefresh();
    };

    window.editAdminProduct = async (id) => {
      const { data: prod } = await supabase.from('products').select('*').eq('id', id).single();
      if (prod) {
        container.querySelector('#product-form-title').innerText = 'Editando: ' + prod.title;
        container.querySelector('#btn-prod-submit').innerText = 'Salvar Alterações';
        container.querySelector('#prod-id').value = prod.id;
        container.querySelector('#prod-title').value = prod.title;
        container.querySelector('#prod-category').value = prod.category_id || '';
        container.querySelector('#prod-description').value = prod.description || '';
        container.querySelector('#prod-price').value = prod.price;
        container.querySelector('#prod-promo').value = prod.promo_price || '';
        container.querySelector('#prod-colors').value = Array.isArray(prod.colors) ? prod.colors.join(', ') : '';
        container.querySelector('#prod-attributes').value = Array.isArray(prod.attributes) ? prod.attributes.join(', ') : '';

        const urlProd = container.querySelector('#url-prod');
        urlProd.value = prod.image_url || '';
        const previewContainer = container.querySelector('#container-prod').querySelector('.relative');
        const removeBtn = container.querySelector('#remove-prod');

        if (prod.image_url) {
            if (removeBtn) removeBtn.classList.replace('hidden', 'flex');
            previewContainer.innerHTML = `
                <img src="${prod.image_url}" id="preview-prod" class="w-full h-full object-cover" />
                <div id="loading-prod" class="absolute inset-0 bg-white/80 items-center justify-center hidden">
                  <div class="animate-spin rounded-full h-5 w-5 border-2 border-lojaPrimaria border-t-transparent"></div>
                </div>
            `;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (productForm) {
      productForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
          let categoryId = categorySelect.value;
          const prodId = container.querySelector('#prod-id').value;

          if (categoryId === 'new') {
            const catName = newCategoryInput.value;
            const slug = catName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
            const { data: newCat, error: catErr } = await supabase.from('categories').insert({ name: catName, slug }).select().single();
            if (catErr) throw catErr;
            categoryId = newCat.id;
          }

          const priceVal = container.querySelector('#prod-price').value;
          const promoVal = container.querySelector('#prod-promo').value;

          const payload = {
            title: container.querySelector('#prod-title').value,
            category_id: categoryId || null,
            description: container.querySelector('#prod-description').value,
            price: parseFloat(priceVal),
            promo_price: promoVal ? parseFloat(promoVal) : null,
            image_url: container.querySelector('#url-prod').value,
            colors: container.querySelector('#prod-colors').value.split(',').map(s => s.trim()).filter(s => s),
            attributes: container.querySelector('#prod-attributes').value.split(',').map(s => s.trim()).filter(s => s)
          };

          let error;
          if (prodId) {
            const res = await supabase.from('products').update(payload).eq('id', prodId);
            error = res.error;
          } else {
            const res = await supabase.from('products').insert(payload);
            error = res.error;
          }

          if (error) throw error;

          productForm.reset();
          container.querySelector('#prod-id').value = '';
          container.querySelector('#product-form-title').innerText = 'Cadastrar Novo Produto';
          container.querySelector('#btn-prod-submit').innerText = 'Adicionar ao Catálogo';

          const previewContainer = container.querySelector('#container-prod').querySelector('.relative');
          const removeBtn = container.querySelector('#remove-prod');
          if (removeBtn) removeBtn.classList.replace('flex', 'hidden');
          previewContainer.innerHTML = `
              <div id="placeholder-prod" class="text-gray-300">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
              </div>
              <div id="loading-prod" class="absolute inset-0 bg-white/80 items-center justify-center hidden">
                <div class="animate-spin rounded-full h-5 w-5 border-2 border-lojaPrimaria border-t-transparent"></div>
              </div>
          `;

          onRefresh();
        } catch (err) {
          alert("Erro ao salvar produto: " + err.message);
        }
      };
    }
  }
};
