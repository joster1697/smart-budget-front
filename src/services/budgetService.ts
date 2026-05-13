import api from "./api";

export interface BudgetCategoryInput {
  category_id: string;
  allocated_amount: number;
}

export interface CreateBudgetInput {
  period: string; // e.g. "2026-05"
  planned_income: number;
  categories: BudgetCategoryInput[];
}

export interface UpdateBudgetInput {
  planned_income?: number;
  categories?: BudgetCategoryInput[];
}

export interface BudgetCategoryStatus {
  category_id?: string;
  category_name: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  usage_percentage: number;
  is_exceeded: boolean;
}

export interface BudgetStatus {
  id?: string;
  period: string;
  planned_income: number;
  total_allocated: number;
  total_spent: number;
  available_to_budget: number;
  categories: BudgetCategoryStatus[];
}

export interface BudgetResponse {
  message: string;
  budget: BudgetStatus;
}

export const budgetService = {
  getBudget: (period: string) => api.get<BudgetResponse>(`/budgets/${period}`),
  createBudget: (data: CreateBudgetInput) => api.post<BudgetResponse>('/budgets', data),
  updateBudget: (id: string, data: UpdateBudgetInput) => api.put<BudgetResponse>(`/budgets/${id}`, data),
};
