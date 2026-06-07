import { supabase } from '../config/supabase.js';

export const productService = {
  /**
   * Busca produtos aplicando filtros dinâmicos (Categoria, Busca, Ordenação)
   */
  async getProducts({ categoryId, searchQuery, orderBy = 'featured' } = {}) {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('in_stock', true); // Apenas itens disponíveis na vitrine

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (orderBy === 'asc') {
        query = query.order('price', { ascending: true });
      } else if (orderBy === 'desc') {
        query = query.order('price', { ascending: false });
      } else if (orderBy === 'featured') {
        query = query.order('is_featured', { ascending: false })
                     .order('created_at', { ascending: false });
      }

      const { data, error } = await query;
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
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error.message);
      return null;
    }
  }
};