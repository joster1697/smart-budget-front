import { use } from "react";
import { motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";
import { BudgetContext } from "./BudgetContext";
import InputField from "../../ui/InputField";
import Button from "../../ui/Button";

export default function BudgetFormModal() {
  const context = use(BudgetContext);
  if (!context) return null;

  const { state, actions } = context;
  const { isModalOpen, plannedIncome, monthYearStr, budget, loading } = state;
  const { setIsModalOpen, setPlannedIncome, handleSaveBudget } = actions;

  if (!isModalOpen) return null;

  const isUpdate = !!budget;

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
        className="bg-surface-container-lowest w-full max-w-lg rounded-[28px] overflow-hidden shadow-xl"
      >
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Configurar Presupuesto - <span className="capitalize">{monthYearStr}</span></h3>
          <button onClick={() => setIsModalOpen(false)} className="text-outline hover:text-on-surface cursor-pointer border-none bg-transparent">
            <IconX size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-2">
            <InputField
              label="Ingresos Proyectados"
              type="number"
              value={plannedIncome || ""}
              onChange={(e) => setPlannedIncome(Number(e.target.value))}
              placeholder="0.00"
            />
            <p className="text-xs text-outline mt-2 text-left">
              Define tus ingresos para empezar. Luego podrás deslizar las barras de cada categoría para asignar montos directamente en la vista principal.
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container/30">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveBudget} loading={loading}>
            {isUpdate ? "Actualizar Ingresos" : "Crear Presupuesto Base"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
