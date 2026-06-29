export interface SavingsGoal {
  id: string;
  user_id: string;
  account_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  account?: {
    id: string;
    name: string;
    balance: number | string;
    reserved_balance: number | string;
  };
}

export interface SavingsSchedule {
  id: string;
  savings_goal_id: string;
  source_account_id: string;
  amount: number;
  frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  day_of_week?: number;
  day_of_month?: number;
  next_run_date: string;
  status: "ACTIVE" | "PAUSED";
  createdAt?: string;
  updatedAt?: string;
  goal?: {
    id: string;
    name: string;
  };
  sourceAccount?: {
    id: string;
    name: string;
    balance: number | string;
  };
}

export interface SavingsProjectionPoint {
  date: string;
  projected_amount: number;
}

export interface SavingsProjection {
  goal_name: string;
  target_amount: number;
  current_amount: number;
  monthly_saving_rate: number;
  estimated_completion_date: string | null;
  projection_points: SavingsProjectionPoint[];
}

export interface CreateSavingsGoalPayload {
  name: string;
  target_amount: number;
  target_date?: string;
  account_id?: string;
  category?: string;
}

export interface CreateSavingsSchedulePayload {
  savings_goal_id: string;
  source_account_id: string;
  amount: number;
  frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  day_of_week?: number;
  day_of_month?: number;
}
