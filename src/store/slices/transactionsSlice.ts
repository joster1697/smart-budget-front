import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import transactionService, {
  TransactionFilters,
} from "../../services/transactionService";

export interface Transaction {
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

interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
}

const initialState: TransactionsState = {
  transactions: [],
  loading: false,
};

export const fetchTransactions = createAsyncThunk(
  "/transactions/fetchTransactions",
  async (filters: TransactionFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(
        (t) => t.id !== action.payload,
      );
    },
    upsertTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      } else {
        state.transactions.unshift(action.payload);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload.transactions;
        state.loading = false;
      })
      .addCase(fetchTransactions.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setTransactions,
  addTransaction,
  removeTransaction,
  upsertTransaction,
  setLoading,
} = transactionsSlice.actions;
export default transactionsSlice.reducer;
