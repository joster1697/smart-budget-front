import { useState, useEffect } from "react";
// Budget management view
import { motion, AnimatePresence } from "framer-motion";
import {
  IconChevronLeft,
  IconChevronRight,
  IconWallet,
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
  IconPencil
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

  const now = new Date();
  const isEditable = !!budget && (
    currentDate.getFullYear() > now.getFullYear() ||
    (currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() >= now.getMonth())
  );

  const canEdit = isEditable && isEditing;

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col gap-6"
    >
      <AIChatBubble
        layoutId="agent-greeting"
        message={`Hola, aquí tienes el resumen de tu presupuesto. Tienes ${formatCurrency(remainingToAllocate)} disponibles para asignar. ¿En qué más te puedo ayudar?`}
      />

      {/* Header and Month Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-black tracking-tight text-on-surface font-manrope">Presupuesto</h2>
          <p className="text-outline text-sm">Gestión y proyección financiera.</p>
        </div>
        <div className="flex items-center gap-4 bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant/30 shadow-sm">
          <button onClick={prevMonth} className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface">
            <IconChevronLeft size={20} />
          </button>
          <span className="font-bold text-[#005226] min-w-[120px] text-center capitalize">
            {monthYearStr}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-surface-container rounded-full transition-colors text-on-surface">
            <IconChevronRight size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005226]"></div></div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl">{error}</div>
      ) : (
        <>
          {/* Summary Card */}
          <div className="bg-surface-container-lowest rounded-[28px] p-6 shadow-sm border border-outline-variant/20 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 lg:w-1/3">
              <div className="bg-primary-container text-[#005226] p-3 rounded-xl">
                <IconWallet size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-on-surface">Ingresos Proyectados</h3>
              </div>
            </div>
            <div className="flex flex-1 justify-between w-full lg:w-2/3">
              <div className="flex flex-col relative group">
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
                <span className="text-2xl font-black text-on-surface">{formatCurrency(plannedIncome)}</span>
              </div>
              <div className="w-[1px] bg-outline-variant/30 hidden md:block"></div>
              <div className="flex flex-col">
                <span className="text-outline text-sm font-medium">Presupuestado</span>
                <span className="text-2xl font-black text-on-surface">{formatCurrency(totalAllocatedInForm)}</span>
              </div>
              <div className="w-[1px] bg-outline-variant/30 hidden md:block"></div>
              <div className="flex flex-col">
                <span className="text-outline text-sm font-medium">Disponible</span>
                <span className={`text-2xl font-black ${remainingToAllocate < 0 ? 'text-error' : 'text-[#008f43]'}`}>
                  {formatCurrency(remainingToAllocate)}
                </span>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-on-surface font-manrope">Categorías de Presupuesto</h3>
              <div className="flex items-center gap-3">
                {isEditable && (
                  <button
                    onClick={handleToggleEditing}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 shadow-sm cursor-pointer ${
                      isEditing
                        ? "bg-[#005226] text-white hover:bg-[#003d1c]"
                        : "bg-surface-container text-outline hover:text-on-surface border border-outline-variant/30 hover:border-outline-variant"
                    }`}
                  >
                    {isEditing ? <IconLockOpen size={14} /> : <IconLock size={14} />}
                    <span>{isEditing ? "Modo Edición: Activo" : "Bloqueado"}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-1 text-sm font-bold text-[#005226] hover:bg-primary-container px-3 py-1.5 rounded-full transition-colors"
                >
                  <IconPlus size={16} /> Añadir Categoría
                </button>
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
                  <div key={idx} className={`bg-surface-container-lowest rounded-[24px] p-5 shadow-sm border transition-all duration-300 ${canEdit ? 'border-[#005226]/30 bg-surface-container-low/20 shadow-md scale-[1.01]' : 'border-outline-variant/20'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-container/30 p-2 rounded-xl">
                          {getCategoryIcon(cat.name)}
                        </div>
                        <h4 className="font-bold text-lg text-on-surface">{cat.name}</h4>
                      </div>

                      {canEdit ? (
                        <div className="flex items-center gap-2">
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
                        <div className="text-right">
                          <span className="text-xs text-outline font-medium">Límite:</span>
                          <span className="ml-2 font-bold text-on-surface">{formatCurrency(cat.allocated_amount)}</span>
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
                      <>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-outline font-medium">
                            {formatCurrency(cat.spent_amount)} de {formatCurrency(cat.allocated_amount)} gastado
                          </span>
                          <span className="font-bold text-on-surface">{cat.usage_percentage}%</span>
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
                      </>
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

      {/* Global Save Button for Unsaved Changes */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed top-8 right-6 z-40 bg-surface-container-highest border border-outline-variant/30 px-6 py-4 rounded-full shadow-2xl flex items-center gap-6"
          >
            <div className="flex flex-col">
              <span className="text-xs text-outline font-bold uppercase">Cambios sin guardar</span>
              <span className="text-sm font-bold text-on-surface">
                Por asignar: <span className={remainingToAllocate < 0 ? 'text-error' : 'text-[#008f43]'}>{formatCurrency(remainingToAllocate)}</span>
              </span>
            </div>
            <button
              onClick={handleSaveBudget}
              className="bg-[#005226] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#003d1c] shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : null}
              Guardar Asignaciones
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.section>
  );
}
