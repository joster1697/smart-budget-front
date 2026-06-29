import { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import savingsService from "../../../services/savingsService";
import accountService, { Account } from "../../../services/accountService";
import { SavingsGoal } from "../../../types/savings";
import InputField from "../../ui/InputField";
import Button from "../../ui/Button";

interface CreateSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (goal: SavingsGoal) => void;
}

export default function CreateSavingsGoalModal({ isOpen, onClose, onSuccess }: CreateSavingsGoalModalProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [targetDate, setTargetDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch accounts to populate dropdown
      accountService.getAccounts()
        .then(res => {
          // Filter to debit/checking/savings accounts
          const availableAccounts = res.accounts.filter(acc => acc.type !== "credit");
          setAccounts(availableAccounts);
          if (availableAccounts.length > 0) {
            setAccountId(availableAccounts[0].id);
          }
        })
        .catch(err => console.error("Error loading accounts:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || targetAmount <= 0) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await savingsService.createGoal({
        name,
        target_amount: targetAmount,
        target_date: targetDate || undefined,
        account_id: accountId || undefined,
      });
      if (response && response.goal) {
        onSuccess(response.goal);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Error al crear la meta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl border border-outline-variant/30">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Crear Nueva Meta de Ahorro</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface cursor-pointer border-none bg-transparent">
            <IconX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <InputField
            label="Nombre de la Meta *"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Fondo para Viaje"
            required
          />

          <InputField
            label="Monto Objetivo *"
            type="number"
            value={targetAmount || ""}
            onChange={(e) => setTargetAmount(Number(e.target.value))}
            placeholder="0"
            min="0"
            required
          />

          <InputField
            label="Fecha Límite (Opcional)"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            placeholder=""
          />

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-on-surface select-none">
              Cuenta Asociada (Depósito de Reservas)
            </label>
            {accounts.length > 0 ? (
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-surface-container-low border border-transparent text-on-surface rounded-xl px-4 py-4 outline-none focus:border-[#005226]/40 focus:ring-2 focus:ring-[#005226]/20 focus:bg-surface-bright"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Saldo: ₡{acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-outline py-2">
                No tienes cuentas de débito o ahorros registradas.
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container/30">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creando..." : "Guardar Meta"}
          </Button>
        </div>
      </div>
    </div>
  );
}
