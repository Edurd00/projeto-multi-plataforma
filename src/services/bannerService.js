import { supabase } from '../config/supabase.js';

export const bannerService = {
  /**
   * Retorna todos os banners ativos para exibição na Home
   */
  async getActiveBanners() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro no bannerService.getActiveBanners:', error.message);
      return [];
    }
  }
};