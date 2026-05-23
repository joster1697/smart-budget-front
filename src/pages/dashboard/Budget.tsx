import { useState, useEffect } from "react";
// Budget management view
import { motion, AnimatePresence } from "framer-motion";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconChartPie,
  IconToolsKitchen2,
  IconCar,
  IconHome,
  IconDeviceTv,
  IconMedicalCross,
  IconX,
  IconLock,
  IconLockOpen,
  IconPencil,
  IconArrowUp,
  IconArrowDown,
  IconDeviceFloppy
} from "@tabler/icons-react";
import AIChatBubble from "../../components/dashboard/AIChatBubble";
import { budgetService, BudgetStatus, BudgetCategoryInput } from "../../services/budgetService";
import { categoryService, Category } from "../../services/categoryService";

// Helper to map category names to icons
const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("aliment") || lowerName.includes("comida")) return <IconToolsKitchen2 size={24} className="text-[#005226]" />;
  if (lowerName.includes("transport") || lowerName.includes("auto")) return <IconCar size={24} className="text-[#005226]" />;
  if (lowerName.includes("vivienda") || lowerName.includes("hogar")) return <IconHome size={24} className="text-[#005226]" />;
  if (lowerName.includes("entretenimiento") || lowerName.includes("ocio")) return <IconDeviceTv size={24} className="text-[#005226]" />;
  if (lowerName.includes("salud") || lowerName.includes("medic")) return <IconMedicalCross size={24} className="text-[#005226]" />;
  return <IconChartPie size={24} className="text-[#005226]" />;
};

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
    setIsEditing(false); // Reset editing mode when period/month changes
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
        // Update
        await budgetService.updateBudget(budget.id, {
          planned_income: plannedIncome,
          categories: budgetCategories
        });
      } else {
        // Create
        await budgetService.createBudget({
          period: periodStr,
          planned_income: plannedIncome,
          categories: budgetCategories
        });
      }
      setIsModalOpen(false);
      setHasUnsavedChanges(false);
      setIsEditing(false); // Lock the budget again after saving
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
        // Guardamos los cambios antes de activar
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

        // Reset local form values to original budget values
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

  const displayCategories = allCategoryIds.map(id => {
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

    // Active budget
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
        {/* Selector de Mes (Pill Blanca) */}
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-1.5 rounded-full border border-outline-variant/30 shadow-sm">
          <button onClick={prevMonth} className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface">
            <IconChevronLeft size={16} />
          </button>
          <span className="font-bold text-[#005226] min-w-[120px] text-center capitalize text-sm">
            {monthYearStr}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface">
            <IconChevronRight size={16} />
          </button>
        </div>

        {/* Badges de Estado */}
        <div className="flex items-center gap-2 flex-wrap">
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
        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005226]"></div></div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl">{error}</div>
      ) : (
        <>
          {/* Summary Card */}

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
                        className="p-1 hover:bg-primary-container text-[#005226] rounded-full transition-all duration-200 cursor-pointer"
                        title="Editar ingresos proyectados"
                      >
                        <IconPencil size={14} />
                      </button>
                    )}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-on-surface whitespace-nowrap">{formatCurrency(plannedIncome)}</span>
                </div>
                <div className="flex sm:items-center flex-col">
                  <span className="text-outline text-sm font-medium">Presupuestado</span>
                  <span className="text-xl sm:text-2xl font-black text-on-surface whitespace-nowrap">{formatCurrency(totalAllocatedInForm)}</span>
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
                    className="flex items-center gap-1 text-sm font-bold text-[#005226] hover:bg-primary-container px-3 py-1.5 rounded-full transition-colors"
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
                  <button onClick={() => setIsModalOpen(true)} className="bg-[#005226] text-white px-6 py-2 rounded-full font-bold hover:bg-[#003d1c] transition-colors">
                    Crear Presupuesto
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {displayCategories.map((cat, idx) => (
                  <div key={idx} className={`flex flex-col justify-between bg-surface-container-lowest rounded-[24px] p-5 shadow-sm border transition-all duration-300 ${canEdit ? 'border-[#005226]/30 bg-surface-container-low/20 shadow-md scale-[1.01]' : 'border-outline-variant/20'}`}>
                    <div className="flex flex-col mb-4">
                      <div className="flex flex-wrap justify-between items-center gap-x-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-primary-container/30 p-2 rounded-xl shrink-0">
                            {getCategoryIcon(cat.name)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-lg text-on-surface truncate" title={cat.name}>{cat.name}</h4>
                          </div>
                        </div>

                        {canEdit ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-outline font-medium">₡</span>
                            <input
                              type="number"
                              value={cat.allocated_amount || ""}
                              onChange={(e) => handleCategoryAllocationChange(cat.id, Number(e.target.value))}
                              className="w-24 bg-surface-container border border-outline-variant/30 rounded-lg px-2 py-1 text-right text-on-surface font-bold focus:outline-none focus:ring-1 focus:ring-[#005226]"
                              placeholder="0"
                            />
                          </div>
                        ) : (
                          <div className="text-left sm:text-right shrink-0 whitespace-nowrap">
                            <span className="text-xs text-outline font-medium">Límite:</span>
                            <span className="ml-2 font-bold text-on-surface">{formatCurrency(cat.allocated_amount)}</span>
                          </div>
                        )}
                      </div>

                      {isActive && cat.original_allocated_amount !== cat.allocated_amount && (
                        <div className={`w-fit text-[10px] font-bold px-2 py-0.5 rounded-full flex items-start gap-1 mt-1 ${cat.allocated_amount > cat.original_allocated_amount ? 'bg-error/10 text-error' : 'bg-[#008f43]/10 text-[#008f43]'}`}>
                          <span className="shrink-0 mt-[2px]">
                            {cat.allocated_amount > cat.original_allocated_amount ? <IconArrowUp size={10} /> : <IconArrowDown size={10} />}
                          </span>
                          <span className="leading-tight">
                            {formatCurrency(Math.abs(cat.allocated_amount - cat.original_allocated_amount))} ajustado (Orig: {formatCurrency(cat.original_allocated_amount)})
                          </span>
                        </div>
                      )}
                    </div>

                    {canEdit ? (
                      <div className="mt-4 mb-2">
                        <div className="flex justify-between text-xs text-outline mb-1">
                          <span>$0</span>
                          <span>{formatCurrency(plannedIncome)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={plannedIncome > 0 ? plannedIncome : 1000}
                          step="1000"
                          value={cat.allocated_amount}
                          onChange={(e) => handleCategoryAllocationChange(cat.id, Number(e.target.value))}
                          className="budget-slider cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm mb-2">
                          <span className="text-outline font-medium truncate">
                            {formatCurrency(cat.spent_amount)} de {formatCurrency(cat.allocated_amount)} gastado
                          </span>
                          <span className="font-bold text-on-surface">{Math.round(cat.usage_percentage)}%</span>
                        </div>
                        <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.is_exceeded ? 'bg-error' : 'bg-[#008f43]'}`}
                            style={{ width: `${Math.min(cat.usage_percentage, 100)}%` }}
                          ></div>
                        </div>
                        {cat.is_exceeded && (
                          <p className="text-error text-xs mt-2 font-medium">Has excedido el presupuesto para esta categoría.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Budget Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface-container-lowest w-full max-w-lg rounded-[28px] overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="text-xl font-bold text-on-surface">Configurar Presupuesto - <span className="capitalize">{monthYearStr}</span></h3>
                <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface">
                  <IconX size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-on-surface mb-2">Ingresos Proyectados</label>
                  <input
                    type="number"
                    value={plannedIncome || ""}
                    onChange={(e) => {
                      setPlannedIncome(Number(e.target.value));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-[#005226]"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-outline mt-2">
                    Define tus ingresos para empezar. Luego podrás deslizar las barras de cada categoría para asignar montos directamente en la vista principal.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container/30">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-full font-bold text-on-surface hover:bg-surface-container transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSaveBudget} className="px-5 py-2.5 rounded-full font-bold bg-[#005226] text-white hover:bg-[#003d1c] transition-colors">
                  {budget ? "Actualizar Ingresos" : "Crear Presupuesto Base"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-surface-container-lowest w-full max-w-sm rounded-[28px] overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="text-xl font-bold text-on-surface">Nueva Categoría</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="text-outline hover:text-on-surface">
                  <IconX size={24} />
                </button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-on-surface mb-2">Nombre de la Categoría</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej. Compras"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-[#005226]"
                />
              </div>
              <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container/30">
                <button onClick={() => setIsCategoryModalOpen(false)} className="px-5 py-2.5 rounded-full font-bold text-on-surface hover:bg-surface-container transition-colors">
                  Cancelar
                </button>
                <button onClick={handleCreateCategory} className="px-5 py-2.5 rounded-full font-bold bg-[#005226] text-white hover:bg-[#003d1c] transition-colors">
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Save Button for Unsaved Changes / Draft Mode */}
      <AnimatePresence>
        {(hasUnsavedChanges || isDraft) && budgetCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 lg:top-6 right-4 md:right-6 lg:right-10 left-4 sm:left-auto z-40 bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/30 px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-6 transition-all duration-300"
          >
            <div className="flex flex-row md:flex-col justify-between items-center md:items-start gap-2 mr-0 md:mr-2">
              <span className="text-[10px] md:text-xs text-outline font-bold uppercase tracking-wider capitalize">
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
                  className="flex items-center justify-center gap-2 text-sm font-bold text-on-surface hover:text-primary transition-colors disabled:opacity-50 py-2 px-3 hover:bg-surface-container rounded-xl md:rounded-none md:p-0"
                >
                  <IconDeviceFloppy size={18} /> Guardar
                </button>
                <div className="hidden md:block w-[1px] h-6 bg-outline-variant/30"></div>
                {isPastMonth ? (
                  <span className="text-xs text-outline italic px-2">No editable</span>
                ) : (
                  <button
                    onClick={handleActivateBudget}
                    disabled={loading}
                    className="bg-[#005226] text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-bold hover:bg-[#003d1c] shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 flex-1 md:flex-none"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    Activar {capitalizedMonth}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleSaveBudget}
                disabled={loading}
                className="bg-[#005226] text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-bold hover:bg-[#003d1c] shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full md:w-auto"
              >
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Guardar en {capitalizedMonth}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </motion.section>
  );
}
