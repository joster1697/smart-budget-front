import api from "./api";

export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color?: string;
  icon?: string;
}

export interface CategoryResponse {
  message: string;
  categories: Category[];
}

export interface SingleCategoryResponse {
  message: string;
  category: Category;
}

export const categoryService = {
  getCategories: () => api.get<CategoryResponse>("/categories"),
  createCategory: (data: Partial<Category>) => api.post<SingleCategoryResponse>("/categories", data),
  updateCategory: (id: string, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete<void>(`/categories/${id}`),
};
