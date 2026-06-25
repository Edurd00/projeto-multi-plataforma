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

      // Verificação de erros específicos do Supabase
      if (ordersRes.error) console.error("Erro ao carregar pedidos:", ordersRes.error);
      if (productsRes.error) console.error("Erro ao carregar produtos:", productsRes.error);
      if (categoriesRes.error) console.error("Erro ao carregar categorias:", categoriesRes.error);
      if (tenantRes.error) console.error("Erro ao carregar configurações:", tenantRes.error);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];
      const categories = categoriesRes.data || [];
      const tenant = tenantRes.data || {};

      const isConfigured = tenant.store_name && tenant.logo_url && tenant.whatsapp_number;

      const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

      const placeholderImg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;

      return `
        <div class="min-h-screen bg-gray-50 p-4 md:p-8">
          <div class="max-w-7xl mx-auto space-y-8">

            <!-- CABEÇALHO ADMIN -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h1 class="text-2xl font-black text-gray-900 tracking-tight">Painel de Controle</h1>
                  ${isConfigured
                    ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-600">● Loja Online</span>`
                    : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-600">● Pendente</span>`
                  }
                </div>
                <p class="text-sm text-gray-500 font-medium">Gerenciando: <span class="text-gray-900">${tenant.store_name || 'Nova Loja'}</span></p>
              </div>
              <div class="flex items-center gap-3 w-full md:w-auto">
                <a href="/" class="flex-grow md:flex-grow-0 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-6 py-3 rounded-2xl text-sm transition">
                  Ver Vitrine
                </a>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

              <!-- COLUNA ESQUERDA -->
              <div class="lg:col-span-5 space-y-8">
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div class="p-6 border-b border-gray-50 bg-gray-50/50">
                    <h3 class="font-black text-gray-900 text-lg">Configurações da Loja</h3>
                  </div>

                  <form id="admin-tenant-form" class="p-6 space-y-8">
                    <div class="space-y-4">
                      <div class="flex items-center gap-2 mb-2">
                        <div class="w-1 h-4 bg-lojaPrimaria rounded-full"></div>
                        <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">🌐 Identidade Visual</h4>
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Marca</label>
                        <input type="text" id="conf-name" value="${tenant.store_name || ''}" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-lojaPrimaria transition" />
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${ImageUpload.render('logo', tenant.logo_url, 'Logotipo')}
                        ${ImageUpload.render('hero', tenant.hero_image_url, 'Banner Hero')}
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cor Primária</label>
                          <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-1 pr-3">
                            <input type="color" id="conf-primary" value="${tenant.primary_color || '#3b82f6'}" class="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer" />
                            <span class="text-xs font-mono font-bold text-gray-600">${tenant.primary_color || '#3b82f6'}</span>
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cor Secundária</label>
                          <div class="flex items-center gap-2 bg-gray-50 rounded-xl p-1 pr-3">
                            <input type="color" id="conf-secondary" value="${tenant.secondary_color || '#1e3a8a'}" class="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer" />
                            <span class="text-xs font-mono font-bold text-gray-600">${tenant.secondary_color || '#1e3a8a'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-4 pt-4 border-t border-gray-50">
                      <div class="flex items-center gap-2 mb-2">
                        <div class="w-1 h-4 bg-lojaPrimaria rounded-full"></div>
                        <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest">📞 Canais e Logística</h4>
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                        <input type="text" id="conf-phone" value="${tenant.whatsapp_number || ''}" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-lojaPrimaria transition" placeholder="5511999999999" />
                      </div>
                      <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">📍 Endereço</label>
                        <input type="text" id="conf-address" value="${tenant.address || ''}" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-lojaPrimaria transition" />
                      </div>
                    </div>

                    <button type="submit" id="btn-save-tenant" class="w-full bg-lojaPrimaria text-white font-black py-4 rounded-2xl shadow-lg shadow-lojaPrimaria/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2">
                      <span id="btn-save-text">Salvar Configurações</span>
                      <div id="btn-save-loader" class="hidden animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    </button>
                  </form>
                </div>
              </div>

              <!-- COLUNA DIREITA -->
              <div class="lg:col-span-7 space-y-8">
                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                  <h3 class="font-black text-gray-900 text-lg" id="product-form-title">Cadastrar Produto</h3>
                  <form id="admin-product-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="hidden" id="prod-id" value="" />
                    <div class="space-y-4">
                      <input type="text" id="prod-title" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Título" />
                      <div class="flex gap-2">
                        <select id="prod-category" required class="flex-grow bg-gray-50 border-none rounded-xl p-3 text-sm">
                          <option value="" disabled selected>Categoria...</option>
                          ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                          <option value="new">+ Criar Nova</option>
                        </select>
                        <input type="text" id="new-category-name" class="hidden flex-grow bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm" placeholder="Nome da Categoria" />
                      </div>
                      <textarea id="prod-description" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm h-28" placeholder="Descrição"></textarea>
                    </div>
                    <div class="space-y-4">
                      <div class="grid grid-cols-2 gap-4">
                        <input type="number" step="0.01" id="prod-price" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Preço" />
                        <input type="number" step="0.01" id="prod-promo" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Promoção" />
                      </div>
                      ${ImageUpload.render('prod', '', 'Imagem')}
                      <input type="text" id="prod-attributes" class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Tamanhos (P, M, G)" />
                    </div>
                    <button type="submit" class="md:col-span-2 bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-green-700 transition">Adicionar ao Catálogo</button>
                  </form>
                </div>

                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
                  <h3 class="font-black text-gray-900 text-lg">Produtos</h3>
                  <div class="grid grid-cols-1 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin" id="admin-product-list">
                    ${products.map(prod => {
                      const temDesconto = prod.promo_price && Number(prod.price) > Number(prod.promo_price);
                      const isExpanded = false; // Initial state

                      return `
                        <div class="border border-gray-100 rounded-lg bg-white mb-1.5 overflow-hidden shadow-sm mx-2">
                          <div onclick="window.toggleAdminProduct('${prod.id}')" class="p-2 flex items-center justify-between bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                            <div class="flex items-center gap-2">
                              <div class="w-8 h-8 border rounded-md overflow-hidden bg-white flex-shrink-0">
                                <img src="${prod.image_url || ''}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80';" />
                              </div>
                              <div class="min-w-0">
                                <h4 class="text-xs font-semibold text-gray-800 truncate max-w-[180px]">${prod.title}</h4>
                                <p class="text-[10px] text-gray-500">
                                  ${temDesconto ? `<span class="line-through mr-1 text-gray-400">R$ ${prod.price}</span>` : ''}
                                  <span class="${temDesconto ? 'text-red-600 font-medium' : ''}">${formatCurrency(prod.promo_price || prod.price)}</span>
                                  • ${prod.categories?.name || 'Geral'}
                                </p>
                              </div>
                            </div>
                            <span id="label-${prod.id}" class="text-gray-400 text-[10px] md:hidden font-medium px-1.5 py-0.5 bg-gray-100 rounded">▼ Ver</span>
                          </div>

                          <div id="details-${prod.id}" class="hidden md:block p-3 border-t border-gray-50 bg-white text-xs">
                            <p class="text-gray-600 mb-2 leading-relaxed text-[11px]">${prod.description || 'Sem descrição.'}</p>
                            <div class="flex gap-2 justify-end pt-2 border-t border-gray-50">
                              <button onclick="window.editAdminProduct('${prod.id}')" class="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md font-bold hover:bg-blue-100 transition">✏️ Editar</button>
                              <button onclick="window.deleteAdminProduct('${prod.id}', '${prod.title}')" class="bg-red-50 text-red-600 px-2.5 py-1 rounded-md font-bold hover:bg-red-100 transition">🗑️ Excluir</button>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="delete-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 hidden">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div class="bg-white w-full max-w-sm rounded-3xl p-8 relative">
            <h3 class="text-center text-xl font-black text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p class="text-center text-gray-500 text-sm mb-2">Deseja excluir <span id="delete-item-name" class="font-bold text-gray-900"></span>?</p>
            <p class="text-center text-red-500 text-[10px] font-bold uppercase tracking-widest mb-8">Esta ação não poderá ser desfeita.</p>
            <div class="grid grid-cols-2 gap-4">
              <button id="btn-cancel-delete" class="bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-200 transition">Cancelar</button>
              <button id="btn-confirm-delete" class="bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition">Excluir</button>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      console.error("FALHA CRÍTICA NO DASHBOARD:", err);
      return `
        <div class="min-h-screen flex items-center justify-center bg-red-50 p-6">
           <div class="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4">
              <div class="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 class="text-2xl font-black text-gray-900">Erro de Conexão</h2>
              <p class="text-gray-500 text-sm">Não foi possível carregar os dados do Supabase. Verifique sua conexão e as políticas de RLS.</p>
              <pre class="bg-gray-50 p-3 rounded-xl text-[10px] text-red-400 text-left overflow-x-auto">${err.message}</pre>
              <button onclick="window.location.reload()" class="w-full bg-gray-900 text-white font-bold py-3 rounded-2xl transition hover:bg-black">Tentar Novamente</button>
           </div>
        </div>
      `;
    }
  },

  bindEvents(container, onRefresh) {
    const tenantForm = container.querySelector('#admin-tenant-form');
    const productForm = container.querySelector('#admin-product-form');
    const categorySelect = container.querySelector('#prod-category');
    const newCategoryInput = container.querySelector('#new-category-name');

    ImageUpload.bindEvents('logo');
    ImageUpload.bindEvents('hero');
    ImageUpload.bindEvents('prod');

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
            secondary_color: container.querySelector('#conf-secondary').value
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
      const el = container.querySelector(`#details-${id}`);
      const label = container.querySelector(`#label-${id}`);
      if (el) {
        const isHidden = el.classList.toggle('hidden');
        if (label) label.innerText = isHidden ? '▼ Ver' : '▲ Sobe';
      }
    };

    window.deleteAdminProduct = (id, title) => {
      itemToDelete = id;
      deleteItemName.innerText = title;
      deleteModal.classList.remove('hidden');
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
        container.querySelector('#product-form-title').innerText = 'Editar Produto';
        container.querySelector('#prod-id').value = prod.id;
        container.querySelector('#prod-title').value = prod.title;
        container.querySelector('#prod-category').value = prod.category_id;
        container.querySelector('#prod-description').value = prod.description || '';
        container.querySelector('#prod-price').value = prod.price;
        container.querySelector('#prod-promo').value = prod.promo_price || '';
        container.querySelector('#prod-attributes').value = Array.isArray(prod.attributes) ? prod.attributes.join(', ') : '';

        // Trigger image preview update
        const urlProd = container.querySelector('#url-prod');
        urlProd.value = prod.image_url || '';
        const previewProd = container.querySelector('#preview-prod');
        if (previewProd) previewProd.src = prod.image_url || '';

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
            category_id: categoryId,
            description: container.querySelector('#prod-description').value,
            price: parseFloat(priceVal),
            promo_price: promoVal ? parseFloat(promoVal) : null,
            image_url: container.querySelector('#url-prod').value,
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
          onRefresh();
        } catch (err) {
          alert("Erro ao salvar produto: " + err.message);
        }
      };
    }
  }
};
