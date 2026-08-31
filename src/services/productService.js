import { api } from './api.js';

export const productService = {
  /**
   * Busca produtos aplicando filtros dinâmicos (Categoria, Busca, Ordenação)
   */
  async getProducts({ categoryId, searchQuery, orderBy = 'featured' } = {}) {
    try {
      const { data, error } = await api.products.getAll({
        categoryId,
        searchQuery,
        orderBy,
        storefrontOnly: true
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro no productService.getProducts:', error.message);
      return [];
    }
  },

  /**
   * Busca um produto específico através do ID (Útil para a página de detalhes)
   */
  async getById(id) {
    try {
      const { data, error } = await api.products.getById(id);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error.message);
      return null;
    }
  }
};
