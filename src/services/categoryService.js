import { supabase } from '../config/supabase.js';

export const categoryService = {
  /**
   * Retorna todas as categorias marcadas como ativas no sistema
   */
  async getAllActive() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro no categoryService.getAllActive:', error.message);
      return [];
    }
  }
};