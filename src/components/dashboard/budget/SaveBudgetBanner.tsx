import { use } from "react";
import { motion } from "framer-motion";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { BudgetContext } from "./BudgetContext";
import Button from "../../ui/Button";

export default function SaveBudgetBanner() {
  const context = use(BudgetContext);
  if (!context) return null;

  const { state, actions } = context;
  const {
    isDraft,
    monthYearStr,
    remainingToAllocate,
    isPastMonth,
    capitalizedMonth,
    loading,
    hasUnsavedChanges,
    budgetCategories,
  } = state;
  const { handleSaveBudget, handleActivateBudget, formatCurrency } = actions;

  const isVisible = (!loading && (hasUnsavedChanges || isDraft) && budgetCategories.length > 0);
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-20 lg:top-6 right-4 md:right-6 lg:right-10 left-4 sm:left-auto z-40 bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/30 px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-6 transition-all duration-300"
    >
      <div className="flex flex-row md:flex-col justify-between items-center md:items-start gap-2 mr-0 md:mr-2">
        <span className="text-[10px] md:text-xs text-outline font-bold uppercase tracking-wider capitalize select-none">
          {isDraft ? `Borrador • ${monthYearStr}` : `Ajustes • ${monthYearStr}`}
        </span>
        <span className="text-xs md:text-sm font-bold text-on-surface">
          Por asignar: <span className={remainingToAllocate < 0 ? 'text-error' : 'text-[#008f43]'}>{formatCurrency(remainingToAllocate)}</span>
        </span>
      </div>

      {isDraft ? (
        <div className="flex items-center justify-between md:justify-start gap-4 md:gap-3 w-full md:w-auto">
          <button
            onClick={handleSaveBudget}
            disabled={loading || !hasUnsavedChanges}
            className="flex items-center justify-center gap-2 text-sm font-bold text-on-surface hover:text-primary transition-colors disabled:opacity-50 py-2 px-3 hover:bg-surface-container rounded-xl md:rounded-none md:p-0 cursor-pointer border-none bg-transparent"
          >
            <IconDeviceFloppy size={18} /> Guardar
          </button>
          <div className="hidden md:block w-[1px] h-6 bg-outline-variant/30"></div>
          {isPastMonth ? (
            <span className="text-xs text-outline italic px-2">No editable</span>
          ) : (
            <Button variant="primary" size="sm" onClick={handleActivateBudget} loading={loading}>
              Activar {capitalizedMonth}
            </Button>
          )}
        </div>
      ) : (
        <Button variant="primary" size="sm" onClick={handleSaveBudget} loading={loading}>
          Guardar en {capitalizedMonth}
        </Button>
      )}
    </motion.div>
  );
}
