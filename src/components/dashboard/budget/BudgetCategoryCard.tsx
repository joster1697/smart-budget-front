import { use } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconToolsKitchen2,
  IconCar,
  IconHome,
  IconDeviceTv,
  IconMedicalCross,
  IconChartPie,
  IconArrowUp,
  IconArrowDown,
  IconPigMoney,
  IconTrash,
  IconArrowBackUp,
  IconCreditCard,
} from "@tabler/icons-react";
import { BudgetContext } from "./BudgetContext";
import { Debt } from "../../../services/debtService";

export interface BudgetCategoryData {
  id: string;
  name: string;
  allocated_amount: number;
  original_allocated_amount: number;
  spent_amount: number;
  usage_percentage: number;
  is_exceeded: boolean;
  isMarkedForDeletion?: boolean;
  isUnbudgeted?: boolean;
}

interface BudgetCategoryCardProps {
  category: BudgetCategoryData;
}

const getCategoryIcon = (id: string, name: string, debts: Debt[] = []) => {
  const lowerName = name.toLowerCase();
  const iconSize = 20;

  // Check if it matches any debt
  const isDebt = (id && debts.some(d => d.category_id === id)) ||
                 debts.some(d => d.name.toLowerCase() === lowerName) || 
                 lowerName.includes("deuda") || 
                 lowerName.includes("préstamo") || 
                 lowerName.includes("prestamo") || 
                 lowerName.includes("crédito") || 
                 lowerName.includes("credito") || 
                 lowerName.includes("tarjeta");

  if (isDebt) return <IconCreditCard size={iconSize} className="text-[#e11d48]" />; // Rose-600
  if (lowerName.includes("ahorro")) return <IconPigMoney size={iconSize} className="text-[#008f43]" />;
  if (lowerName.includes("aliment") || lowerName.includes("comida")) return <IconToolsKitchen2 size={iconSize} className="text-[#005226]" />;
  if (lowerName.includes("transport") || lowerName.includes("auto")) return <IconCar size={iconSize} className="text-[#005226]" />;
  if (lowerName.includes("vivienda") || lowerName.includes("hogar")) return <IconHome size={iconSize} className="text-[#005226]" />;
  if (lowerName.includes("entretenimiento") || lowerName.includes("ocio")) return <IconDeviceTv size={iconSize} className="text-[#005226]" />;
  if (lowerName.includes("salud") || lowerName.includes("medic")) return <IconMedicalCross size={iconSize} className="text-[#005226]" />;
  return <IconChartPie size={iconSize} className="text-[#005226]" />;
};

export default function BudgetCategoryCard({ category }: BudgetCategoryCardProps) {
  const navigate = useNavigate();
  const context = use(BudgetContext);
  if (!context) return null;

  const { state, actions } = context;
  const { canEdit, isActive, plannedIncome, debts, savingsGoals } = state;
  const { handleCategoryAllocationChange, formatCurrency, handleRemoveCategory, handleRestoreCategory } = actions;

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCategoryAllocationChange(category.id, Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCategoryAllocationChange(category.id, Number(e.target.value));
  };

  const isSavingCategory = category.name.toLowerCase().includes("ahorro");
  const isDebtCategory = (category.id && debts.some(d => d.category_id === category.id)) ||
                         debts.some(d => d.name.toLowerCase() === category.name.toLowerCase()) || 
                         category.name.toLowerCase().includes("deuda") || 
                         category.name.toLowerCase().includes("préstamo") || 
                         category.name.toLowerCase().includes("prestamo") || 
                         category.name.toLowerCase().includes("crédito") || 
                         category.name.toLowerCase().includes("credito") || 
                         category.name.toLowerCase().includes("tarjeta");

  const matchedGoal = savingsGoals?.find(g => `ahorro: ${g.name}`.toLowerCase() === category.name.toLowerCase());
  const matchedDebt = debts?.find(d => (category.id && d.category_id === category.id) || d.name.toLowerCase() === category.name.toLowerCase());

  const handleCardClick = () => {
    if (isSavingCategory && matchedGoal) {
      navigate(`/dashboard/savings?id=${matchedGoal.id}&guided=true`);
    } else if (isDebtCategory && matchedDebt) {
      navigate(`/dashboard/debts?id=${matchedDebt.id}&guided=true`);
    }
  };

  return (
    <div className={`flex flex-col justify-between rounded-2xl rounded-tl-sm p-3 sm:p-4.5 shadow-sm border transition-all duration-300 
      ${category.isMarkedForDeletion
        ? "bg-error-container/5 border-error/20 shadow-sm border-l-4 border-l-error/40 opacity-70"
        : isSavingCategory 
          ? "bg-emerald-50/50 border-emerald-500/20 shadow-sm border-l-4 border-l-emerald-500" 
          : isDebtCategory
            ? "bg-rose-50/50 border-rose-500/20 shadow-sm border-l-4 border-l-rose-500"
            : "bg-surface-container-lowest border-outline-variant/20"
      } 
      ${canEdit && !category.isMarkedForDeletion ? "border-[#005226]/30 bg-surface-container-low/20 shadow-md scale-[1.01]" : ""}`}>
      <div className="flex flex-col mb-1.5 sm:mb-3">
        <div className="flex flex-row justify-between items-center gap-2 w-full">
          <div 
            onClick={handleCardClick}
            className={`flex items-center gap-2 sm:gap-3 min-w-0 flex-1 ${
              (isSavingCategory && matchedGoal) || (isDebtCategory && matchedDebt) 
                ? "cursor-pointer hover:opacity-80 transition-opacity" 
                : ""
            }`}
          >
            <div className="bg-primary-container/30 p-1.5 sm:p-2 rounded-xl shrink-0">
              {getCategoryIcon(category.id, category.name, debts)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className={`font-bold text-sm sm:text-lg text-on-surface line-clamp-2 break-words ${category.isMarkedForDeletion ? "line-through text-outline/80" : ""}`} title={category.name}>{category.name}</h4>
              {((isSavingCategory && matchedGoal) || (isDebtCategory && matchedDebt)) && (
                <span className="text-[9px] text-[#008f43] dark:text-[#38e07b] font-bold block hover:underline">
                  Ver Análisis →
                </span>
              )}
            </div>
          </div>

          {canEdit ? (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <span className="text-xs text-outline font-medium">₡</span>
              <input
                type="number"
                value={category.allocated_amount || ""}
                onChange={handleInputChange}
                disabled={category.isMarkedForDeletion}
                className={`w-20 sm:w-24 bg-surface-container border border-outline-variant/30 rounded-lg px-2 py-0.5 sm:py-1 text-right text-xs sm:text-sm text-on-surface font-bold focus:outline-none focus:ring-1 focus:ring-[#005226] ${
                  category.isMarkedForDeletion ? "opacity-50 pointer-events-none" : ""
                }`}
                placeholder="0"
              />
              {category.isMarkedForDeletion ? (
                <button
                  type="button"
                  onClick={() => handleRestoreCategory(category.id)}
                  className="p-1.5 text-outline hover:text-[#005226] hover:bg-[#005226]/10 rounded-lg transition-all duration-200 cursor-pointer border-none bg-transparent flex items-center justify-center shrink-0"
                  title="Restablecer categoría"
                >
                  <IconArrowBackUp size={18} />
                </button>
              ) : category.isUnbudgeted ? (
                <button
                  type="button"
                  disabled
                  className="p-1.5 text-outline/30 cursor-not-allowed border-none bg-transparent flex items-center justify-center shrink-0"
                  title="No se puede eliminar porque ya tiene transacciones registradas este mes"
                >
                  <IconTrash size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category.id)}
                  className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 cursor-pointer border-none bg-transparent flex items-center justify-center shrink-0"
                  title="Eliminar del presupuesto"
                >
                  <IconTrash size={18} />
                </button>
              )}
            </div>
          ) : (
            <div className="text-right shrink-0 whitespace-nowrap">
              <span className="text-[10px] sm:text-xs text-outline font-medium">Límite:</span>
              <span className="ml-1.5 font-bold text-xs sm:text-base text-on-surface">{formatCurrency(category.allocated_amount)}</span>
            </div>
          )}
        </div>

        {isActive && category.original_allocated_amount !== category.allocated_amount && (
          <div className={`w-fit text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full flex items-start gap-1 mt-1.5 ${category.allocated_amount > category.original_allocated_amount ? 'bg-error/10 text-error' : 'bg-[#008f43]/10 text-[#008f43]'}`}>
            <span className="shrink-0 mt-[2px]">
              {category.allocated_amount > category.original_allocated_amount ? <IconArrowUp size={10} /> : <IconArrowDown size={10} />}
            </span>
            <span className="leading-tight">
              {formatCurrency(Math.abs(category.allocated_amount - category.original_allocated_amount))} aj. (Orig: {formatCurrency(category.original_allocated_amount)})
            </span>
          </div>
        )}
      </div>

      {canEdit ? (
        <div className="mt-2 mb-1">
          <div className="flex justify-between text-[10px] sm:text-xs text-outline mb-0.5">
            <span>$0</span>
            <span>{formatCurrency(plannedIncome)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={plannedIncome > 0 ? plannedIncome : 1000}
            step="1000"
            value={category.allocated_amount}
            onChange={handleRangeChange}
            disabled={category.isMarkedForDeletion}
            className={`budget-slider cursor-pointer ${category.isMarkedForDeletion ? "opacity-50 pointer-events-none" : ""}`}
          />
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-1 text-[10px] sm:text-xs mb-1.5">
            <span className="text-outline font-medium">
              {formatCurrency(category.spent_amount)} de {formatCurrency(category.allocated_amount)}
            </span>
            <span className="font-bold text-on-surface">{Math.round(category.usage_percentage)}%</span>
          </div>
          <div className="h-1.5 sm:h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${category.is_exceeded ? 'bg-error' : 'bg-[#008f43]'}`}
              style={{ width: `${Math.min(category.usage_percentage, 100)}%` }}
            ></div>
          </div>
          {category.is_exceeded && (
            <p className="text-error text-[9px] sm:text-xs mt-1 font-medium">Límite excedido.</p>
          )}
        </div>
      )}
    </div>
  );
}
