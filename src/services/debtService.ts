import api from "./api";

export interface Debt {
  id: string;
  name: string;
  currency: "CRC" | "USD";
  balance: number;
  interest_rate: number;
  total_installment: number;
  insurance_cost: number;
  other_fees: number;
  remaining_terms: number;
  operation_number?: string;
  sync_budget?: boolean;
  planned_extra_payment?: number;
  category_id?: string;
  createdAt?: string;
}

export interface AmortizationPeriod {
  term: number;
  principal_paid: number;
  interest_paid: number;
  insurance_cost: number;
  other_fees: number;
  total_payment: number;
  remaining_balance: number;
}

export interface OptimizedAmortizationPeriod extends AmortizationPeriod {
  extra_payment: number;
}

export interface SimulationResult {
  original_schedule: AmortizationPeriod[];
  optimized_schedule: OptimizedAmortizationPeriod[];
  summary: {
    original_total_interest: number;
    optimized_total_interest: number;
    interest_savings: number;
    original_term: number;
    optimized_term: number;
    months_saved: number;
    original_total_cost: number;
    optimized_total_cost: number;
    total_savings: number;
  };
}

export interface GetDebtsResponse {
  message: string;
  debts: Debt[];
}

export interface GetDebtDetailsResponse {
  message: string;
  debt: Debt;
  schedule: AmortizationPeriod[];
}

export interface ExtractDebtResponse {
  message: string;
  data: {
    name: string | null;
    currency: "CRC" | "USD";
    balance: number | null;
    interest_rate: number | null;
    total_installment: number | null;
    insurance_cost: number;
    other_fees: number;
    remaining_terms: number | null;
    operation_number: string | null;
  };
  temp_file_id: string;
}

export interface ValidateDebtPayload {
  name: string;
  currency: "CRC" | "USD";
  balance: number;
  interest_rate: number;
  total_installment: number;
  insurance_cost?: number;
  other_fees?: number;
  remaining_terms: number;
  operation_number?: string;
  temp_file_id?: string;
}

export interface ValidateDebtResponse {
  message: string;
  debt: Debt;
}

export interface SimulateResponse {
  message: string;
  simulation: SimulationResult;
}

const debtService = {
  // Get all debts for the current user
  getDebts: () => api.get<GetDebtsResponse>("/debts"),

  // Get details and base amortization schedule for a single debt
  getDebtById: (id: string) => api.get<GetDebtDetailsResponse>(`/debts/${id}`),

  // Extract debt data from a PDF statement
  extractDebt: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ExtractDebtResponse, FormData>("/debts/extract", formData);
  },

  // Save/validate debt extracted or manually entered
  validateDebt: (payload: ValidateDebtPayload) =>
    api.post<ValidateDebtResponse, ValidateDebtPayload>("/debts/validate", payload),

  // Simulate extraordinary payments impact
  simulateSavings: (
    id: string,
    extraPaymentAmount: number,
    extraPaymentType: "one_time" | "monthly"
  ) =>
    api.post<SimulateResponse, { extra_payment_amount: number; extra_payment_type: "one_time" | "monthly" }>(
      `/debts/${id}/simulate`,
      {
        extra_payment_amount: extraPaymentAmount,
        extra_payment_type: extraPaymentType,
      }
    ),

  // Delete an existing debt record
  deleteDebt: (id: string) => api.delete<{ message: string }>(`/debts/${id}`),

  // Synchronize debt cuota and extra payments with current budget
  syncBudget: (id: string, syncBudget: boolean, plannedExtraPayment: number) =>
    api.post<{ message: string; debt: Debt; budget_allocated: number; warning?: string | null }, { sync_budget: boolean; planned_extra_payment: number }>(
      `/debts/${id}/sync-budget`,
      {
        sync_budget: syncBudget,
        planned_extra_payment: plannedExtraPayment
      }
    ),
};

export default debtService;
