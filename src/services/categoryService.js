import { api } from './api.js';

export const categoryService = {
  async getCategories() {
    try {
      const { data, error } = await api.categories.getAll();
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro no categoryService.getCategories:', error.message);
      return [];
    }
  },

  async createCategory(name) {
    try {
      const { data, error } = await api.categories.create({ name });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error.message);
      return null;
    }
  }
};
