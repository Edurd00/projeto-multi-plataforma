import { api } from '../../services/api.js';
import { Toast } from '../common/Toast.js';

export const QuickAdminModal = {
  isOpen: false,

  async render() {
    const [{ data: products }, { data: categories }] = await Promise.all([
      api.products.getAll(),
      api.categories.getAll()
    ]);

    return `
      <div id="quick-admin-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-gray-100 animate-in fade-in zoom-in-95 duration-200">

          <div class="flex justify-between items-center border-b pb-3">
            <div>
              <h3 class="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                ⚙️ Gerenciador de Produtos (Painel Demo)
              </h3>
              <p class="text-xs text-gray-500">Adicione ou exclua itens do estado em memória para testar o CRUD no cliente.</p>
            </div>
            <button id="close-quick-admin" class="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg hover:bg-gray-100 text-lg transition">
              ✕
            </button>
          </div>

          <!-- NOVO PRODUTO -->
          <form id="quick-add-form" class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 class="font-bold text-gray-800 text-xs uppercase tracking-wider">➕ Adicionar Produto Fictício</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-gray-600 uppercase mb-1">Título *</label>
                <input type="text" id="quick-prod-title" required class="w-full border rounded-lg p-2 text-xs bg-white" placeholder="Ex: Jaqueta Corta Vento" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-gray-600 uppercase mb-1">Preço (R$) *</label>
                <input type="number" step="0.01" id="quick-prod-price" required class="w-full border rounded-lg p-2 text-xs bg-white" placeholder="129.90" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-gray-600 uppercase mb-1">Categoria *</label>
                <select id="quick-prod-category" required class="w-full border rounded-lg p-2 text-xs bg-white">
                  ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-gray-600 uppercase mb-1">URL da Imagem</label>
                <input type="url" id="quick-prod-image" class="w-full border rounded-lg p-2 text-xs bg-white" placeholder="https://images.unsplash.com/..." />
              </div>
            </div>

            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition shadow-sm">
              Salvar Produto no Mock
            </button>
          </form>

          <!-- LISTA EXISTENTE -->
          <div class="space-y-3">
            <h4 class="font-bold text-gray-800 text-xs uppercase tracking-wider">📦 Produtos Atuais (${products.length})</h4>
            <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
              ${products.map(p => `
                <div class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <div class="flex items-center gap-3">
                    <img src="${p.image_url}" class="w-10 h-10 rounded-lg object-cover bg-white border" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';" />
                    <div>
                      <p class="font-bold text-xs text-gray-800 line-clamp-1">${p.title}</p>
                      <p class="text-[11px] text-gray-500">R$ ${p.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <button data-id="${p.id}" class="quick-delete-btn text-xs bg-red-100 text-red-600 hover:bg-red-200 font-bold px-3 py-1.5 rounded-lg transition">
                    Excluir
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-2 border-t flex justify-between items-center text-xs">
            <a href="?page=admin" class="font-bold text-blue-600 hover:underline">Ir para o Painel Completo de Pedidos (Kanban) →</a>
            <button id="close-quick-admin-footer" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-lg transition">Fechar</button>
          </div>

        </div>
      </div>
    `;
  },

  async open(onUpdateCallback) {
    let container = document.getElementById('quick-admin-modal-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'quick-admin-modal-container';
      document.body.appendChild(container);
    }
    container.innerHTML = await this.render();
    this.bindEvents(container, onUpdateCallback);
  },

  close() {
    const container = document.getElementById('quick-admin-modal-container');
    if (container) container.innerHTML = '';
  },

  bindEvents(container, onUpdateCallback) {
    const closeBtn = container.querySelector('#close-quick-admin');
    const closeFooter = container.querySelector('#close-quick-admin-footer');
    if (closeBtn) closeBtn.onclick = () => this.close();
    if (closeFooter) closeFooter.onclick = () => this.close();

    // Quick Add
    const form = container.querySelector('#quick-add-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const title = container.querySelector('#quick-prod-title').value;
        const price = parseFloat(container.querySelector('#quick-prod-price').value);
        const category_id = container.querySelector('#quick-prod-category').value;
        const image_url = container.querySelector('#quick-prod-image').value || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';

        await api.products.create({
          title,
          price,
          category_id,
          image_url,
          stock: 10,
          in_stock: true,
          is_active: true
        });

        Toast.show('Produto adicionado ao Mock com sucesso!', 'success');
        this.close();
        if (onUpdateCallback) onUpdateCallback();
      };
    }

    // Quick Delete
    const deleteBtns = container.querySelectorAll('.quick-delete-btn');
    deleteBtns.forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        await api.products.delete(id);
        Toast.show('Produto excluído do Mock.', 'info');
        this.close();
        if (onUpdateCallback) onUpdateCallback();
      };
    });
  }
};
