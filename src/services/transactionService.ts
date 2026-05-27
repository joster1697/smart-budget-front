import api from "./api";

export interface TransactionResponse {
  id: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  description: string;
  date: string;
  category?: {
    id: string;
    name: string;
  };
  account?: {
    id: string;
    name: string;
  };
}

export interface GetTransactionResponse {
  message: string;
  transactions: TransactionResponse[];
}

export interface TransactionFilters {
  limit?: number;
  account_id?: string;
  category_id?: string;
  type?: string;
  from?: string;
  to?: string;
}

const transactionService = {
  getTransactions: (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          params.append(key, String(val));
        }
      });
    }
    const queryString = params.toString();
    return api.get<GetTransactionResponse>(
      `/transactions${queryString ? `?${queryString}` : ""}`,
    );
  },
};

export default transactionService;
