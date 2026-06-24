import { supabase } from '../../config/supabase.js';
import { injectTheme } from '../../config/theme.js';
import { ImageUpload } from '../../components/ImageUpload.js';

export const Dashboard = {
  async render() {
    const [ordersRes, productsRes, categoriesRes, tenantRes] = await Promise.all([
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('tenant_settings').select('*').maybeSingle()
    ]);

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
                <h3 class="font-black text-gray-900 text-lg">Cadastrar Produto</h3>
                <form id="admin-product-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <input type="text" id="prod-title" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Título" />
                    <select id="prod-category" required class="w-full bg-gray-50 border-none rounded-xl p-3 text-sm">
                      <option value="" disabled selected>Categoria...</option>
                      ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
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
                <div class="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                  ${products.map(prod => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white rounded-xl overflow-hidden border border-gray-100">
                           <img src="${prod.image_url || ''}" onerror="this.src='${placeholderImg}'; this.className='p-3 opacity-20';" class="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 class="text-sm font-bold text-gray-800 line-clamp-1">${prod.title}</h4>
                          <p class="text-[10px] font-black text-gray-400 uppercase">${prod.categories?.name || 'Geral'} • ${formatCurrency(prod.promo_price || prod.price)}</p>
                        </div>
                      </div>
                      <button data-product-id="${prod.id}" data-product-title="${prod.title}" class="js-delete-product p-2 text-gray-400 hover:text-red-500 rounded-xl transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="delete-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 hidden">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="bg-white w-full max-w-sm rounded-3xl p-8 relative animate-in fade-in zoom-in duration-200">
          <h3 class="text-center text-xl font-black text-gray-900 mb-2">Confirmar Exclusão</h3>
          <p class="text-center text-gray-500 text-sm mb-8">Deseja excluir <span id="delete-item-name" class="font-bold text-gray-900"></span>?</p>
          <div class="grid grid-cols-2 gap-4">
            <button id="btn-cancel-delete" class="bg-gray-100 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-200 transition">Cancelar</button>
            <button id="btn-confirm-delete" class="bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition">Excluir</button>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(container, onRefresh) {
    const tenantForm = container.querySelector('#admin-tenant-form');
    const productForm = container.querySelector('#admin-product-form');

    ImageUpload.bindEvents('logo');
    ImageUpload.bindEvents('hero');
    ImageUpload.bindEvents('prod');

    if (tenantForm) {
      tenantForm.onsubmit = async (e) => {
        e.preventDefault();
        const btnSave = container.querySelector('#btn-save-tenant');
        const btnText = container.querySelector('#btn-save-text');
        const btnLoader = container.querySelector('#btn-save-loader');

        btnSave.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');

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
        const { error } = await supabase.from('tenant_settings').update(updatedData).eq('id', currentTenant.id);

        if (!error) {
          injectTheme(updatedData.primary_color, updatedData.secondary_color);
          alert('Salvo!');
          onRefresh();
        } else {
          alert('Erro: ' + error.message);
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

    btnCancelDelete.onclick = () => deleteModal.classList.add('hidden');
    btnConfirmDelete.onclick = async () => {
      await supabase.from('products').delete().eq('id', itemToDelete);
      deleteModal.classList.add('hidden');
      onRefresh();
    };

    container.querySelectorAll('.js-delete-product').forEach(btn => {
      btn.onclick = () => {
        itemToDelete = btn.dataset.productId;
        deleteItemName.innerText = btn.dataset.productTitle;
        deleteModal.classList.remove('hidden');
      };
    });

    if (productForm) {
      productForm.onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
          title: container.querySelector('#prod-title').value,
          category_id: container.querySelector('#prod-category').value,
          description: container.querySelector('#prod-description').value,
          price: parseFloat(container.querySelector('#prod-price').value),
          promo_price: parseFloat(container.querySelector('#prod-promo').value) || null,
          image_url: container.querySelector('#url-prod').value,
          attributes: container.querySelector('#prod-attributes').value.split(',').map(s => s.trim()).filter(s => s)
        };
        await supabase.from('products').insert(payload);
        onRefresh();
      };
    }
  }
};
