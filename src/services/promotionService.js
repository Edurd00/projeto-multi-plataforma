import { api } from './api.js';

export const promotionService = {
  async getActivePromotions() {
    try {
      const { data, error } = await api.promotions.getAll();
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro no promotionService.getActivePromotions:', error.message);
      return [];
    }
  }
};
