import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SavingsGoal, SavingsSchedule } from "../../types/savings";

interface SavingsState {
  goals: SavingsGoal[];
  schedules: SavingsSchedule[];
  loading: boolean;
  error: string | null;
}

const initialState: SavingsState = {
  goals: [],
  schedules: [],
  loading: false,
  error: null,
};

const savingsSlice = createSlice({
  name: "savings",
  initialState,
  reducers: {
    setGoals: (state, action: PayloadAction<SavingsGoal[]>) => {
      state.goals = action.payload;
    },
    addGoal: (state, action: PayloadAction<SavingsGoal>) => {
      state.goals.unshift(action.payload);
    },
    updateGoalInState: (state, action: PayloadAction<SavingsGoal>) => {
      const index = state.goals.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    removeGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter((g) => g.id !== action.payload);
    },
    setSchedules: (state, action: PayloadAction<SavingsSchedule[]>) => {
      state.schedules = action.payload;
    },
    addSchedule: (state, action: PayloadAction<SavingsSchedule>) => {
      state.schedules.unshift(action.payload);
    },
    removeSchedule: (state, action: PayloadAction<string>) => {
      state.schedules = state.schedules.filter((s) => s.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setGoals,
  addGoal,
  updateGoalInState,
  removeGoal,
  setSchedules,
  addSchedule,
  removeSchedule,
  setLoading,
  setError,
} = savingsSlice.actions;

export default savingsSlice.reducer;
