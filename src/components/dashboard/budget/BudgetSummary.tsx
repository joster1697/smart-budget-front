import { use } from "react";
import { IconPencil } from "@tabler/icons-react";
import { BudgetContext } from "./BudgetContext";

export default function BudgetSummary() {
  const context = use(BudgetContext);
  if (!context) return null;

  const { state, actions } = context;
  const { plannedIncome, totalAllocatedInForm, remainingToAllocate, isEditing } = state;
  const { setIsModalOpen, formatCurrency } = actions;

  return (
    <div className="bg-surface-container-lowest rounded-2xl rounded-tl-sm p-4 sm:p-6 shadow-sm border border-outline-variant/20 flex flex-col items-start justify-between gap-6">
      <div className="flex flex-wrap gap-4 sm:gap-6 w-full">
        <div className="flex flex-col flex-1 min-w-[120px] relative group">
          <span className="text-outline text-[10px] sm:text-sm font-medium flex items-center gap-1">
            Total
            {isEditing && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-0.5 hover:bg-primary-container text-[#005226] rounded-full transition-all duration-200 cursor-pointer border-none bg-transparent"
                title="Editar ingresos proyectados"
              >
                <IconPencil size={12} />
              </button>
            )}
          </span>
          <span className="text-sm sm:text-xl md:text-2xl font-black text-on-surface whitespace-nowrap">
            {formatCurrency(plannedIncome)}
          </span>
        </div>
        <div className="flex flex-col flex-1 min-w-[120px]">
          <span className="text-outline text-[10px] sm:text-sm font-medium">Asignado</span>
          <span className="text-sm sm:text-xl md:text-2xl font-black text-on-surface whitespace-nowrap">
            {formatCurrency(totalAllocatedInForm)}
          </span>
        </div>
        <div className="flex flex-col flex-1 min-w-[120px]">
          <span className="text-outline text-[10px] sm:text-sm font-medium">Disponible</span>
          <span className={`text-sm sm:text-xl md:text-2xl font-black whitespace-nowrap ${remainingToAllocate < 0 ? 'text-error' : 'text-[#008f43]'}`}>
            {formatCurrency(remainingToAllocate)}
          </span>
        </div>
      </div>
    </div>
  );
}
