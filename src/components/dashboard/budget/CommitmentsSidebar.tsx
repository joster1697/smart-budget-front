import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  IconCreditCard, 
  IconPigMoney, 
  IconPlus, 
  IconInfoCircle,
  IconX
} from "@tabler/icons-react";
import { BudgetContext } from "./BudgetContext";
import debtService, { Debt } from "../../../services/debtService";
import savingsService from "../../../services/savingsService";

interface CommitmentsSidebarProps {
  onClose: () => void;
}

export default function CommitmentsSidebar({ onClose }: CommitmentsSidebarProps) {
  const context = use(BudgetContext);
  if (!context) return null;

  const navigate = useNavigate();

  const { state, actions } = context;
  const { 
    debts, 
    savingsGoals, 
    categories, 
    budgetCategories, 
    periodStr, 
    remainingToAllocate 
  } = state;

  const { 
    fetchDebts, 
    fetchSavings, 
    fetchCategories,
    fetchBudget,
    formatCurrency 
  } = actions;

  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Helper to check if a debt is synced
  const isDebtSynced = (debt: Debt) => {
    if (!debt.category_id) {
      const debtCat = categories.find(c => c.name.toLowerCase() === debt.name.toLowerCase());
      return debtCat ? budgetCategories.some(bc => bc.category_id === debtCat.id) : false;
    }
    return budgetCategories.some(bc => bc.category_id === debt.category_id);
  };

  // Helper to check if a savings goal is synced
  const isSavingSynced = (goal: any) => {
    const goalCat = categories.find(c => c.name.toLowerCase() === `ahorro: ${goal.name}`.toLowerCase());
    return goalCat ? budgetCategories.some(bc => bc.category_id === goalCat.id) : false;
  };

  // Helper to get allocated amount for a debt
  const getDebtAllocation = (debt: Debt) => {
    const debtCat = debt.category_id
      ? categories.find(c => c.id === debt.category_id)
      : categories.find(c => c.name.toLowerCase() === debt.name.toLowerCase());
    if (!debtCat) return 0;
    const budgetCat = budgetCategories.find(bc => bc.category_id === debtCat.id);
    return budgetCat ? budgetCat.allocated_amount : 0;
  };

  // Helper to get allocated amount for a savings goal
  const getSavingAllocation = (goal: any) => {
    const goalCat = categories.find(c => c.name.toLowerCase() === `ahorro: ${goal.name}`.toLowerCase());
    if (!goalCat) return 0;
    const budgetCat = budgetCategories.find(bc => bc.category_id === goalCat.id);
    return budgetCat ? budgetCat.allocated_amount : 0;
  };

  // Calculate dynamic suggested monthly savings quota
  const calculateSuggestedSavingsQuota = (goal: any) => {
    if (goal.current_amount >= goal.target_amount) return 0;
    if (!goal.target_date) return 10000; // default minimum suggested

    const targetDate = new Date(goal.target_date);
    const today = new Date();
    const yearDiff = targetDate.getFullYear() - today.getFullYear();
    const monthDiff = targetDate.getMonth() - today.getMonth();
    const remainingMonths = yearDiff * 12 + monthDiff;

    if (remainingMonths <= 0) {
      return goal.target_amount - goal.current_amount;
    }
    return Math.ceil((goal.target_amount - goal.current_amount) / remainingMonths);
  };

  // Toggle sync for a debt
  const handleToggleDebtSync = async (debt: Debt) => {
    setSyncingId(debt.id);
    const nextSyncState = !isDebtSynced(debt);

    try {
      await debtService.syncBudget(debt.id, nextSyncState, debt.planned_extra_payment || 0);
      // Reload everything to let changes cascade
      await fetchCategories();
      await fetchDebts();
      await fetchBudget();
    } catch (err) {
      console.error("Error syncing debt:", err);
    } finally {
      setSyncingId(null);
    }
  };

  // Toggle sync for a savings goal
  const handleToggleSavingSync = async (goal: any) => {
    setSyncingId(goal.id);
    const nextSyncState = !isSavingSynced(goal);
    const quota = calculateSuggestedSavingsQuota(goal);

    try {
      if (nextSyncState) {
        await savingsService.syncBudget(goal.id, periodStr, quota);
      } else {
        await savingsService.syncBudget(goal.id, periodStr, 0);
      }
      await fetchCategories();
      await fetchSavings();
      await fetchBudget();
    } catch (err) {
      console.error("Error syncing savings goal:", err);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-outline-variant/30 shadow-2xl z-[100] flex flex-col"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-on-surface font-manrope">
              Vincular Compromisos
            </h3>
            <p className="text-[11px] text-outline mt-0.5 font-bold uppercase tracking-wider">
              Deudas y Ahorros
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-surface-variant/40 text-outline hover:text-on-surface rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Dynamic Summary */}
          <div className="bg-[#005226]/5 border border-[#005226]/10 rounded-2xl p-4 flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#005226]/80">
              Disponible por Presupuestar
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${remainingToAllocate < 0 ? "text-error" : "text-[#005226]"}`}>
                {formatCurrency(remainingToAllocate)}
              </span>
            </div>
            <p className="text-[11px] text-outline leading-tight">
              Asigna este dinero a deudas o ahorros para proteger tu futuro.
            </p>
          </div>

          {/* Debts Section */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center select-none">
              <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <IconCreditCard size={18} className="text-[#005226]" />
                <span>Tus Deudas</span>
              </h4>
              <button 
                onClick={() => navigate("/dashboard/debts?guided=true&editing=true")}
                className="flex items-center gap-0.5 text-xs font-bold text-[#005226] bg-[#005226]/10 hover:bg-[#005226]/20 border-none rounded-full px-2.5 py-1 transition-colors cursor-pointer"
              >
                <IconPlus size={12} /> Nueva
              </button>
            </div>

            {debts.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                {debts.map(debt => {
                  const synced = isDebtSynced(debt);
                  const allocation = getDebtAllocation(debt);
                  return (
                    <div 
                      key={debt.id} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        synced 
                          ? "bg-emerald-50/25 border-emerald-500/20" 
                          : "bg-surface-container-lowest border-outline-variant/10"
                      }`}
                    >
                      <div className="flex flex-col text-left min-w-0 flex-1">
                        <span className="font-bold text-xs text-on-surface truncate" title={debt.name}>
                          {debt.name}
                        </span>
                        <span className="text-[10px] text-outline">
                          Cuota: {formatCurrency(debt.total_installment)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {synced && (
                          <span className="text-[10px] font-black text-[#008f43] bg-[#008f43]/10 px-2 py-0.5 rounded-full">
                            {formatCurrency(allocation)}
                          </span>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={synced} 
                            onChange={() => handleToggleDebtSync(debt)}
                            disabled={syncingId === debt.id}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008f43]"></div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container/10">
                <p className="text-[11px] text-outline px-4">No tienes deudas registradas en tu perfil.</p>
              </div>
            )}
          </div>

          {/* Savings Section */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center select-none">
              <h4 className="font-bold text-sm text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <IconPigMoney size={18} className="text-[#005226]" />
                <span>Metas de Ahorro</span>
              </h4>
              <button 
                onClick={() => navigate("/dashboard/savings?guided=true&editing=true")}
                className="flex items-center gap-0.5 text-xs font-bold text-[#005226] bg-[#005226]/10 hover:bg-[#005226]/20 border-none rounded-full px-2.5 py-1 transition-colors cursor-pointer"
              >
                <IconPlus size={12} /> Nueva
              </button>
            </div>

            {savingsGoals.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                {savingsGoals.map(goal => {
                  const synced = isSavingSynced(goal);
                  const quota = calculateSuggestedSavingsQuota(goal);
                  const allocation = getSavingAllocation(goal);
                  return (
                    <div 
                      key={goal.id} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        synced 
                          ? "bg-emerald-50/25 border-emerald-500/20" 
                          : "bg-surface-container-lowest border-outline-variant/10"
                      }`}
                    >
                      <div className="flex flex-col text-left min-w-0 flex-1">
                        <span className="font-bold text-xs text-on-surface truncate" title={goal.name}>
                          {goal.name}
                        </span>
                        <span className="text-[10px] text-outline">
                          Sugerido: {formatCurrency(quota)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {synced && (
                          <span className="text-[10px] font-black text-[#008f43] bg-[#008f43]/10 px-2 py-0.5 rounded-full">
                            {formatCurrency(allocation)}
                          </span>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={synced} 
                            onChange={() => handleToggleSavingSync(goal)}
                            disabled={syncingId === goal.id}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#008f43]"></div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container/10">
                <p className="text-[11px] text-outline px-4">No tienes objetivos de ahorro configurados.</p>
              </div>
            )}
          </div>

          {/* Floating Info */}
          <div className="flex items-start gap-2 text-left bg-surface-container/30 p-3.5 rounded-2xl border border-outline-variant/10 mt-auto">
            <IconInfoCircle size={16} className="text-outline shrink-0 mt-0.5" />
            <p className="text-[10px] leading-snug text-outline">
              Activar el switch de deudas o ahorros añade automáticamente su cuota al presupuesto para asegurar que reserves ese dinero primero.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
