import { appContext } from '../../context/AppContext.js';

export const ProductCard = {
  render(product) {
    const hasDiscount = product.promo_price && product.promo_price < product.price;
    const finalPrice = hasDiscount ? product.promo_price : product.price;

    // Formatação de Moeda Brasileira
    const formatCurrency = (value) => 
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Geramos um ID único para o botão de compra rápida para interceptar o clique via delegação de eventos
    return `
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col h-full">
        <div class="relative pt-[100%] bg-gray-50">
          <img 
            src="${product.image_url || 'https://via.placeholder.com/300'}" 
            alt="${product.title}" 
            class="absolute top-0 left-0 w-full h-full object-cover"
            loading="lazy"
          />
          ${hasDiscount ? `
            <span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              OFERTA
            </span>
          ` : ''}
        </div>
        
        <div class="p-4 flex flex-col flex-grow">
          <h3 class="font-semibold text-gray-800 text-base line-clamp-2 min-h-[3rem] mb-1">
            ${product.title}
          </h3>
          <p class="text-xs text-gray-500 line-clamp-2 mb-3 flex-grow">
            ${product.description || 'Sem descrição disponível.'}
          </p>
          
          <div class="flex flex-col mb-4">
            ${hasDiscount ? `
              <span class="text-xs text-gray-400 line-through">${formatCurrency(product.price)}</span>
              <span class="text-lg font-bold text-red-600">${formatCurrency(product.promo_price)}</span>
            ` : `
              <span class="text-lg font-bold text-primary">${formatCurrency(product.price)}</span>
            `}
          </div>

          <button 
            data-id="${product.id}"
            class="js-add-to-cart w-full bg-primary hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Adicionar
          </button>
        </div>
      </div>
    `;
  },

  // Vincula os eventos do card após ele ser inserido no DOM
  bindEvents(container) {
    container.querySelectorAll('.js-add-to-cart').forEach(button => {
      button.onclick = async (e) => {
        e.preventDefault();
        const productId = button.getAttribute('data-id');
        
        // Simulação rápida para adicionar direto ao carrinho pelo ID (na etapa 10 deixaremos robusto)
        alert(`Produto adicionado ao carrinho!`);
      };
    });
  }
};