import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import accountService, { Account } from "../../services/accountService";

interface AccountsState {
  accounts: Account[];
  loading: boolean;
  error?: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  loading: false,
  error: null,
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

  extraReducers: (builder) => {
    builder
      //Fetch Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.accounts = action.payload.accounts;
        state.loading = false;
      })
      //Create Accounts
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error while fetching accounts";
      })
      .addCase(createNewAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
        state.loading = false;
      })
      .addCase(createNewAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error while creating account";
      })
      //Update Accounts
      .addCase(updateCreatedAccount.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.accounts.findIndex(
          (acc) => acc.id === action.payload.id,
        );
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })
      .addCase(updateCreatedAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error while updating account";
      });
  },
});

export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.getAccounts();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const createNewAccount = createAsyncThunk(
  "accounts/createNewAccount",
  async (data: Omit<Account, "id">, { rejectWithValue }) => {
    try {
      const response = await accountService.createAccount(data);
      return (response as any).account as Account;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateCreatedAccount = createAsyncThunk(
  "accounts/updateAccount",
  async (account: Account, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = account;
      if (updateData.account_linked === null) {
        delete updateData.account_linked;
      }
      const response = await accountService.updateAccount(id, updateData);
      return (response as any).account as Account;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const {
  setAccounts,
  addAccount,
  updateAccount,
  removeAccount,
  setLoading,
} = accountsSlice.actions;
export default accountsSlice.reducer;
