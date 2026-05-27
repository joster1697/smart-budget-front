import { createContext } from "react";
import { BudgetStatus, BudgetCategoryInput } from "../../../services/budgetService";
import { Category } from "../../../services/categoryService";
import { BudgetCategoryData } from "./BudgetCategoryCard";

export interface BudgetContextState {
  currentDate: Date;
  budget: BudgetStatus | null;
  categories: Category[];
  loading: boolean;
  error: string | null;
  isModalOpen: boolean;
  isCategoryModalOpen: boolean;
  plannedIncome: number;
  budgetCategories: BudgetCategoryInput[];
  hasUnsavedChanges: boolean;
  isEditing: boolean;
  newCategoryName: string;

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
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCategoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  prevMonth: () => void;
  nextMonth: () => void;
  handleSaveBudget: () => Promise<void>;
  handleActivateBudget: () => Promise<void>;
  handleCreateCategory: () => Promise<void>;
  handleToggleEditing: () => void;
  handleCategoryAllocationChange: (categoryId: string, amount: number) => void;
  formatCurrency: (amount: number) => string;
}

export interface BudgetContextValue {
  state: BudgetContextState;
  actions: BudgetContextActions;
}

export const BudgetContext = createContext<BudgetContextValue | null>(null);
