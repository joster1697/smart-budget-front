import { use } from "react";
import { motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { BudgetContext } from "./BudgetContext";
import InputField from "../../ui/InputField";
import Button from "../../ui/Button";

export default function CategoryFormModal() {
  const context = use(BudgetContext);
  if (!context) return null;

  const { state, actions } = context;
  const { isCategoryModalOpen, newCategoryName, loading } = state;
  const { setIsCategoryModalOpen, setNewCategoryName, handleCreateCategory } = actions;

  if (!isCategoryModalOpen) return null;

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
        className="bg-surface-container-lowest w-full max-w-sm rounded-[28px] overflow-hidden shadow-xl"
      >
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Nueva Categoría</h3>
          <button onClick={() => setIsCategoryModalOpen(false)} className="text-outline hover:text-on-surface cursor-pointer border-none bg-transparent">
            <IconX size={24} />
          </button>
        </div>
        <div className="p-6">
          <InputField
            label="Nombre de la Categoría"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ej. Compras"
          />
        </div>
        <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container/30">
          <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateCategory} disabled={!newCategoryName || loading}>
            Crear
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
