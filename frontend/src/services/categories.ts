import apiCall from './api';
import { Category } from '../data/types';

export const categoryService = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    return apiCall<Category[]>('/categories');
  },

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<Category> {
    return apiCall<Category>(`/categories/${slug}`);
  }
};
