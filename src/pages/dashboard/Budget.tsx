import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconLock,
  IconLockOpen,
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CRC' }).format(amount);
};

export default function Budget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [budget, setBudget] = useState<BudgetStatus | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Form states
  const [plannedIncome, setPlannedIncome] = useState<number>(0);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategoryInput[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Category creation state
  const [newCategoryName, setNewCategoryName] = useState("");

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
        setBudgetCategories(data.categories.map(c => ({
          category_id: c.category_id || "",
          allocated_amount: c.allocated_amount
        })));
      }
    } catch (err) {
      const error = err as Error & { statusCode?: number };
      if (error.statusCode === 404 || error.message?.toLowerCase().includes("not found")) {
        setBudget(null);
      } else {
        setError(error.message || "Error al cargar el presupuesto");
      }
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
    setIsEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodStr]);

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

  const allCategoryIds = Array.from(new Set([
    ...categories.map(c => c.id),
    ...(budget?.categories || []).map(c => c.category_id || "")
  ])).filter(id => id);

  const displayCategories: BudgetCategoryData[] = allCategoryIds.map(id => {
    const baseCat = categories.find(c => c.id === id);
    const budgetCat = budget?.categories.find(c => c.category_id === id);
    const localCat = budgetCategories.find(c => c.category_id === id);

    return {
      id: id,
      name: baseCat?.name || budgetCat?.category_name || "Desconocida",
      allocated_amount: localCat ? localCat.allocated_amount : (budgetCat?.allocated_amount || 0),
      original_allocated_amount: budgetCat?.original_allocated_amount ?? 0,
      spent_amount: budgetCat?.spent_amount || 0,
      usage_percentage: budgetCat?.usage_percentage || 0,
      is_exceeded: budgetCat?.is_exceeded || false
    };
  });

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col gap-6"
    >
      <AIChatBubble
        layoutId="agent-greeting"
        message={getChatMessage()}
      />

      <div className="flex flex-row sm:justify-between gap-4 mt-2 mb-1 flex-wrap">
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

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005226]"></div>
        </div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl">{error}</div>
      ) : (
        <>
          {/* Summary Card */}
          <BudgetSummary
            plannedIncome={plannedIncome}
            totalAllocated={totalAllocatedInForm}
            remainingToAllocate={remainingToAllocate}
            isEditing={isEditing}
            onEditIncomeClick={() => setIsModalOpen(true)}
            formatCurrency={formatCurrency}
          />

          {/* Categories Section */}
          <div>
            <div className="flex flex-col justify-between sm:flex-row sm:items-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-on-surface font-manrope">Categorías de Presupuesto</h3>
              <div className="flex items-center gap-3">
                {isActive && (
                  <button
                    onClick={handleToggleEditing}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm cursor-pointer ${isEditing
                      ? "bg-[#005226] text-white hover:bg-[#003d1c]"
                      : "bg-surface-container text-outline hover:text-on-surface border border-outline-variant/30 hover:border-outline-variant"
                      }`}
                  >
                    {isEditing ? <IconLockOpen size={14} /> : <IconLock size={14} />}
                    <span>{isEditing ? "Modo Ajuste" : "Ajustar Límites"}</span>
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="flex items-center gap-1 text-sm font-bold text-[#005226] hover:bg-primary-container px-3 py-1.5 rounded-full transition-colors border-none bg-transparent cursor-pointer"
                  >
                    <IconPlus size={16} /> Añadir Categoría
                  </button>
                )}
              </div>
            </div>

            {!budget ? (
              <div className="text-center py-10 bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
                <p className="text-outline mb-4">No hay presupuesto configurado para este mes.</p>
                {currentDate >= new Date(new Date().getFullYear(), new Date().getMonth(), 1) && (
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    Crear Presupuesto
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {displayCategories.map((cat) => (
                  <BudgetCategoryCard
                    key={cat.id}
                    category={cat}
                    canEdit={canEdit}
                    isActive={isActive}
                    plannedIncome={plannedIncome}
                    onAllocationChange={handleCategoryAllocationChange}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Budget Modal */}
      <AnimatePresence>
        <BudgetFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          plannedIncome={plannedIncome}
          onPlannedIncomeChange={setPlannedIncome}
          onSaveBudget={handleSaveBudget}
          monthYearStr={monthYearStr}
          isUpdate={!!budget}
          loading={loading}
        />
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        <CategoryFormModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          newCategoryName={newCategoryName}
          onNewCategoryNameChange={setNewCategoryName}
          onSaveCategory={handleCreateCategory}
          loading={loading}
        />
      </AnimatePresence>

      {/* Global Save Button for Unsaved Changes / Draft Mode */}
      <AnimatePresence>
        <SaveBudgetBanner
          isVisible={(!loading && (hasUnsavedChanges || isDraft) && budgetCategories.length > 0)}
          isDraft={isDraft}
          monthYearStr={monthYearStr}
          remainingToAllocate={remainingToAllocate}
          isPastMonth={isPastMonth}
          capitalizedMonth={capitalizedMonth}
          loading={loading}
          hasUnsavedChanges={hasUnsavedChanges}
          onSaveBudget={handleSaveBudget}
          onActivateBudget={handleActivateBudget}
          formatCurrency={formatCurrency}
        />
      </AnimatePresence>
    </motion.section>
  );
}
