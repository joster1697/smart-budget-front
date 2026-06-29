import { use, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IconSparkles, 
  IconArrowRight, 
  IconArrowLeft, 
  IconPlus,
  IconCheck,
  IconAlertTriangle,
  IconPigMoney,
  IconCreditCard,
  IconX
} from "@tabler/icons-react";
import { BudgetContext } from "./BudgetContext";
import debtService, { Debt } from "../../../services/debtService";
import savingsService from "../../../services/savingsService";
import InputField from "../../ui/InputField";
import Button from "../../ui/Button";

export default function BudgetWizardModal() {
  const context = use(BudgetContext);
  if (!context) return null;

  const navigate = useNavigate();

  const { state, actions } = context;
  const { 
    isWizardOpen, 
    plannedIncome, 
    budgetCategories, 
    debts, 
    savingsGoals, 
    categories, 
    periodStr,
    loading 
  } = state;

  const { 
    setIsWizardOpen, 
    setPlannedIncome, 
    handleCloneBudget, 
    handleSaveBudget,
    handleActivateBudget,
    fetchDebts,
    fetchSavings,
    fetchCategories,
    fetchBudget,
    handleCategoryAllocationChange,
    formatCurrency 
  } = actions;

  const [step, setStep] = useState(0);
  const [localIncome, setLocalIncome] = useState(plannedIncome || 0);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  // Sync state with local state when context loads
  useEffect(() => {
    if (plannedIncome) {
      setLocalIncome(plannedIncome);
    }
  }, [plannedIncome]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlStep = searchParams.get("step");
    if (urlStep) {
      setStep(parseInt(urlStep, 10));
    }
  }, [isWizardOpen]);

  if (!isWizardOpen) return null;

  // Calculate previous month string
  const getPreviousPeriodStr = () => {
    const parts = periodStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const prevMonthDate = new Date(year, month - 2, 1);
    return `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  };

  const prevPeriod = getPreviousPeriodStr();

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

  // Calculate dynamic suggested monthly savings quota
  const calculateSuggestedSavingsQuota = (goal: any) => {
    if (goal.current_amount >= goal.target_amount) return 0;
    if (!goal.target_date) return 10000;

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

  const handleToggleDebt = async (debt: Debt) => {
    setSyncingId(debt.id);
    const synced = isDebtSynced(debt);
    try {
      await debtService.syncBudget(debt.id, !synced, debt.planned_extra_payment || 0);
      await fetchCategories();
      await fetchDebts();
      await fetchBudget();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleSaving = async (goal: any) => {
    setSyncingId(goal.id);
    const synced = isSavingSynced(goal);
    const quota = calculateSuggestedSavingsQuota(goal);
    try {
      if (!synced) {
        await savingsService.syncBudget(goal.id, periodStr, quota);
      } else {
        await savingsService.syncBudget(goal.id, periodStr, 0);
      }
      await fetchCategories();
      await fetchSavings();
      await fetchBudget();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      // Save income to parent context
      setPlannedIncome(localIncome);
      // Wait for savings/debts fetch just in case
      await fetchDebts();
      await fetchSavings();
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleClone = async () => {
    await handleCloneBudget(prevPeriod);
  };

  const handleFinish = async () => {
    try {
      // Save budget changes
      await handleSaveBudget();
      // Activate the budget
      await handleActivateBudget();
      setIsWizardOpen(false);
    } catch (err) {
      console.error("Error activating budget:", err);
      alert("Error al activar el presupuesto");
    }
  };

  // Wizard conversational script for the AI agent
  const getAgentScript = () => {
    switch (step) {
      case 0:
        return {
          title: "Hola, soy tu Asistente Financiero",
          message: "Aún no tienes un presupuesto estructurado para este mes. El presupuesto es el núcleo de tu salud financiera. ¿Quieres que te ayude a planificarlo desde cero o prefieres clonar el del mes anterior para ahorrar tiempo?"
        };
      case 1:
        return {
          title: "Paso 1: ¿Cuáles son tus ingresos?",
          message: "¡Excelente! Comencemos por proyectar tu dinero disponible para este periodo. ¿Cuánto dinero estimas recibir o ingresar en total durante este mes?"
        };
      case 2:
        return {
          title: "Paso 2: Aseguremos tus deudas",
          message: "Para mantener un historial impecable y evitar intereses moratorios, es fundamental apartar el pago de deudas de inmediato. Selecciona las deudas que deseas incluir. Si tienes una nueva deuda o tarjeta, puedes registrarla aquí mismo."
        };
      case 3:
        return {
          title: "Paso 3: Fomentemos tu ahorro",
          message: "¡Págate a ti mismo primero! Reservar dinero para tus metas antes de gastar es el secreto del éxito financiero. He calculado las cuotas de ahorro necesarias para tus objetivos activos. Selecciónalas para asegurar tu futuro."
        };
      case 4:
        return {
          title: "Paso 4: Gastos cotidianos",
          message: "He asignado una propuesta inicial para tus categorías normales (Comida, Transporte, etc.) con el dinero que nos queda disponible. Siéntete libre de ajustar los límites a tu gusto."
        };
      case 5:
        return {
          title: "Paso 5: Resumen y Activación",
          message: "¡Excelente trabajo! Hemos distribuido tus ingresos de forma inteligente y segura. Revisa el resumen y activemos tu presupuesto para empezar a controlar tus gastos."
        };
      default:
        return { title: "", message: "" };
    }
  };

  const script = getAgentScript();

  // Compute live wizard balances
  const totalAllocated = budgetCategories.reduce((sum, bc) => sum + (bc.allocated_amount || 0), 0);
  const remaining = localIncome - totalAllocated;

  const debtCategories = budgetCategories.filter(bc => {
    const cat = categories.find(c => c.id === bc.category_id);
    if (!cat) return false;
    // Check if linked to a debt
    return (cat.id && debts.some(d => d.category_id === cat.id)) || debts.some(d => d.name.toLowerCase() === cat.name.toLowerCase());
  });
  const totalDebts = debtCategories.reduce((sum, bc) => sum + bc.allocated_amount, 0);

  const savingsCategories = budgetCategories.filter(bc => {
    const cat = categories.find(c => c.id === bc.category_id);
    if (!cat) return false;
    return cat.name.toLowerCase().startsWith("ahorro:");
  });
  const totalSavings = savingsCategories.reduce((sum, bc) => sum + bc.allocated_amount, 0);

  const totalOtherExpenses = totalAllocated - totalDebts - totalSavings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-outline-variant/20">
        
        {/* Left sidebar: AI Agent Avatar and Bubble */}
        <div className="md:w-2/5 bg-gradient-to-br from-[#003d1c] to-[#005226] p-8 text-white flex flex-col justify-between items-center select-none relative shrink-0">
          <button 
            onClick={() => setIsWizardOpen(false)} 
            className="absolute top-4 left-4 text-white/55 hover:text-white md:hidden bg-transparent border-none cursor-pointer"
          >
            <IconX size={24} />
          </button>
          
          <div className="flex flex-col items-center gap-6 mt-8 md:mt-12 w-full text-center">
            {/* Pulsing AI glowing ring */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse scale-125"></div>
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                <IconSparkles size={44} className="text-emerald-300 animate-spin-slow" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black tracking-wide">{script.title}</h3>
              <p className="text-xs text-emerald-100/80 uppercase font-black tracking-widest">
                Fynkro AI Agent
              </p>
            </div>

            {/* Agent conversational bubble */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4.5 border border-white/10 text-left text-xs sm:text-sm leading-relaxed text-emerald-50 shadow-inner">
              {script.message}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-emerald-200/70 font-black uppercase tracking-widest mt-6">
            <span>Presupuesto Inteligente</span>
          </div>
        </div>

        {/* Right side: Wizard Steps */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0 bg-surface-container-lowest">
          {/* Header Progress Bar */}
          <div className="p-6 pb-2 border-b border-outline-variant/15 flex justify-between items-center shrink-0">
            <span className="text-xs font-black text-outline uppercase tracking-wider">
              {step > 0 ? `Paso ${step} de 5` : "Configuración Inicial"}
            </span>
            <div className="h-1.5 w-32 bg-surface-container rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#008f43] transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step content area */}
          <div className="flex-1 p-6 overflow-y-auto min-h-0 flex flex-col justify-center items-stretch">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                {/* STEP 0: Welcome & Clone Choice */}
                {step === 0 && (
                  <div className="flex flex-col gap-4 items-center py-6">
                    <Button 
                      variant="primary" 
                      onClick={handleClone} 
                      className="w-full max-w-sm py-5 flex items-center justify-center gap-3 text-sm font-bold shadow-md"
                    >
                      <IconCheck size={18} />
                      <span>Copiar presupuesto de {prevPeriod}</span>
                    </Button>
                    <span className="text-xs text-outline font-semibold">o bien</span>
                    <Button 
                      variant="secondary" 
                      onClick={() => setStep(1)} 
                      className="w-full max-w-sm py-4 flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      <span>Crear Presupuesto Nuevo</span>
                      <IconArrowRight size={16} />
                    </Button>
                  </div>
                )}

                {/* STEP 1: Income Setup */}
                {step === 1 && (
                  <div className="max-w-md mx-auto w-full flex flex-col gap-4">
                    <InputField
                      label="Ingresos Mensuales Proyectados"
                      type="number"
                      value={localIncome || ""}
                      onChange={(e) => setLocalIncome(Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      className="py-5 font-bold text-lg"
                      required
                    />
                    <p className="text-[11px] text-outline text-left">
                      Introduce tu salario neto y cualquier otro ingreso fijo que esperes recibir.
                    </p>
                  </div>
                )}

                {/* STEP 2: Debt Sync / Creation */}
                {step === 2 && (
                  <div className="w-full flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-outline uppercase">Listado de Deudas</span>
                      <button 
                        onClick={() => navigate(`/dashboard/debts?guided=true&wizard=true&step=2`)}
                        className="flex items-center gap-1 text-xs font-bold text-[#005226] bg-[#005226]/10 hover:bg-[#005226]/20 border-none rounded-full px-3 py-1.5 transition-colors cursor-pointer"
                      >
                        <IconPlus size={14} /> Nueva Deuda
                      </button>
                    </div>

                    {debts.length > 0 ? (
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                        {debts.map(debt => {
                          const synced = isDebtSynced(debt);
                          return (
                            <div 
                              key={debt.id} 
                              onClick={() => handleToggleDebt(debt)}
                              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                synced 
                                  ? "bg-emerald-50/20 border-emerald-500/30 scale-[1.01]" 
                                  : "bg-surface-container-low border-outline-variant/10 hover:bg-surface-container"
                              }`}
                            >
                              <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                                <div className={`p-2 rounded-xl shrink-0 ${synced ? 'bg-[#008f43]/10' : 'bg-surface-container'}`}>
                                  <IconCreditCard size={20} className={synced ? 'text-[#008f43]' : 'text-outline'} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-sm text-on-surface truncate">{debt.name}</p>
                                  <p className="text-xs text-outline font-medium">
                                    Pago Mensual: {formatCurrency(debt.total_installment)}
                                  </p>
                                </div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={synced}
                                readOnly
                                disabled={syncingId === debt.id}
                                className="w-5 h-5 accent-[#008f43]"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container/10">
                        <p className="text-xs text-outline px-4 mb-2">No tienes deudas activas registradas.</p>
                        <p className="text-[10px] text-outline px-4">Si no tienes deudas, pulsa Siguiente para continuar.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Savings Goals Sync / Creation */}
                {step === 3 && (
                  <div className="w-full flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-outline uppercase">Tus Metas de Ahorro</span>
                      <button 
                        onClick={() => navigate(`/dashboard/savings?guided=true&wizard=true&step=3`)}
                        className="flex items-center gap-1 text-xs font-bold text-[#005226] bg-[#005226]/10 hover:bg-[#005226]/20 border-none rounded-full px-3 py-1.5 transition-colors cursor-pointer"
                      >
                        <IconPlus size={14} /> Nueva Meta
                      </button>
                    </div>

                    {savingsGoals.length > 0 ? (
                      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                        {savingsGoals.map(goal => {
                          const synced = isSavingSynced(goal);
                          const quota = calculateSuggestedSavingsQuota(goal);
                          return (
                            <div 
                              key={goal.id} 
                              onClick={() => handleToggleSaving(goal)}
                              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                synced 
                                  ? "bg-emerald-50/20 border-emerald-500/30 scale-[1.01]" 
                                  : "bg-surface-container-low border-outline-variant/10 hover:bg-surface-container"
                              }`}
                            >
                              <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                                <div className={`p-2 rounded-xl shrink-0 ${synced ? 'bg-[#008f43]/10' : 'bg-surface-container'}`}>
                                  <IconPigMoney size={20} className={synced ? 'text-[#008f43]' : 'text-outline'} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-sm text-on-surface truncate">{goal.name}</p>
                                  <p className="text-xs text-outline font-medium">
                                    Cuota Mensual Recomendada: {formatCurrency(quota)}
                                  </p>
                                </div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={synced}
                                readOnly
                                disabled={syncingId === goal.id}
                                className="w-5 h-5 accent-[#008f43]"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container/10">
                        <p className="text-xs text-outline px-4 mb-2">No tienes objetivos de ahorro configurados.</p>
                        <p className="text-[10px] text-outline px-4">Si no tienes metas, pulsa Siguiente para continuar.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: Variable Expenses Allocations */}
                {step === 4 && (
                  <div className="w-full flex flex-col gap-4">
                    <div className="flex justify-between items-center text-xs font-bold text-outline select-none">
                      <span>Distribución de Categorías</span>
                      <span className={`px-2.5 py-0.5 rounded-full ${remaining < 0 ? "bg-error/10 text-error" : "bg-[#008f43]/10 text-[#008f43]"}`}>
                        Disponible: {formatCurrency(remaining)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {budgetCategories
                        .filter(bc => {
                          const cat = categories.find(c => c.id === bc.category_id);
                          if (!cat) return false;
                          // Filter out debts and savings to only edit variable items here
                          const isDebt = (cat.id && debts.some(d => d.category_id === cat.id)) || debts.some(d => d.name.toLowerCase() === cat.name.toLowerCase());
                          const isSaving = cat.name.toLowerCase().startsWith("ahorro:");
                          return !isDebt && !isSaving;
                        })
                        .map(bc => {
                          const cat = categories.find(c => c.id === bc.category_id);
                          return (
                            <div key={bc.category_id} className="flex flex-col gap-1 text-left p-3.5 bg-surface-container-low border border-outline-variant/10 rounded-2xl">
                              <div className="flex justify-between text-xs font-bold text-on-surface">
                                <span>{cat?.name || "Categoría"}</span>
                                <span>{formatCurrency(bc.allocated_amount)}</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max={localIncome > 0 ? localIncome : 1000}
                                step="1000"
                                value={bc.allocated_amount}
                                onChange={(e) => handleCategoryAllocationChange(bc.category_id, Number(e.target.value))}
                                className="budget-slider cursor-pointer"
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* STEP 5: Final Summary */}
                {step === 5 && (
                  <div className="w-full flex flex-col gap-4 text-left max-w-md mx-auto">
                    <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 flex flex-col gap-3">
                      <div className="flex justify-between text-sm select-none">
                        <span className="text-outline font-semibold">Total Ingresos:</span>
                        <span className="font-bold text-on-surface">{formatCurrency(localIncome)}</span>
                      </div>
                      <div className="h-px bg-outline-variant/20" />
                      
                      <div className="flex justify-between text-xs select-none">
                        <span className="text-outline font-semibold">Compromisos de Deuda:</span>
                        <span className="font-bold text-error">{formatCurrency(totalDebts)}</span>
                      </div>

                      <div className="flex justify-between text-xs select-none">
                        <span className="text-outline font-semibold">Metas de Ahorro:</span>
                        <span className="font-bold text-[#008f43]">{formatCurrency(totalSavings)}</span>
                      </div>

                      <div className="flex justify-between text-xs select-none">
                        <span className="text-outline font-semibold">Gastos Variables:</span>
                        <span className="font-bold text-on-surface">{formatCurrency(totalOtherExpenses)}</span>
                      </div>

                      <div className="h-px bg-outline-variant/20" />
                      
                      <div className="flex justify-between text-sm font-black select-none">
                        <span className="text-on-surface">Balance Restante:</span>
                        <span className={remaining < 0 ? "text-error" : "text-[#008f43]"}>
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>

                    {remaining < 0 && (
                      <div className="p-3.5 bg-error-container text-on-error-container text-xs font-semibold rounded-2xl flex items-start gap-2 select-none border border-error/10">
                        <IconAlertTriangle size={18} className="shrink-0 mt-0.5 text-error" />
                        <p className="leading-snug">
                          Has sobrepresupuestado por {formatCurrency(Math.abs(remaining))}. Regresa al paso anterior para ajustar tus límites de gasto.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t border-outline-variant/15 flex justify-between shrink-0 bg-surface-container/10">
            {step > 0 ? (
              <Button 
                variant="secondary" 
                onClick={handlePrevStep}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-bold"
              >
                <IconArrowLeft size={16} />
                <span>Atrás</span>
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                onClick={() => setIsWizardOpen(false)}
                className="text-xs font-bold"
              >
                Omitir
              </Button>
            )}

            {step < 5 ? (
              step > 0 && (
                <Button 
                  variant="primary" 
                  onClick={handleNextStep}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs font-bold"
                >
                  <span>Siguiente</span>
                  <IconArrowRight size={16} />
                </Button>
              )
            ) : (
              <Button 
                variant="primary" 
                onClick={handleFinish}
                disabled={remaining < 0 || loading}
                className="flex items-center gap-1 text-xs font-bold"
              >
                <span>¡Activar Presupuesto!</span>
                <IconCheck size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
