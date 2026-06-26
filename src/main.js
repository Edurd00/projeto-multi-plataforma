import './styles/index.css';
import { appContext } from './context/AppContext.js';
import { Home } from './pages/store/Home.js';
import { CartDrawer } from './components/cart/CartDrawer.js';
import { CheckoutModal } from './components/cart/CheckoutModal.js';
import { orderService } from './services/orderService.js';
import { Dashboard } from './pages/admin/Dashboard.js';
import { Login } from './pages/auth/Login.js';
import { supabase } from './config/supabase.js';

async function mountApp() {
  await appContext.initTenant();
  const appDiv = document.getElementById('app');
  if (!appDiv) return;

  const { tenant: tenantData, error } = appContext.getState();

  if (error) {
    appDiv.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div class="max-w-md space-y-6 bg-white p-10 rounded-3xl shadow-xl border border-red-50">
          <div class="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 class="text-2xl font-black text-gray-900">Erro de Conexão</h2>
          <p class="text-gray-500 font-medium">Não conseguimos conectar ao banco de dados. Verifique sua internet.</p>
          <button onclick="location.reload()" class="w-full bg-lojaPrimaria text-white font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95">Tentar Novamente</button>
        </div>
      </div>
    `;
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = urlParams.get('page');
  const { data: { session } } = await supabase.auth.getSession();

  if (currentPage === 'login') {
    appDiv.innerHTML = Login.render();
    Login.bindEvents(appDiv);
    return;
  }

  if (currentPage === 'admin') {
    if (!session) { window.location.search = '?page=login'; return; }
    async function renderAdmin() {
      appDiv.innerHTML = await Dashboard.render();
      const headerAdmin = appDiv.querySelector('h1').parentElement;
      const logoutBtn = document.createElement('button');
      logoutBtn.className = "text-[10px] bg-red-50 text-red-500 px-3 py-1 rounded-full font-black uppercase tracking-widest hover:bg-red-100 transition ml-4";
      logoutBtn.innerText = "Sair";
      logoutBtn.onclick = async () => {
        await supabase.auth.signOut();
        window.location.search = '';
      };
      headerAdmin.appendChild(logoutBtn);
      Dashboard.bindEvents(appDiv, () => renderAdmin());
    }
    await renderAdmin();
    return;
  }

  const brandHeaderHTML = tenantData?.logo_url
    ? `<img src="${tenantData.logo_url}" class="h-10 w-auto object-contain" alt="Logo" />`
    : `<span class="text-xl font-black text-lojaPrimaria uppercase tracking-tighter">${tenantData?.store_name || 'VITRINE'}</span>`;

  appDiv.innerHTML = `
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-6">
          <a href="/">${brandHeaderHTML}</a>
          <a href="/?page=admin" class="hidden md:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-lojaPrimaria transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Painel
          </a>
        </div>
        <button id="floating-cart-trigger" class="bg-lojaPrimaria text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-lojaPrimaria/20 transition-all active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <span id="cart-counter-slot">0</span>
        </button>
      </div>
    </header>
    <div id="home-view-container"></div>
    <div id="cart-drawer-container"></div>
    <div id="checkout-modal-container"></div>
    <div id="product-modal-container"></div>
  `;

  const homeContainer = document.getElementById('home-view-container');
  const cartContainer = document.getElementById('cart-drawer-container');
  const checkoutContainer = document.getElementById('checkout-modal-container');
  const cartCounterSlot = document.getElementById('cart-counter-slot');

  async function updateUI() {
    const { cart } = appContext.getState();
    if (cartCounterSlot) cartCounterSlot.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
    cartContainer.innerHTML = CartDrawer.render();
    CartDrawer.bindEvents(cartContainer, () => CheckoutModal.open());
    checkoutContainer.innerHTML = CheckoutModal.render();
    CheckoutModal.bindEvents(checkoutContainer, async (formData) => {
      const { tenant } = appContext.getState();
      const res = await orderService.createOrder({ ...formData, cartItems: cart, tenant });
      if (res.success) { CheckoutModal.close(); appContext.clearCart(); }
    });
  }

  homeContainer.innerHTML = Home.renderSkeleton();
  const homeHTML = await Home.render();
  homeContainer.innerHTML = homeHTML;
  Home.bindEvents(homeContainer);

  window.addEventListener('global:add-to-cart', async (e) => {
    const { id, quantity, size, color } = e.detail;
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
    if (product) {
      appContext.addToCart(product, quantity || 1, { size, color });
      CartDrawer.open();
    }
  });
  
  document.getElementById('floating-cart-trigger').onclick = () => CartDrawer.open();
  appContext.subscribe(() => updateUI());
  await updateUI();
}
mountApp();
