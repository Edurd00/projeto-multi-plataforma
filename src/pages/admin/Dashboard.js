import { api } from '../../services/api.js';

export const Dashboard = {
  state: {
    expandedId: null,
    editingProductId: null
  },

  async render() {
    try {
      const [
        { data: orders },
        { data: products },
        { data: categories },
        { data: tenantSettings }
      ] = await Promise.all([
        api.orders.getAll(),
        api.products.getAll(),
        api.categories.getAll(),
        api.tenant.get()
      ]);

      const pendingOrders = orders?.filter(o => o.status === 'pending') || [];
      const preparingOrders = orders?.filter(o => o.status === 'preparing') || [];
      const shippedOrders = orders?.filter(o => o.status === 'shipped' || o.status === 'completed') || [];

      return `
        <div class="min-h-screen bg-gray-100 pb-12">
          <!-- TOP HEADER -->
          <header class="bg-white border-b sticky top-0 z-40 px-6 py-4 shadow-sm flex items-center justify-between">
            <div>
              <h1 class="text-xl font-black text-gray-900 tracking-tight">Painel de Controle - Admin</h1>
              <p class="text-xs text-gray-500">Gerencie produtos, pedidos e configurações da loja</p>
            </div>
            <div class="flex items-center gap-3">
              <a href="?" class="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
                🌐 Ver Loja Live
              </a>
            </div>
          </header>

          <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

            <!-- CONFIGURAÇÕES DA LOJA -->
            <section class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                ⚙️ Configurações Principais
              </h2>
              <form id="tenant-form" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nome da Loja</label>
                  <input type="text" id="tenant-name" value="${tenantSettings?.store_name || ''}" class="w-full border rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Telefone WhatsApp</label>
                  <input type="text" id="tenant-phone" value="${tenantSettings?.phone || ''}" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="11999999999" required />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Status da Loja</label>
                  <select id="tenant-status" class="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="open" ${tenantSettings?.is_open !== false ? 'selected' : ''}>🟢 Aberta para Pedidos</option>
                    <option value="closed" ${tenantSettings?.is_open === false ? 'selected' : ''}>🔴 Fechada Temporariamente</option>
                  </select>
                </div>
                <div class="md:col-span-3 flex justify-end">
                  <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg text-sm transition shadow">
                    Salvar Configurações
                  </button>
                </div>
              </form>
            </section>

            <!-- KANBAN DE PEDIDOS -->
            <section class="space-y-4">
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                📋 Central de Pedidos (${orders?.length || 0})
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- NOVOS -->
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-amber-200">
                  <h3 class="font-bold text-amber-800 text-sm mb-3 flex items-center justify-between">
                    <span>📥 Novos (${pendingOrders.length})</span>
                  </h3>
                  <div class="space-y-3">
                    ${this.renderOrderCards(pendingOrders, 'pending')}
                  </div>
                </div>

                <!-- EM PREPARO -->
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-blue-200">
                  <h3 class="font-bold text-blue-800 text-sm mb-3 flex items-center justify-between">
                    <span>🍳 Em Preparo (${preparingOrders.length})</span>
                  </h3>
                  <div class="space-y-3">
                    ${this.renderOrderCards(preparingOrders, 'preparing')}
                  </div>
                </div>

                <!-- CONCLUÍDOS / SAIU PARA ENTREGA -->
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200">
                  <h3 class="font-bold text-emerald-800 text-sm mb-3 flex items-center justify-between">
                    <span>🚚 Entregues/Enviados (${shippedOrders.length})</span>
                  </h3>
                  <div class="space-y-3">
                    ${this.renderOrderCards(shippedOrders, 'shipped')}
                  </div>
                </div>
              </div>
            </section>

            <!-- GESTÃO DE PRODUTOS & CATEGORIAS -->
            <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <!-- FORMULÁRIO DE PRODUTO -->
              <div class="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit" id="product-form-container">
                <h2 class="text-lg font-bold text-gray-900 mb-4" id="form-title">
                  ➕ Cadastrar Produto
                </h2>
                <form id="product-form" class="space-y-4">
                  <input type="hidden" id="prod-id" value="" />
                  
                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Título do Produto</label>
                    <input type="text" id="prod-title" required class="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Preço (R$)</label>
                      <input type="number" step="0.01" id="prod-price" required class="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Preço Promo (R$)</label>
                      <input type="number" step="0.01" id="prod-promo-price" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Opcional" />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Categoria</label>
                      <select id="prod-category" class="w-full border rounded-lg px-3 py-2 text-sm" required>
                        <option value="">Selecione...</option>
                        ${categories?.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        <option value="new">+ Criar Nova</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Estoque Quantidade</label>
                      <input type="number" id="prod-stock" value="10" required class="w-full border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">URL da Imagem</label>
                    <input type="url" id="prod-image" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Descrição</label>
                    <textarea id="prod-desc" rows="3" class="w-full border rounded-lg px-3 py-2 text-sm"></textarea>
                  </div>

                  <div class="flex items-center gap-4 text-xs font-bold text-gray-700">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" id="prod-featured" class="rounded text-blue-600" /> Destaque na Vitrine
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" id="prod-active" checked class="rounded text-blue-600" /> Ativo
                    </label>
                  </div>

                  <div class="flex gap-2">
                    <button type="submit" id="submit-prod-btn" class="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-lg text-sm transition">
                      Salvar Produto
                    </button>
                    <button type="button" id="cancel-edit-btn" class="hidden bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2.5 rounded-lg text-sm transition">
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>

              <!-- LISTA DE PRODUTOS -->
              <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                  <span>📦 Catálogo de Produtos (${products?.length || 0})</span>
                </h2>

                <div class="space-y-3">
                  ${products && products.length > 0 ? products.map(p => `
                    <div class="border rounded-xl p-3 flex items-center justify-between hover:border-gray-300 transition bg-white">
                      <div class="flex items-center gap-3">
                        <img
                          src="${p.image_url}"
                          alt="${p.title}"
                          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';"
                          class="w-12 h-12 rounded-lg object-cover bg-gray-100"
                        />
                        <div>
                          <div class="flex items-center gap-2">
                            <h4 class="font-bold text-gray-800 text-sm">${p.title}</h4>
                            ${p.stock <= 3 ? `
                              <span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                ⚠️ Estoque Crítico: ${p.stock} un
                              </span>
                            ` : ''}
                          </div>
                          <p class="text-xs text-gray-500">R$ ${p.price.toFixed(2)} | Estoque: ${p.stock}</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <button
                          class="edit-prod-btn text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg transition"
                          data-product='${JSON.stringify(p)}'
                        >
                          Editar
                        </button>
                        <button
                          class="delete-prod-btn text-xs bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg transition"
                          data-id="${p.id}"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  `).join('') : `
                    <div class="text-center py-8 text-gray-500 text-sm">
                      Nenhum produto cadastrado no momento.
                    </div>
                  `}
                </div>
              </div>

            </section>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('Erro ao renderizar Dashboard:', error);
      return `<div class="p-8 text-center text-red-600 font-bold">Erro ao carregar o painel administrativo.</div>`;
    }
  },

  renderOrderCards(orders, statusKey) {
    if (!orders || orders.length === 0) {
      return `<div class="text-xs text-gray-400 italic text-center py-4">Nenhum pedido aqui</div>`;
    }

    return orders.map(order => `
      <div class="border rounded-xl p-3 bg-gray-50 space-y-2">
        <div class="flex justify-between items-start">
          <div>
            <span class="font-bold text-gray-900 text-xs">#${order.id.slice(0, 8)}</span>
            <p class="font-semibold text-gray-800 text-sm">${order.customer_name}</p>
            <p class="text-[11px] text-gray-500">${order.customer_phone}</p>
          </div>
          <span class="font-extrabold text-xs text-gray-900">R$ ${order.total.toFixed(2)}</span>
        </div>

        <div class="text-[11px] text-gray-600 bg-white p-2 rounded border">
          <ul class="space-y-0.5">
            ${order.items?.map(i => `<li>• ${i.quantity}x ${i.title}</li>`).join('') || ''}
          </ul>
        </div>

        <div class="flex gap-2 pt-1">
          ${statusKey === 'pending' ? `
            <button class="update-order-btn w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded transition" data-id="${order.id}" data-status="preparing">
              Mover para Preparo
            </button>
          ` : statusKey === 'preparing' ? `
            <button class="update-order-btn w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded transition" data-id="${order.id}" data-status="shipped">
              Mover para Saiu p/ Entrega
            </button>
          ` : `
            <span class="w-full text-center text-[10px] font-bold text-emerald-600 bg-emerald-50 py-1 rounded">✓ Concluído</span>
          `}
        </div>
      </div>
    `).join('');
  },

  bindEvents(container, refreshCallback) {
    if (!container) return;

    // TENANT FORM
    const tenantForm = container.querySelector('#tenant-form');
    if (tenantForm) {
      tenantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const store_name = container.querySelector('#tenant-name').value;
        const phone = container.querySelector('#tenant-phone').value;
        const is_open = container.querySelector('#tenant-status').value === 'open';

        await api.tenant.update({ store_name, phone, is_open });
        alert('Configurações atualizadas com sucesso!');
        if (refreshCallback) refreshCallback();
      });
    }

    // ORDER STATUS UPDATE
    const orderBtns = container.querySelectorAll('.update-order-btn');
    orderBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const status = btn.getAttribute('data-status');
        await api.orders.updateStatus(id, status);
        if (refreshCallback) refreshCallback();
      });
    });

    // CATEGORY DROPDOWN - CRIAR NOVA
    const catSelect = container.querySelector('#prod-category');
    if (catSelect) {
      catSelect.addEventListener('change', async () => {
        if (catSelect.value === 'new') {
          const newName = prompt('Digite o nome da nova categoria:');
          if (newName) {
            const newCat = await api.categories.create({ name: newName });
            if (newCat?.data) {
              if (refreshCallback) refreshCallback();
            }
          } else {
            catSelect.value = '';
          }
        }
      });
    }

    // EDIT PRODUCT POPULATE FORM
    const editBtns = container.querySelectorAll('.edit-prod-btn');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const product = JSON.parse(btn.getAttribute('data-product'));
        container.querySelector('#prod-id').value = product.id;
        container.querySelector('#prod-title').value = product.title;
        container.querySelector('#prod-price').value = product.price;
        container.querySelector('#prod-promo-price').value = product.promo_price || '';
        container.querySelector('#prod-category').value = product.category_id || '';
        container.querySelector('#prod-stock').value = product.stock || 0;
        container.querySelector('#prod-image').value = product.image_url || '';
        container.querySelector('#prod-desc').value = product.description || '';
        container.querySelector('#prod-featured').checked = !!product.is_featured;
        container.querySelector('#prod-active').checked = !!product.is_active;

        container.querySelector('#form-title').innerText = '✏️ Editar Produto';
        container.querySelector('#submit-prod-btn').innerText = 'Salvar Alterações';
        container.querySelector('#cancel-edit-btn').classList.remove('hidden');

        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // CANCEL EDIT
    const cancelBtn = container.querySelector('#cancel-edit-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        container.querySelector('#product-form').reset();
        container.querySelector('#prod-id').value = '';
        container.querySelector('#form-title').innerText = '➕ Cadastrar Produto';
        container.querySelector('#submit-prod-btn').innerText = 'Salvar Produto';
        cancelBtn.classList.add('hidden');
      });
    }

    // PRODUCT FORM SUBMIT (CREATE OR UPDATE)
    const prodForm = container.querySelector('#product-form');
    if (prodForm) {
      prodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = container.querySelector('#prod-id').value;
        const price = parseFloat(container.querySelector('#prod-price').value);

        if (price <= 0) {
          alert('O preço do produto deve ser maior que zero!');
          return;
        }

        const productData = {
          title: container.querySelector('#prod-title').value,
          price,
          promo_price: container.querySelector('#prod-promo-price').value ? parseFloat(container.querySelector('#prod-promo-price').value) : null,
          category_id: container.querySelector('#prod-category').value,
          stock: parseInt(container.querySelector('#prod-stock').value) || 0,
          image_url: container.querySelector('#prod-image').value,
          description: container.querySelector('#prod-desc').value,
          is_featured: container.querySelector('#prod-featured').checked,
          is_active: container.querySelector('#prod-active').checked,
          in_stock: parseInt(container.querySelector('#prod-stock').value) > 0
        };

        if (id) {
          await api.products.update(id, productData);
          alert('Produto atualizado com sucesso!');
        } else {
          await api.products.create(productData);
          alert('Produto cadastrado com sucesso!');
        }

        if (refreshCallback) refreshCallback();
      });
    }

    // DELETE PRODUCT
    const deleteBtns = container.querySelectorAll('.delete-prod-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Tem certeza que deseja excluir este produto?')) {
          await api.products.delete(id);
          alert('Produto excluído com sucesso!');
          if (refreshCallback) refreshCallback();
        }
      });
    });
  }
};
