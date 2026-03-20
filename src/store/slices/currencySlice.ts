import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CurrencyState {
  baseCurrency: string;
  exchangeRates: Record<string, number>;
}

const initialState: CurrencyState = {
  baseCurrency: "USD",
  exchangeRates: {},
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setBaseCurrency: (state, action: PayloadAction<string>) => {
      state.baseCurrency = action.payload;
    },
    setExchangeRates: (state, action: PayloadAction<Record<string, number>>) => {
      state.exchangeRates = action.payload;
    },
  },
});

export const { setBaseCurrency, setExchangeRates } = currencySlice.actions;
export default currencySlice.reducer;
