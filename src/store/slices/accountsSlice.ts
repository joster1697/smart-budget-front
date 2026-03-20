import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment";
  balance: number;
  currency: string;
}

interface AccountsState {
  accounts: Account[];
  loading: boolean;
}

const initialState: AccountsState = {
  accounts: [],
  loading: false,
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.accounts = action.payload;
    },
    addAccount: (state, action: PayloadAction<Account>) => {
      state.accounts.push(action.payload);
    },
    updateAccount: (state, action: PayloadAction<Account>) => {
      const index = state.accounts.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) state.accounts[index] = action.payload;
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter((a) => a.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAccounts, addAccount, updateAccount, removeAccount, setLoading } =
  accountsSlice.actions;
export default accountsSlice.reducer;
