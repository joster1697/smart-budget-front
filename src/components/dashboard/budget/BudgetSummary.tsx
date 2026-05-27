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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-on-surface font-manrope">Ingresos Proyectados</h3>
      </div>

      <div className="bg-surface-container-lowest rounded-[28px] p-6 shadow-sm border border-outline-variant/20 flex flex-col items-start justify-between gap-6">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 w-full">
          <div className="flex sm:items-center flex-col relative group">
            <span className="text-outline text-sm font-medium flex items-center gap-1">
              Total Esperado
              {isEditing && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 hover:bg-primary-container text-[#005226] rounded-full transition-all duration-200 cursor-pointer border-none bg-transparent"
                  title="Editar ingresos proyectados"
                >
                  <IconPencil size={14} />
                </button>
              )}
            </span>
            <span className="text-xl sm:text-2xl font-black text-on-surface whitespace-nowrap">
              {formatCurrency(plannedIncome)}
            </span>
          </div>
          <div className="flex sm:items-center flex-col">
            <span className="text-outline text-sm font-medium">Presupuestado</span>
            <span className="text-xl sm:text-2xl font-black text-on-surface whitespace-nowrap">
              {formatCurrency(totalAllocatedInForm)}
            </span>
          </div>
          <div className="flex sm:items-center flex-col">
            <span className="text-outline text-sm font-medium">Disponible</span>
            <span className={`text-xl sm:text-2xl font-black whitespace-nowrap ${remainingToAllocate < 0 ? 'text-error' : 'text-[#008f43]'}`}>
              {formatCurrency(remainingToAllocate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
