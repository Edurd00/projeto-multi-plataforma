import { supabase } from '../config/supabase.js';

export const promotionService = {
  /**
   * Busca apenas produtos que estão com preço promocional preenchido e menor que o preço original
   */
  async getPromoProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .not('promo_price', 'is', null) // Garante que há preço promocional
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filtro extra de segurança para garantir integridade matemática do desconto
      return (data || []).filter(product => product.promo_price < product.price);
    } catch (error) {
      console.error('Erro no promotionService.getPromoProducts:', error.message);
      return [];
    }
  }
};