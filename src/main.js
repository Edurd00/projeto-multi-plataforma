import './styles/index.css';
import { appContext } from './context/AppContext.js';
import { Home } from './pages/store/Home.js';
import { CartDrawer } from './components/cart/CartDrawer.js';
import { CheckoutModal } from './components/cart/CheckoutModal.js';
import { orderService } from './services/orderService.js';
import { Dashboard } from './pages/admin/Dashboard.js';
import { Login } from './pages/auth/Login.js';
import { api } from './services/api.js';

// Função arquitetural para trocar o favicon do navegador dinamicamente
function updateFavicon(url) {
  if (!url) return;

  // Remove favicons existentes para evitar conflitos
  const existingFavicons = document.querySelectorAll("link[rel*='icon']");
  existingFavicons.forEach(el => el.parentNode.removeChild(el));

  // Cria a nova tag link apontando para a URL da logo do administrador
  const link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = url;

  // Injeta no <head> do documento
  document.getElementsByTagName('head')[0].appendChild(link);
}

async function mountApp() {
  await appContext.initTenant();

  const appDiv = document.getElementById('app');
  if (!appDiv) return;

  // Recupera as configurações do tenant atualizado
  const tenantData = appContext.getState().tenant;

  // Executa a alteração automática do Favicon baseado nos dados
  if (tenantData?.logo_url) {
    updateFavicon(tenantData.logo_url);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = urlParams.get('page');
  const { data: { session } } = await api.auth.getSession();

  // ROTA: LOGIN
  if (currentPage === 'login') {
    if (session) { window.location.search = '?page=admin'; return; }
    appDiv.innerHTML = Login.render();
    Login.bindEvents(appDiv);
    return;
  }

  // ROTA: ADMIN
  if (currentPage === 'admin') {
    if (!session) { window.location.search = '?page=login'; return; }
    async function renderAdmin() {
      appDiv.innerHTML = await Dashboard.render();
      const headerAdmin = appDiv.querySelector('h1').parentElement;
      const logoutBtn = document.createElement('button');
      logoutBtn.className = "text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold mt-1 hover:bg-red-200 transition ml-2";
      logoutBtn.innerText = "Sair (Logout)";
      logoutBtn.onclick = async () => {
        await api.auth.signOut();
        window.location.search = '';
      };
      headerAdmin.appendChild(logoutBtn);
      Dashboard.bindEvents(appDiv, () => renderAdmin());
    }
    await renderAdmin();
    return;
  }

  // ROTA: VITRINE DO CLIENTE (com injeção opcional da Logo no Header)
  const hasLogo = tenantData?.logo_url;
  const brandHeaderHTML = hasLogo
    ? `<img src="${tenantData.logo_url}" class="h-10 md:h-12 max-w-[200px] object-contain object-left id="store-logo-slot" alt="${tenantData.store_name}" />`
    : `<span id="store-title-slot" class="text-xl font-black text-gray-900 tracking-tight uppercase">${tenantData?.store_name || 'VITRINE'}</span>`;

  appDiv.innerHTML = `
    <header class="h-16 bg-white border-b border-gray-100 sticky top-0 z-40 px-6">
      <div class="max-w-6xl mx-auto h-full flex justify-between items-center">
        <div class="flex items-center gap-4">
          ${brandHeaderHTML}
        </div>
        <div class="flex items-center gap-3">
          <a href="?page=admin" class="text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-2 rounded-lg transition hidden sm:inline-block">
            ⚙️ Painel Demo
          </a>
          <button id="floating-cart-trigger" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span id="cart-counter-slot">Carrinho (0)</span>
          </button>
        </div>
      </div>
    </header>

    <div id="home-view-container"></div>
    <div id="cart-drawer-container"></div>
    <div id="checkout-modal-container"></div>
  `;

  // Inicialização das views e sub-regras...
  const homeContainer = document.getElementById('home-view-container');
  const cartContainer = document.getElementById('cart-drawer-container');
  const checkoutContainer = document.getElementById('checkout-modal-container');
  const cartCounterSlot = document.getElementById('cart-counter-slot');

  async function updateUI() {
    const { cart } = appContext.getState();
    if (cartCounterSlot) cartCounterSlot.innerText = `Carrinho (${cart.reduce((sum, i) => sum + i.quantity, 0)})`;
    cartContainer.innerHTML = CartDrawer.render();
    CartDrawer.bindEvents(cartContainer, () => CheckoutModal.open());
    checkoutContainer.innerHTML = CheckoutModal.render();
    CheckoutModal.bindEvents(checkoutContainer, async (formData) => {
      const { tenant } = appContext.getState();
      const res = await orderService.createOrder({ ...formData, cartItems: cart, tenant });
      if (res.success) { CheckoutModal.close(); appContext.clearCart(); }
    });
  }

  homeContainer.innerHTML = await Home.render();
  Home.bindEvents(homeContainer);

  window.addEventListener('global:add-to-cart', async (e) => {
    const { id, size, color } = e.detail;

    const { data: product } = await api.products.getById(id);

    if (product) {
      const options = {};
      if (size && size !== 'N/A') options.size = size;
      if (color && color !== 'N/A') options.color = color;

      appContext.addToCart(product, 1, options);
      CartDrawer.open();
    }
  });
  
  document.getElementById('floating-cart-trigger').onclick = () => CartDrawer.open();
  appContext.subscribe(() => updateUI());
  await updateUI();
}

mountApp();
