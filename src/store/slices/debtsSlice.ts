import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  currency: string;
  dueDate: string;
}

interface DebtsState {
  debts: Debt[];
  loading: boolean;
}

const initialState: DebtsState = {
  debts: [],
  loading: false,
};

const debtsSlice = createSlice({
  name: "debts",
  initialState,
  reducers: {
    setDebts: (state, action: PayloadAction<Debt[]>) => {
      state.debts = action.payload;
    },
    addDebt: (state, action: PayloadAction<Debt>) => {
      state.debts.push(action.payload);
    },
    updateDebt: (state, action: PayloadAction<Debt>) => {
      const index = state.debts.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) state.debts[index] = action.payload;
    },
    removeDebt: (state, action: PayloadAction<string>) => {
      state.debts = state.debts.filter((d) => d.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setDebts, addDebt, updateDebt, removeDebt, setLoading } = debtsSlice.actions;
export default debtsSlice.reducer;
