import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  currency: string;
  period: "monthly" | "weekly" | "yearly";
}

interface BudgetsState {
  budgets: Budget[];
  loading: boolean;
}

const initialState: BudgetsState = {
  budgets: [],
  loading: false,
};

const budgetsSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
    },
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) state.budgets[index] = action.payload;
    },
    removeBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter((b) => b.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setBudgets, addBudget, updateBudget, removeBudget, setLoading } =
  budgetsSlice.actions;
export default budgetsSlice.reducer;
