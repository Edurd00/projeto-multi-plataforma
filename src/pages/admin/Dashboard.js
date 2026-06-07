import { supabase } from '../../config/supabase.js';
import { injectTheme } from '../../config/theme.js';

export const Dashboard = {
  async render() {
    // 1. Busca todos os dados em paralelo direto do Supabase
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

    const formatCurrency = (value) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return `
      <div class="min-h-screen bg-gray-100 p-6">
        <div class="max-w-6xl mx-auto space-y-8">
          
          <!-- CABEÇALHO ADMIN -->
          <div class="flex justify-between items-center border-b pb-4 border-gray-200">
            <div>
              <h1 class="text-3xl font-black text-gray-900 tracking-tight">Painel de Controle</h1>
              <p class="text-sm text-gray-500">Gerenciamento da Loja: <strong>${tenant.store_name || 'Não configurada'}</strong></p>
            </div>
            <a href="/" class="bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-2 rounded-xl text-sm transition shadow-sm">
              Voltar para Vitrine
            </a>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- COLUNA ESQUERDA: CONFIGURAÇÕES E CADASTROS -->
            <div class="space-y-6 lg:col-span-1">
              
              <!-- FORMULÁRIO 1: CONFIGURAÇÃO DO TENANT (IDENTIDADE + REDES SOCIAIS) -->
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 class="font-bold text-gray-800 text-base border-b pb-2">Configurações da Loja</h3>
                <form id="admin-tenant-form" class="space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Marca</label>
                    <input type="text" id="conf-name" value="${tenant.store_name || ''}" required class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">URL do Logotipo</label>
                    <input type="url" id="conf-logo" value="${tenant.logo_url || ''}" class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://linkdaimagem.com/logo.png" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Título do Banner (Hero)</label>
                    <input type="text" id="conf-hero-title" value="${tenant.hero_title || ''}" class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Título da Hero" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Subtítulo do Banner (Hero)</label>
                    <textarea id="conf-hero-subtitle" class="w-full border rounded-lg p-2 text-sm h-16 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Subtítulo da Hero">${tenant.hero_subtitle || ''}</textarea>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp de Destino</label>
                    <input type="text" id="conf-phone" value="${tenant.whatsapp_number || ''}" required class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  
                  <!-- CAMPOS: REDES SOCIAIS -->
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Link do Instagram</label>
                    <input type="url" id="conf-instagram" value="${tenant.instagram_url || ''}" class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://instagram.com/sualoja" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Link do Facebook</label>
                    <input type="url" id="conf-facebook" value="${tenant.facebook_url || ''}" class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://facebook.com/sualoja" />
                  </div>

                  <!-- NOVO CAMPO: ENDEREÇO DA LOJA -->
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço de Operação / Retirada</label>
                    <input type="text" id="conf-address" value="${tenant.address || ''}" class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP" />
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cor Primária</label>
                      <input type="color" id="conf-primary" value="${tenant.primary_color || '#3b82f6'}" class="w-full h-9 rounded-lg border p-1 cursor-pointer" />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cor Secundária</label>
                      <input type="color" id="conf-secondary" value="${tenant.secondary_color || '#1e3a8a'}" class="w-full h-9 rounded-lg border p-1 cursor-pointer" />
                    </div>
                  </div>
                  <button type="submit" class="w-full bg-primary text-white font-bold py-2 rounded-xl text-sm transition hover:bg-opacity-90 shadow-sm mt-2">
                    Salvar Identidade
                  </button>
                </form>
              </div>

              <!-- FORMULÁRIO 2: GERENCIAR/ADICIONAR CATEGORIAS -->
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 class="font-bold text-gray-800 text-base border-b pb-2">Categorias do Menu</h3>
                
                <form id="admin-category-form" class="flex gap-2">
                  <input type="text" id="cat-name" required class="flex-grow border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Bebidas, Roupas, etc." />
                  <button type="submit" class="bg-primary text-white font-bold px-4 rounded-lg text-sm hover:bg-opacity-90 transition shadow-sm">
                    +
                  </button>
                </form>

                <div class="space-y-2 max-h-[20vh] overflow-y-auto pr-1">
                  ${categories.map(cat => `
                    <div class="flex items-center justify-between border rounded-lg p-2 bg-gray-50 text-sm">
                      <span class="font-medium text-gray-700">${cat.name}</span>
                      <button data-category-id="${cat.id}" class="js-delete-category text-red-500 hover:text-red-700 p-1 rounded-md transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- FORMULÁRIO 3: CADASTRO DE PRODUTO + FRETE POR PRODUTO -->
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 class="font-bold text-gray-800 text-base border-b pb-2">Cadastrar Novo Produto</h3>
                <form id="admin-product-form" class="space-y-3">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Título do Produto</label>
                    <input type="text" id="prod-title" required class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Ex: Camiseta Slim Fit" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                    <select id="prod-category" required class="w-full border rounded-lg p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="" disabled selected>Selecione uma categoria</option>
                      ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Preço (R$)</label>
                      <input type="number" step="0.01" id="prod-price" required class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="99.90" />
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Promoção (R$)</label>
                      <input type="number" step="0.01" id="prod-promo" class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Opcional" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Imagem</label>
                    <input type="url" id="prod-image" class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="https://exemplo.com/foto.jpg" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Taxa de Frete/Entrega deste Item (R$)</label>
                    <input type="number" step="0.01" id="prod-shipping" class="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0.00 (Deixe 0 para Grátis ou A Combinar)" />
                    <p class="text-[10px] text-gray-400 mt-0.5">Se o cliente comprar múltiplos itens com fretes diferentes, o sistema utilizará o maior valor de frete encontrado.</p>
                  </div>
                  <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl text-sm transition shadow-sm mt-2">
                    Adicionar ao Catálogo
                  </button>
                </form>
              </div>

            </div>

            <!-- COLUNA DIREITA: PEDIDOS E GERENCIAMENTO DE PRODUTOS -->
            <div class="space-y-6 lg:col-span-2">
              
              <!-- SEÇÃO DE PEDIDOS -->
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <div class="flex justify-between items-center border-b pb-2">
                  <h3 class="font-bold text-gray-800 text-base">Últimos Pedidos Recebidos</h3>
                  <span class="bg-gray-100 text-gray-600 font-bold px-2.5 py-0.5 rounded-full text-xs">${orders.length} pedidos</span>
                </div>

                <div class="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                  ${orders.length === 0 ? `
                    <div class="text-center py-8 text-gray-400 text-sm">Nenhum pedido efetuado ainda.</div>
                  ` : orders.map(ord => {
                      const date = new Date(ord.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                      return `
                        <div class="border rounded-xl p-4 bg-gray-50 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                          <div class="space-y-1">
                            <div class="flex items-center gap-2">
                              <span class="text-sm font-black text-gray-800">#${ord.id.slice(0, 6).toUpperCase()}</span>
                              <span class="text-xs text-gray-400">${date}</span>
                            </div>
                            <p class="text-sm text-gray-700"><strong>Cliente:</strong> ${ord.customer_name} (${ord.customer_phone})</p>
                            <p class="text-xs text-gray-500 line-clamp-1"><strong>Envio:</strong> ${ord.delivery_address || 'Retirada'}</p>
                            <p class="text-xs text-primary font-medium">Pagamento via: ${ord.payment_method}</p>
                          </div>
                          <div class="flex md:flex-col items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0">
                            <span class="text-base font-black text-gray-900 mb-1">${formatCurrency(ord.total_amount)}</span>
                            <select data-order-id="${ord.id}" class="js-status-changer border text-xs font-bold rounded-lg p-1.5 bg-white shadow-sm focus:outline-none">
                              <option value="pending" ${ord.status === 'pending' ? 'selected' : ''}>Pendente</option>
                              <option value="confirmed" ${ord.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
                              <option value="shipped" ${ord.status === 'shipped' ? 'selected' : ''}>Despachado</option>
                              <option value="cancelled" ${ord.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                            </select>
                          </div>
                        </div>
                      `;
                    }).join('')}
                </div>
              </div>

              <!-- GERENCIAR PRODUTOS DO CATÁLOGO -->
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <div class="flex justify-between items-center border-b pb-2">
                  <h3 class="font-bold text-gray-800 text-base">Produtos no Catálogo</h3>
                  <span class="bg-gray-100 text-gray-600 font-bold px-2.5 py-0.5 rounded-full text-xs">${products.length} itens</span>
                </div>

                <div class="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                  ${products.length === 0 ? `
                    <div class="text-center py-8 text-gray-400 text-sm">Nenhum produto cadastrado.</div>
                  ` : products.map(prod => {
                      const finalPrice = prod.promo_price || prod.price;
                      return `
                        <div class="flex items-center justify-between border rounded-xl p-3 bg-gray-50 hover:bg-gray-100 transition">
                          <div class="flex items-center gap-3">
                            <img src="${prod.image_url}" class="w-10 h-10 object-cover rounded-lg bg-white border" alt="${prod.title}" />
                            <div>
                              <h4 class="text-sm font-bold text-gray-800 line-clamp-1">${prod.title}</h4>
                              <p class="text-xs text-gray-400">${prod.categories?.name || 'Geral'} • <span class="text-gray-600 font-medium">${formatCurrency(finalPrice)}</span></p>
                            </div>
                          </div>
                          <button data-product-id="${prod.id}" class="js-delete-product p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      `;
                    }).join('')}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;
  },

  bindEvents(container, onRefresh) {
    const tenantForm = container.querySelector('#admin-tenant-form');
    const categoryForm = container.querySelector('#admin-category-form');
    const productForm = container.querySelector('#admin-product-form');

    // 1. Ouvinte para atualização das configurações da Loja + Redes Sociais + Endereço
    if (tenantForm) {
      tenantForm.onsubmit = async (e) => {
        e.preventDefault();
        const updatedName = container.querySelector('#conf-name').value;
        const updatedPhone = container.querySelector('#conf-phone').value;
        const updatedLogo = container.querySelector('#conf-logo').value;
        const updatedHeroTitle = container.querySelector('#conf-hero-title').value;
        const updatedHeroSubtitle = container.querySelector('#conf-hero-subtitle').value;
        const primaryColor = container.querySelector('#conf-primary').value;
        const secondaryColor = container.querySelector('#conf-secondary').value;
        const updatedInstagram = container.querySelector('#conf-instagram').value;
        const updatedFacebook = container.querySelector('#conf-facebook').value;
        
        // NOVO: Captura o valor digitado no input de endereço
        const updatedAddress = container.querySelector('#conf-address').value;

        const { data: currentTenant } = await supabase.from('tenant_settings').select('id').maybeSingle();

        const { error } = await supabase
          .from('tenant_settings')
          .update({
            store_name: updatedName,
            whatsapp_number: updatedPhone,
            logo_url: updatedLogo,
            hero_title: updatedHeroTitle,
            hero_subtitle: updatedHeroSubtitle,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            instagram_url: updatedInstagram,
            facebook_url: updatedFacebook,
            address: updatedAddress // INCLUÍDO COM SUCESSO NO UPDATE
          })
          .eq('id', currentTenant.id);

        if (!error) {
          injectTheme(primaryColor, secondaryColor);
          alert('Configurações salvas com sucesso!');
          onRefresh();
        } else {
          alert('Erro ao salvar configurações: ' + error.message);
        }
      };
    }

    // 2. Cadastro de categoria com geração inteligente de Slug
    if (categoryForm) {
      categoryForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = container.querySelector('#cat-name').value;

        const slug = name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

        const { error } = await supabase
          .from('categories')
          .insert({ name, slug });

        if (!error) {
          alert('Nova categoria criada!');
          categoryForm.reset();
          onRefresh();
        } else {
          alert('Erro ao criar categoria: ' + error.message);
        }
      };
    }

    // 3. Remoção de Categoria com validação segura
    container.querySelectorAll('.js-delete-category').forEach(button => {
      button.onclick = async () => {
        const categoryId = button.getAttribute('data-category-id');
        const confirmDelete = confirm("Excluir esta categoria? Produtos associados a ela ficarão sem categoria.");

        if (confirmDelete) {
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

          if (!error) {
            alert('Categoria removida com sucesso!');
            onRefresh();
          } else {
            alert('Não foi possível excluir. Verifique se existem produtos dependendo exclusivamente desta categoria.');
            console.error(error.message);
          }
        }
      };
    });

    // 4. Ouvinte para inclusão de novos produtos (captura o frete individual corretamente)
    if (productForm) {
      productForm.onsubmit = async (e) => {
        e.preventDefault();
        const title = container.querySelector('#prod-title').value;
        const categoryId = container.querySelector('#prod-category').value;
        const price = parseFloat(container.querySelector('#prod-price').value);
        const promoInput = container.querySelector('#prod-promo').value;
        const imageUrl = container.querySelector('#prod-image').value;
        const shippingInput = container.querySelector('#prod-shipping').value;
        const shippingFee = shippingInput ? parseFloat(shippingInput) : 0.00;

        const promoPrice = promoInput ? parseFloat(promoInput) : null;

        const { error } = await supabase
          .from('products')
          .insert({
            title,
            category_id: categoryId,
            price,
            promo_price: promoPrice,
            image_url: imageUrl || 'https://via.placeholder.com/300',
            shipping_fee: shippingFee,
            in_stock: true
          });

        if (!error) {
          alert('Produto adicionado ao catálogo!');
          productForm.reset();
          onRefresh();
        } else {
          alert('Erro ao cadastrar produto: ' + error.message);
        }
      };
    }

    // 5. Troca de Status de Pedidos
    container.querySelectorAll('.js-status-changer').forEach(select => {
      select.onchange = async () => {
        const orderId = select.getAttribute('data-order-id');
        const newStatus = select.value;
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      };
    });

    // 6. Remoção de produtos do catálogo
    container.querySelectorAll('.js-delete-product').forEach(button => {
      button.onclick = async () => {
        const productId = button.getAttribute('data-product-id');
        if (confirm("Deseja remover este produto do catálogo?")) {
          const { error } = await supabase.from('products').delete().eq('id', productId);
          if (!error) { alert('Produto removido!'); onRefresh(); }
        }
      };
    });
  }
};