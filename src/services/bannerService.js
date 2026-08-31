import { api } from './api.js';

export const bannerService = {
  async getActiveBanners() {
    try {
      const { data, error } = await api.banners.getAll();
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro no bannerService.getActiveBanners:', error.message);
      return [];
    }
  }
};
