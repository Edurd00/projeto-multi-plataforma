import { supabase } from '../../config/supabase.js';

export const Login = {
  render() {
    return `
      <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
          <div class="text-center">
            <h2 class="text-3xl font-black text-gray-900 tracking-tight">Área Restrita</h2>
            <p class="text-sm text-gray-500 mt-1">Identifique-se para acessar o painel administrativo.</p>
          </div>
          
          <form id="login-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">E-mail</label>
              <input type="email" id="login-email" required class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="admin@sualoja.com" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Senha</label>
              <input type="password" id="login-password" required class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none" placeholder="••••••••" />
            </div>
            
            <button type="submit" class="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-3 rounded-xl transition text-sm shadow-sm mt-2">
              Entrar no Painel
            </button>
          </form>
          
          <div class="text-center pt-2">
            <a href="/" class="text-xs text-gray-400 hover:text-gray-600 transition font-medium">← Voltar para a Vitrine</a>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(container) {
    const form = container.querySelector('#login-form');
    if (!form) return;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const email = container.querySelector('#login-email').value;
      const password = container.querySelector('#login-password').value;

      // Executa o sign-in oficial na API do Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        alert('Acesso Negado: Dados inválidos ou sem permissão.');
      } else {
        // Autenticado com sucesso! Redireciona para o painel administrativo
        window.location.search = '?page=admin';
      }
    };
  }
};