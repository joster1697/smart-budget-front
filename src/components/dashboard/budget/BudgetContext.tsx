import { createContext } from "react";
import { BudgetStatus, BudgetCategoryInput } from "../../../services/budgetService";
import { Category } from "../../../services/categoryService";
import { BudgetCategoryData } from "./BudgetCategoryCard";
import { Debt } from "../../../services/debtService";
import { SavingsGoal } from "../../../types/savings";

export interface BudgetContextState {
  currentDate: Date;
  budget: BudgetStatus | null;
  categories: Category[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  loading: boolean;
  loadingDebts: boolean;
  loadingSavings: boolean;
  error: string | null;
  isModalOpen: boolean;
  isCategoryModalOpen: boolean;
  isWizardOpen: boolean;
  plannedIncome: number;
  budgetCategories: BudgetCategoryInput[];
  hasUnsavedChanges: boolean;
  isEditing: boolean;
  newCategoryName: string;
  selectedExistingCategoryId: string;

  // Inferred/computed properties
  monthYearStr: string;
  periodStr: string;
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  capitalizedMonth: string;
  totalAllocatedInForm: number;
  remainingToAllocate: number;
  isDraft: boolean;
  isActive: boolean;
  canEdit: boolean;
  displayCategories: BudgetCategoryData[];
}

export interface BudgetContextActions {
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  setPlannedIncome: React.Dispatch<React.SetStateAction<number>>;
  setNewCategoryName: React.Dispatch<React.SetStateAction<string>>;
  setSelectedExistingCategoryId: React.Dispatch<React.SetStateAction<string>>;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCategoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsWizardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  prevMonth: () => void;
  nextMonth: () => void;
  fetchDebts: () => Promise<void>;
  fetchSavings: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBudget: () => Promise<void>;
  handleCloneBudget: (prevPeriod: string) => Promise<void>;
  handleSaveBudget: () => Promise<void>;
  handleActivateBudget: () => Promise<void>;
  handleCreateCategory: () => Promise<void>;
  handleAddExistingCategory: () => void;
  handleRemoveCategory: (categoryId: string) => void;
  handleRestoreCategory: (categoryId: string) => void;
  handleToggleEditing: () => void;
  handleCategoryAllocationChange: (categoryId: string, amount: number) => void;
  formatCurrency: (amount: number) => string;
}

export interface BudgetContextValue {
  state: BudgetContextState;
  actions: BudgetContextActions;
}

export const BudgetContext = createContext<BudgetContextValue | null>(null);
