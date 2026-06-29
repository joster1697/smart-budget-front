import api from "./api";
import {
  SavingsGoal,
  SavingsSchedule,
  SavingsProjection,
  CreateSavingsGoalPayload,
  CreateSavingsSchedulePayload,
} from "../types/savings";

export interface GetGoalsResponse {
  message: string;
  goals: SavingsGoal[];
}

export interface GetGoalResponse {
  message: string;
  goal: SavingsGoal;
}

export interface GetProjectionsResponse {
  message: string;
  projections: SavingsProjection;
}

export interface GetSchedulesResponse {
  message: string;
  schedules: SavingsSchedule[];
}

const savingsService = {
  // Obtener metas
  getGoals: () => api.get<GetGoalsResponse>("/savings/goals"),

  // Obtener meta por ID
  getGoalById: (id: string) => api.get<GetGoalResponse>(`/savings/goals/${id}`),

  // Crear meta
  createGoal: (data: CreateSavingsGoalPayload) =>
    api.post<GetGoalResponse, CreateSavingsGoalPayload>("/savings/goals", data),

  // Actualizar meta
  updateGoal: (id: string, data: Partial<CreateSavingsGoalPayload & { status: string }>) =>
    api.put<GetGoalResponse, Partial<CreateSavingsGoalPayload & { status: string }>>(`/savings/goals/${id}`, data),

  // Eliminar meta
  deleteGoal: (id: string) => api.delete<{ message: string }>(`/savings/goals/${id}`),

  // Aportar dinero manualmente
  contribute: (id: string, amount: number, accountId?: string) =>
    api.post<GetGoalResponse, { amount: number; account_id?: string }>(
      `/savings/goals/${id}/contribute`,
      { amount, account_id: accountId }
    ),

  // Retirar dinero
  withdraw: (id: string, amount: number, accountId?: string) =>
    api.post<GetGoalResponse, { amount: number; account_id?: string }>(
      `/savings/goals/${id}/withdraw`,
      { amount, account_id: accountId }
    ),

  // Obtener proyecciones
  getProjections: (id: string) => api.get<GetProjectionsResponse>(`/savings/goals/${id}/projections`),

  // Sincronizar cuota de ahorro con el presupuesto
  syncBudget: (id: string, period: string, amount: number, categoryId?: string) =>
    api.post<{ message: string }, { period: string; amount: number; category_id?: string }>(
      `/savings/goals/${id}/sync-budget`,
      { period, amount, category_id: categoryId }
    ),

  // Obtener programaciones automáticas
  getSchedules: () => api.get<GetSchedulesResponse>("/savings/schedules"),

  // Crear programación
  createSchedule: (data: CreateSavingsSchedulePayload) =>
    api.post<{ message: string; schedule: SavingsSchedule }, CreateSavingsSchedulePayload>(
      "/savings/schedules",
      data
    ),

  // Eliminar programación
  deleteSchedule: (id: string) => api.delete<{ message: string }>(`/savings/schedules/${id}`),
};

export default savingsService;
