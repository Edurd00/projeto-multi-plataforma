import { api } from '../../services/api.js';

export const Login = {
  render() {
    return `
      <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-black text-gray-900">Painel do Lojista</h2>
            <p class="text-xs text-gray-500 mt-1">Insira suas credenciais para gerenciar a loja</p>
          </div>

          <!-- DICA DE DEMO -->
          <div class="bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg p-3 mb-6">
            💡 <strong>Modo Demonstração:</strong> Você pode usar qualquer e-mail e senha para acessar o painel de testes!
          </div>

          <form id="login-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail</label>
              <input
                type="email"
                id="login-email"
                value="demo@lojista.com"
                required
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Senha</label>
              <input
                type="password"
                id="login-password"
                value="123456"
                required
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div id="login-error" class="hidden text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-center"></div>

            <button
              type="submit"
              id="login-btn"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition shadow-md"
            >
              Entrar no Painel
            </button>
          </form>

          <div class="mt-6 text-center">
            <a href="?" class="text-xs font-semibold text-gray-500 hover:text-gray-800 transition">
              ← Voltar para a Loja
            </a>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(container) {
    const form = container.querySelector('#login-form');
    const errorDiv = container.querySelector('#login-error');
    const submitBtn = container.querySelector('#login-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = container.querySelector('#login-email').value;
      const password = container.querySelector('#login-password').value;

      errorDiv.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Autenticando...';

      const { data, error } = await api.auth.signInWithPassword({ email, password });

      if (error) {
        errorDiv.innerText = error.message;
        errorDiv.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Entrar no Painel';
      } else {
        window.location.search = '?page=admin';
      }
    });
  }
};
