import api from "./api";

export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "cash";
  balance: number;
  available_balance?: number;
  reserved_balance?: number;
  account_linked?: string;
}

export interface GetAccountsResponse {
  message: string;
  accounts: Account[];
}

const accountService = {
  //Get all accounts for the connected user
  getAccounts: () => api.get<GetAccountsResponse>("/accounts"),

  //Create a new account for the connected user
  createAccount: (data: Omit<Account, "id">) =>
    api.post<Account>("/accounts", data),

  //Update an existing account
  updateAccount: (id: string, data: Partial<Omit<Account, "id">>) =>
    api.put<Account>(`/accounts/${id}`, data),

  linkAccount: (accountId: string, linkedAccountId: string) =>
    api.post<Account>(`/accounts/${accountId}/link`, {
      account_linked: linkedAccountId,
    }),

  unlinkAccount: (id: string) =>
    api.post<Account>(`/accounts/${id}/unlink`, {}),
};

export default accountService;
