import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconLock,
  IconLockOpen,
  IconPigMoney,
} from "@tabler/icons-react";
import AIChatBubble from "../../components/dashboard/AIChatBubble";
import { budgetService, BudgetStatus, BudgetCategoryInput } from "../../services/budgetService";
import { categoryService, Category } from "../../services/categoryService";
import BudgetSummary from "../../components/dashboard/budget/BudgetSummary";
import BudgetCategoryCard, { BudgetCategoryData } from "../../components/dashboard/budget/BudgetCategoryCard";
import BudgetFormModal from "../../components/dashboard/budget/BudgetFormModal";
import CategoryFormModal from "../../components/dashboard/budget/CategoryFormModal";
import SaveBudgetBanner from "../../components/dashboard/budget/SaveBudgetBanner";
import Button from "../../components/ui/Button";
import { BudgetContext } from "../../components/dashboard/budget/BudgetContext";
import debtService, { Debt } from "../../services/debtService";
import savingsService from "../../services/savingsService";
import { SavingsGoal } from "../../types/savings";
import CommitmentsSidebar from "../../components/dashboard/budget/CommitmentsSidebar";
import BudgetWizardModal from "../../components/dashboard/budget/BudgetWizardModal";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CRC' }).format(amount);
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12,
    },
  },
} as const;

export default function Budget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCommitmentsOpen, setIsCommitmentsOpen] = useState(false);

  // Form states
  const [plannedIncome, setPlannedIncome] = useState<number>(0);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategoryInput[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Category creation state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedExistingCategoryId, setSelectedExistingCategoryId] = useState("");

  // Debts and Savings states
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(false);
  const [loadingSavings, setLoadingSavings] = useState(false);


  const monthYearStr = currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const periodStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const today = new Date();
  const isCurrentMonth = currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() === today.getMonth();
  const isPastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) <= new Date(today.getFullYear(), today.getMonth(), 1);

  const rawMonthName = currentDate.toLocaleDateString("es-ES", { month: "long" }).split(" ")[0];
  const capitalizedMonth = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

  const fetchBudget = async () => {
    setLoading(true);
    setError(null);
    setBudget(null);
    setPlannedIncome(0);
    setBudgetCategories([]);
    setHasUnsavedChanges(false);

    try {
      const response = await budgetService.getBudget(periodStr);
      if (response && response.budget) {
        const data = response.budget;
        setBudget(data);
        setPlannedIncome(data.planned_income);
        setBudgetCategories(data.categories
          .filter(c => !c.id?.startsWith("unbudgeted-"))
          .map(c => ({
            category_id: c.category_id || "",
            allocated_amount: c.allocated_amount
          }))
        );
        setIsWizardOpen(false);
      }
    } catch (err) {
      const error = err as Error & { statusCode?: number };
      if (error.statusCode === 404 || error.message?.toLowerCase().includes("not found")) {
        setBudget(null);
        if (!isPastMonth) {
          setIsWizardOpen(true);
        }
      } else {
        setError(error.message || "Error al cargar el presupuesto");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDebts = async () => {
    setLoadingDebts(true);
    try {
      const response = await debtService.getDebts();
      setDebts(Array.isArray(response.debts) ? response.debts : []);
    } catch (err) {
      console.error("Error fetching debts:", err);
      setDebts([]);
    } finally {
      setLoadingDebts(false);
    }
  };

  const fetchSavings = async () => {
    setLoadingSavings(true);
    try {
      const response = await savingsService.getGoals();
      setSavingsGoals(Array.isArray(response.goals) ? response.goals : []);
    } catch (err) {
      console.error("Error fetching savings goals:", err);
      setSavingsGoals([]);
    } finally {
      setLoadingSavings(false);
    }
  };

  const handleCloneBudget = async (prevPeriod: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await budgetService.getBudget(prevPeriod);
      if (response && response.budget) {
        const prevBudget = response.budget;
        setPlannedIncome(prevBudget.planned_income);
        setBudgetCategories(prevBudget.categories
          .filter(c => !c.id?.startsWith("unbudgeted-"))
          .map(c => ({
            category_id: c.category_id || "",
            allocated_amount: c.allocated_amount
          }))
        );
        setHasUnsavedChanges(true);
        setIsWizardOpen(false);
      } else {
        alert("No se encontró un presupuesto para el mes anterior.");
      }
    } catch (err) {
      const error = err as Error;
      alert(error.message || "Error al clonar el presupuesto anterior.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(Array.isArray(response.categories) ? response.categories : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchBudget();
    fetchCategories();
    fetchDebts();
    fetchSavings();
    setIsEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodStr]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("wizard") === "true") {
      setIsWizardOpen(true);
    }
    if (searchParams.get("editing") === "true") {
      setIsEditing(true);
    }
  }, []);



  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSaveBudget = async () => {
    try {
      setLoading(true);
      if (budget?.id) {
        await budgetService.updateBudget(budget.id, {
          planned_income: plannedIncome,
          categories: budgetCategories
        });
      } else {
        await budgetService.createBudget({
          period: periodStr,
          planned_income: plannedIncome,
          categories: budgetCategories
        });
      }
      setIsModalOpen(false);
      setHasUnsavedChanges(false);
      setIsEditing(false);
      await fetchBudget();
    } catch (err) {
      const error = err as Error;
      alert(error.message || "Error al guardar el presupuesto");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateBudget = async () => {
    if (!budget?.id) return;
    try {
      setLoading(true);
      if (hasUnsavedChanges) {
        await budgetService.updateBudget(budget.id, {
          planned_income: plannedIncome,
          categories: budgetCategories
        });
      }
      await budgetService.activateBudget(budget.id);
      setHasUnsavedChanges(false);
      setIsEditing(false);
      await fetchBudget();
    } catch (err) {
      const error = err as Error;
      alert(error.message || "Error al activar el presupuesto");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    try {
      const response = await categoryService.createCategory({
        name: newCategoryName,
      });
      const newCat = response.category;
      setCategories(prev => [...prev, newCat]);
      setBudgetCategories(prev => [...prev, { category_id: newCat.id, allocated_amount: 0 }]);
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
    } catch (err) {
      const error = err as Error;
      alert(error.message || "Error al crear la categoría");
    }
  };

  const handleAddExistingCategory = () => {
    if (!selectedExistingCategoryId) return;
    setHasUnsavedChanges(true);
    setBudgetCategories(prev => {
      const exists = prev.some(c => c.category_id === selectedExistingCategoryId);
      if (exists) return prev;
      return [...prev, { category_id: selectedExistingCategoryId, allocated_amount: 0 }];
    });
    setSelectedExistingCategoryId("");
    setIsCategoryModalOpen(false);
  };

  const handleRemoveCategory = (categoryId: string) => {
    setHasUnsavedChanges(true);
    setBudgetCategories(prev => prev.filter(c => c.category_id !== categoryId));
  };

  const handleRestoreCategory = (categoryId: string) => {
    setHasUnsavedChanges(true);
    const originalCat = budget?.categories.find(c => c.category_id === categoryId);
    setBudgetCategories(prev => {
      const exists = prev.some(c => c.category_id === categoryId);
      if (exists) return prev;
      return [...prev, {
        category_id: categoryId,
        allocated_amount: originalCat ? originalCat.allocated_amount : 0
      }];
    });
  };

  const totalAllocatedInForm = budgetCategories.reduce((sum, cat) => sum + (cat.allocated_amount || 0), 0);
  const remainingToAllocate = plannedIncome - totalAllocatedInForm;

  const isDraft = !budget || budget.status === 'DRAFT';
  const isActive = budget?.status === 'ACTIVE';
  const canEdit = isDraft || (isActive && isEditing);

  const handleToggleEditing = () => {
    if (isEditing) {
      if (hasUnsavedChanges) {
        const confirmDiscard = window.confirm("Tienes cambios sin guardar en tu presupuesto. ¿Deseas descartarlos y bloquear la edición?");
        if (!confirmDiscard) return;

        if (budget) {
          setPlannedIncome(budget.planned_income);
          setBudgetCategories(budget.categories.map(c => ({
            category_id: c.category_id || "",
            allocated_amount: c.allocated_amount
          })));
        }
        setHasUnsavedChanges(false);
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const isSaving = (name: string) => name.toLowerCase().includes("ahorro");

  const isDebt = (categoryId: string, name: string) => {
    if (categoryId && debts.some(d => d.category_id === categoryId)) return true;
    const lowerName = name.toLowerCase();
    return debts.some(d => d.name.toLowerCase() === lowerName) ||
      lowerName.includes("deuda") ||
      lowerName.includes("préstamo") ||
      lowerName.includes("prestamo") ||
      lowerName.includes("crédito") ||
      lowerName.includes("credito") ||
      lowerName.includes("tarjeta");
  };

  const displayCategoryIds = Array.from(new Set([
    ...budgetCategories.map(c => c.category_id),
    ...(budget?.categories || []).map(c => c.category_id || "")
  ])).filter(id => id);

  const displayCategories: BudgetCategoryData[] = displayCategoryIds.map(id => {
    const baseCat = categories.find(c => c.id === id);
    const budgetCat = budget?.categories.find(c => c.category_id === id);
    const localCat = budgetCategories.find(c => c.category_id === id);

    const isMarkedForDeletion = budgetCat !== undefined && !budgetCat.id?.startsWith("unbudgeted-") && localCat === undefined;
    const isUnbudgeted = !!(budgetCat?.id?.startsWith("unbudgeted-") && localCat === undefined);

    return {
      id: id,
      name: baseCat?.name || budgetCat?.category_name || "Desconocida",
      allocated_amount: localCat ? localCat.allocated_amount : (budgetCat?.allocated_amount || 0),
      original_allocated_amount: budgetCat?.original_allocated_amount ?? 0,
      spent_amount: budgetCat?.spent_amount || 0,
      usage_percentage: budgetCat?.usage_percentage || 0,
      is_exceeded: budgetCat?.is_exceeded || false,
      isMarkedForDeletion,
      isUnbudgeted
    };
  }).filter(c => !c.isUnbudgeted);

  const handleCategoryAllocationChange = (categoryId: string, amount: number) => {
    setHasUnsavedChanges(true);
    setBudgetCategories(prev => {
      const exists = prev.find(p => p.category_id === categoryId);
      if (exists) {
        return prev.map(p => p.category_id === categoryId ? { ...p, allocated_amount: amount } : p);
      } else {
        return [...prev, { category_id: categoryId, allocated_amount: amount }];
      }
    });
  };

  const getChatMessage = () => {
    if (!budget) {
      return `Hola, no he encontrado un presupuesto configurado para ${capitalizedMonth}. ¿Te gustaría crear uno nuevo para empezar?`;
    }

    if (budget.status === 'DRAFT') {
      if (remainingToAllocate > 0) {
        return `Hola, estás editando el borrador de ${capitalizedMonth}. Aún tienes ${formatCurrency(remainingToAllocate)} disponibles para asignar a tus categorías.`;
      } else if (remainingToAllocate < 0) {
        return `Hola, estás editando el borrador de ${capitalizedMonth}. Has sobreasignado ${formatCurrency(Math.abs(remainingToAllocate))}. Por favor, ajusta los límites.`;
      }
      return `Hola, el borrador de tu presupuesto de ${capitalizedMonth} está completamente asignado. ¡Ya puedes activarlo para este mes!`;
    }

    if (remainingToAllocate > 0) {
      return `Hola, aquí tienes el resumen de tu presupuesto activo de ${capitalizedMonth}. Aún tienes ${formatCurrency(remainingToAllocate)} disponibles para asignar.`;
    } else if (remainingToAllocate < 0) {
      return `Hola, tu presupuesto de ${capitalizedMonth} está activo, pero tienes una sobreasignación de ${formatCurrency(Math.abs(remainingToAllocate))}.`;
    }
    return `Hola, aquí tienes el resumen de tu presupuesto activo de ${capitalizedMonth}. Todo tu capital disponible está asignado a tus categorías de forma balanceada.`;
  };

  const contextValue = {
    state: {
      currentDate,
      budget,
      categories,
      loading,
      error,
      isModalOpen,
      isCategoryModalOpen,
      plannedIncome,
      budgetCategories,
      hasUnsavedChanges,
      isEditing,
      newCategoryName,
      selectedExistingCategoryId,
      monthYearStr,
      periodStr,
      isCurrentMonth,
      isPastMonth,
      capitalizedMonth,
      totalAllocatedInForm,
      remainingToAllocate,
      isDraft,
      isActive,
      canEdit,
      displayCategories,
      debts,
      savingsGoals,
      loadingDebts,
      loadingSavings,
      isWizardOpen,
    },
    actions: {
      setCurrentDate,
      setPlannedIncome,
      setNewCategoryName,
      setSelectedExistingCategoryId,
      setIsModalOpen,
      setIsCategoryModalOpen,
      setIsWizardOpen,
      prevMonth,
      nextMonth,
      fetchDebts,
      fetchSavings,
      fetchCategories,
      fetchBudget,
      handleCloneBudget,
      handleSaveBudget,
      handleActivateBudget,
      handleCreateCategory,
      handleAddExistingCategory,
      handleRemoveCategory,
      handleRestoreCategory,
      handleToggleEditing,
      handleCategoryAllocationChange,
      formatCurrency,
    }
  };

  return (
    <BudgetContext value={contextValue}>
      <section className="flex flex-col gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 12 }}
        >
          <AIChatBubble
            layoutId="agent-greeting"
            title="Presupuesto Mensual"
            message={getChatMessage()}
            actions={
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4 w-full items-start sm:items-center">
                <div className="flex flex-row gap-3 flex-wrap items-center">
                  {/* Selector de Mes */}
                  <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-1.5 rounded-full border border-outline-variant/30 shadow-sm">
                    <button onClick={prevMonth} className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface cursor-pointer border-none bg-transparent">
                      <IconChevronLeft size={16} />
                    </button>
                    <span className="font-bold text-[#005226] min-w-[120px] text-center capitalize text-sm select-none">
                      {monthYearStr}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface cursor-pointer border-none bg-transparent">
                      <IconChevronRight size={16} />
                    </button>
                  </div>

                  {/* Badges de Estado */}
                  <div className="flex items-center gap-2 flex-wrap select-none">
                    {budget && (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDraft ? 'bg-secondary-container text-on-secondary-container' : 'bg-[#008f43]/15 text-[#008f43]'
                        }`}>
                        {isDraft ? 'Borrador' : 'Activo'}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isCurrentMonth
                      ? 'bg-[#005226]/10 text-[#005226] border-[#005226]/30'
                      : isPastMonth
                        ? 'bg-surface-container text-outline border-outline-variant/30'
                        : 'bg-blue-500/10 text-blue-700 border-blue-500/20'
                      }`}>
                      {isCurrentMonth ? 'Mes Actual' : isPastMonth ? 'Histórico' : 'Planificación'}
                    </span>
                  </div>
                </div>

                {/* Botones de Gestión de Presupuesto */}
                <div className="flex items-center gap-2 flex-wrap select-none w-full sm:w-auto justify-end sm:justify-start">
                  {isActive && (
                    <button
                      onClick={handleToggleEditing}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm cursor-pointer border-none ${isEditing
                        ? "bg-[#005226] text-white hover:bg-[#003d1c]"
                        : "bg-surface-container text-outline hover:text-on-surface border border-outline-variant/30 hover:border-outline-variant"
                        }`}
                    >
                      {isEditing ? <IconLockOpen size={14} /> : <IconLock size={14} />}
                      <span>{isEditing ? "Modo Ajuste" : "Ajustar Límites"}</span>
                    </button>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => setIsCommitmentsOpen(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#005226] bg-[#005226]/10 hover:bg-[#005226]/20 px-3 py-1.5 rounded-full transition-colors border-none cursor-pointer shadow-sm"
                    >
                      <IconPigMoney size={14} /> Vincular Deudas/Ahorros
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="flex items-center gap-1 text-xs font-bold text-[#005226] bg-[#005226]/10 hover:bg-[#005226]/20 px-3 py-1.5 rounded-full transition-colors border-none cursor-pointer"
                    >
                      <IconPlus size={14} /> Añadir Categoría
                    </button>
                  )}
                </div>
              </div>
            }
          />
        </motion.div>

        {loading ? (
          <motion.div variants={itemVariants} className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005226]"></div>
          </motion.div>
        ) : error ? (
          <motion.div variants={itemVariants} className="bg-error-container text-on-error-container p-4 rounded-xl">{error}</motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 sm:gap-6 items-start"
          >
            {/* Left Column: Summary and Categories */}
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Summary Section */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest pl-2 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008f43]" />
                  <span>Resumen de Ingresos</span>
                </div>
                <BudgetSummary />
              </motion.div>

              {/* Categories Section */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest pl-2 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008f43]" />
                  <span>Desglose por Categorías</span>
                </div>

                {!budget ? (
                  <div className="text-center py-10 bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
                    <p className="text-outline mb-4">No hay presupuesto configurado para este mes.</p>
                    {currentDate >= new Date(new Date().getFullYear(), new Date().getMonth(), 1) && (
                      <Button variant="primary" onClick={() => setIsWizardOpen(true)}>
                        Crear Presupuesto
                      </Button>
                    )}
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    className="flex flex-col gap-6"
                  >
                    {/* Sección de Deudas */}
                    {displayCategories.some(c => !c.isMarkedForDeletion && isDebt(c.id, c.name)) && (
                      <div className="flex flex-col gap-3">
                        <h5 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest pl-2">
                          💳 Deudas y Obligaciones
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {displayCategories.filter(c => !c.isMarkedForDeletion && isDebt(c.id, c.name)).map((cat, index) => (
                            <motion.div
                              key={cat.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: "spring", stiffness: 80, damping: 12, delay: index * 0.04 }}
                            >
                              <BudgetCategoryCard category={cat} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sección de Ahorros */}
                    {displayCategories.some(c => !c.isMarkedForDeletion && isSaving(c.name)) && (
                      <div className="flex flex-col gap-3">
                        <h5 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest pl-2">
                          🐷 Metas de Ahorro
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {displayCategories.filter(c => !c.isMarkedForDeletion && isSaving(c.name)).map((cat, index) => (
                            <motion.div
                              key={cat.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: "spring", stiffness: 80, damping: 12, delay: index * 0.04 }}
                            >
                              <BudgetCategoryCard category={cat} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sección de Gastos Generales */}
                    {displayCategories.some(c => !c.isMarkedForDeletion && !isDebt(c.id, c.name) && !isSaving(c.name)) && (
                      <div className="flex flex-col gap-3">
                        <h5 className="text-[10px] font-black text-[#005226] dark:text-[#008f43] uppercase tracking-widest pl-2">
                          📊 Gastos Planificados
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {displayCategories.filter(c => !c.isMarkedForDeletion && !isDebt(c.id, c.name) && !isSaving(c.name)).map((cat, index) => (
                            <motion.div
                              key={cat.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: "spring", stiffness: 80, damping: 12, delay: index * 0.04 }}
                            >
                              <BudgetCategoryCard category={cat} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categorías a Eliminar (Con línea divisora) */}
                    {displayCategories.some(c => c.isMarkedForDeletion) && (
                      <div className="flex flex-col gap-4 mt-4 select-none">
                        <div className="flex items-center gap-3">
                          <div className="h-px bg-error/20 flex-1 animate-pulse" />
                          <span className="text-[10px] sm:text-xs font-black text-error/60 uppercase tracking-widest px-2">
                            Categorías a eliminar (se borrarán al guardar)
                          </span>
                          <div className="h-px bg-error/20 flex-1 animate-pulse" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 opacity-75">
                          {displayCategories.filter(c => c.isMarkedForDeletion).map((cat, index) => (
                            <motion.div
                              key={cat.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.04 }}
                            >
                              <BudgetCategoryCard category={cat} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Commitments Drawer */}
            <AnimatePresence>
              {isCommitmentsOpen && (
                <CommitmentsSidebar onClose={() => setIsCommitmentsOpen(false)} />
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Edit Budget Modal */}
        <AnimatePresence>
          <BudgetFormModal />
        </AnimatePresence>

        {/* Add Category Modal */}
        <AnimatePresence>
          <CategoryFormModal />
        </AnimatePresence>

        {/* Global Save Button for Unsaved Changes / Draft Mode */}
        <AnimatePresence>
          <SaveBudgetBanner />
        </AnimatePresence>

        {/* Onboarding Budget Wizard */}
        <AnimatePresence>
          <BudgetWizardModal />
        </AnimatePresence>
      </section>
    </BudgetContext>
  );
}
