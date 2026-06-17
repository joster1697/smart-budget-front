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

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (
    data: {
      amount: number;
      type: "income" | "expense" | "transfer";
      description: string;
      date: string;
      category_id?: string;
      account_id?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await transactionService.createTransaction(data);
      return (response as any).transaction || response;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (id: string, { rejectWithValue }) => {
    try {
      await transactionService.deleteTransaction(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateTransaction = createAsyncThunk(
  "transactions/updateTransaction",
  async (payload: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await transactionService.updateTransaction(
        payload.id,
        payload.data,
      );
      return (response as any).transaction || response;
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
      })
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createTransaction.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.payload,
        );
        state.loading = false;
      })
      .addCase(deleteTransaction.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t,
        );
        state.loading = false;
      })
      .addCase(updateTransaction.rejected, (state) => {
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
