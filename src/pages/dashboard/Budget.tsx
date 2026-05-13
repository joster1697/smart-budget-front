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
  IconX
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

  // Category creation state
  const [newCategoryName, setNewCategoryName] = useState("");

  const monthYearStr = currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const periodStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const fetchBudget = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await budgetService.getBudget(periodStr);
      const data = response.budget;
      setBudget(data);
      setPlannedIncome(data.planned_income);
      setBudgetCategories(data.categories.map(c => ({
        category_id: c.category_id || "",
        allocated_amount: c.allocated_amount
      })));
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
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchBudget();
    fetchCategories();
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
      fetchBudget();
    } catch (err) {
      const error = err as Error;
      alert(error.message || "Error al guardar el presupuesto");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    try {
      const newCat = await categoryService.createCategory({
        name: newCategoryName,
        type: "EXPENSE"
      });
      setCategories([...categories, newCat]);
      setBudgetCategories([...budgetCategories, { category_id: newCat.id, allocated_amount: 0 }]);
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
    } catch (err) {
      const error = err as Error;
      alert(error.message || "Error al crear la categoría");
    }
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
        message={`Hola, aquí tienes el resumen de tu presupuesto. Tienes ${formatCurrency(budget?.available_to_budget || 0)} disponibles para asignar. ¿En qué más te puedo ayudar?`}
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
              <div className="flex flex-col">
                <span className="text-outline text-sm font-medium">Total Esperado</span>
                <span className="text-2xl font-black text-on-surface">{formatCurrency(budget?.planned_income || 0)}</span>
              </div>
              <div className="w-[1px] bg-outline-variant/30 hidden md:block"></div>
              <div className="flex flex-col">
                <span className="text-outline text-sm font-medium">Presupuestado</span>
                <span className="text-2xl font-black text-on-surface">{formatCurrency(budget?.total_allocated || 0)}</span>
              </div>
              <div className="w-[1px] bg-outline-variant/30 hidden md:block"></div>
              <div className="flex flex-col">
                <span className="text-outline text-sm font-medium">Disponible</span>
                <span className="text-2xl font-black text-[#008f43]">{formatCurrency(budget?.available_to_budget || 0)}</span>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-on-surface font-manrope">Categorías de Presupuesto</h3>
              <div className="flex gap-2">
                {budget && currentDate > new Date(new Date().getFullYear(), new Date().getMonth(), 1) && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1 text-sm font-bold text-[#005226] hover:bg-primary-container px-3 py-1.5 rounded-full transition-colors"
                  >
                    Editar Presupuesto
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

            {!budget || budget.categories.length === 0 ? (
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
                {budget.categories.map((cat, idx) => (
                  <div key={idx} className="bg-surface-container-lowest rounded-[24px] p-5 shadow-sm border border-outline-variant/20">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-container/30 p-2 rounded-xl">
                          {getCategoryIcon(cat.category_name)}
                        </div>
                        <h4 className="font-bold text-lg text-on-surface">{cat.category_name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-outline font-medium">Límite:</span>
                        <span className="ml-2 font-bold text-on-surface">{formatCurrency(cat.allocated_amount)}</span>
                      </div>
                    </div>
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
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-on-surface mb-2">Ingresos Proyectados</label>
                  <input
                    type="number"
                    value={plannedIncome}
                    onChange={(e) => setPlannedIncome(Number(e.target.value))}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-[#005226]"
                  />
                </div>

                <h4 className="font-bold text-on-surface mb-4">Asignación por Categoría</h4>
                {categories.length === 0 ? (
                  <p className="text-sm text-outline">No hay categorías disponibles. Añade una primero.</p>
                ) : (
                  <div className="space-y-4">
                    {categories.map(cat => {
                      const budgetCat = budgetCategories.find(bc => bc.category_id === cat.id);
                      const amount = budgetCat ? budgetCat.allocated_amount : 0;
                      return (
                        <div key={cat.id} className="flex items-center justify-between gap-4">
                          <span className="text-sm font-medium flex-1">{cat.name}</span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const newArr = [...budgetCategories];
                              const idx = newArr.findIndex(bc => bc.category_id === cat.id);
                              if (idx >= 0) newArr[idx].allocated_amount = val;
                              else newArr.push({ category_id: cat.id, allocated_amount: val });
                              setBudgetCategories(newArr);
                            }}
                            className="w-1/2 bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-[#005226]"
                            placeholder="Monto"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container/30">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-full font-bold text-on-surface hover:bg-surface-container transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSaveBudget} className="px-5 py-2.5 rounded-full font-bold bg-[#005226] text-white hover:bg-[#003d1c] transition-colors">
                  Guardar Presupuesto
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

    </motion.section>
  );
}
