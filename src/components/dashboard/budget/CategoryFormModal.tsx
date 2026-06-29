import { use, useState } from "react";
import { motion } from "framer-motion";
import { IconX, IconDatabase, IconPlus } from "@tabler/icons-react";
import { BudgetContext } from "./BudgetContext";
import InputField from "../../ui/InputField";
import Button from "../../ui/Button";

export default function CategoryFormModal() {
  const context = use(BudgetContext);
  if (!context) return null;

  const { state, actions } = context;
  const { 
    isCategoryModalOpen, 
    newCategoryName, 
    selectedExistingCategoryId, 
    categories, 
    budgetCategories, 
    loading 
  } = state;
  const { 
    setIsCategoryModalOpen, 
    setNewCategoryName, 
    setSelectedExistingCategoryId, 
    handleCreateCategory, 
    handleAddExistingCategory 
  } = actions;

  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  if (!isCategoryModalOpen) return null;

  // Filter out categories that are already added to the budget
  const availableCategories = categories.filter(
    (c) => !budgetCategories.some((bc) => bc.category_id === c.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-surface-container-lowest w-full max-w-md rounded-[28px] overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Gestionar Categorías</h3>
          <button 
            onClick={() => setIsCategoryModalOpen(false)} 
            className="text-outline hover:text-on-surface cursor-pointer border-none bg-transparent"
          >
            <IconX size={24} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-outline-variant/20 bg-surface-container/10">
          <button
            onClick={() => setActiveTab("existing")}
            className={`flex-1 py-3.5 text-center text-sm font-semibold flex items-center justify-center gap-2 border-none bg-transparent cursor-pointer transition-all ${
              activeTab === "existing"
                ? "text-[#005226] border-b-2 border-b-[#005226] font-bold"
                : "text-outline hover:text-on-surface"
            }`}
          >
            <IconDatabase size={16} />
            <span>Añadir Existente</span>
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-3.5 text-center text-sm font-semibold flex items-center justify-center gap-2 border-none bg-transparent cursor-pointer transition-all ${
              activeTab === "new"
                ? "text-[#005226] border-b-2 border-b-[#005226] font-bold"
                : "text-outline hover:text-on-surface"
            }`}
          >
            <IconPlus size={16} />
            <span>Crear Nueva</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === "existing" ? (
            <div className="flex flex-col gap-2 w-full text-left">
              <label className="text-sm font-semibold text-on-surface select-none">
                Seleccionar Categoría
              </label>
              {availableCategories.length > 0 ? (
                <select
                  value={selectedExistingCategoryId}
                  onChange={(e) => setSelectedExistingCategoryId(e.target.value)}
                  className="w-full bg-surface-container-low border border-transparent text-on-surface rounded-xl px-4 py-4 outline-none transition-all duration-200 focus:border-[#005226]/40 focus:ring-2 focus:ring-[#005226]/20 focus:bg-surface-bright cursor-pointer"
                >
                  <option value="" disabled>Selecciona una categoría...</option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-outline py-4 text-center">
                  Todas las categorías de tu base de datos ya están presentes en este presupuesto.
                </p>
              )}
            </div>
          ) : (
            <InputField
              label="Nombre de la Categoría"
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ej. Suscripciones, Emergencias"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container/30">
          <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          {activeTab === "existing" ? (
            <Button 
              variant="primary" 
              onClick={handleAddExistingCategory} 
              disabled={!selectedExistingCategoryId || loading || availableCategories.length === 0}
            >
              Agregar
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleCreateCategory} 
              disabled={!newCategoryName || loading}
            >
              Crear
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
