import api from "./api";

export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color?: string;
  icon?: string;
}

export const categoryService = {
  getCategories: () => api.get<Category[]>("/categories"),
  createCategory: (data: Partial<Category>) => api.post<Category>("/categories", data),
  updateCategory: (id: string, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete<void>(`/categories/${id}`),
};
