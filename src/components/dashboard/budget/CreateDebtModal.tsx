import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import debtService, { Debt } from "../../../services/debtService";
import InputField from "../../ui/InputField";
import Button from "../../ui/Button";

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (debt: Debt) => void;
}

export default function CreateDebtModal({ isOpen, onClose, onSuccess }: CreateDebtModalProps) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<"CRC" | "USD">("CRC");
  const [balance, setBalance] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [totalInstallment, setTotalInstallment] = useState<number>(0);
  const [remainingTerms, setRemainingTerms] = useState<number>(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || balance <= 0 || totalInstallment <= 0) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await debtService.validateDebt({
        name,
        currency,
        balance,
        interest_rate: interestRate,
        total_installment: totalInstallment,
        remaining_terms: remainingTerms,
      });
      if (response && response.debt) {
        onSuccess(response.debt);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Error al crear la deuda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl border border-outline-variant/30">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-on-surface">Registrar Nueva Deuda</h3>
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
            label="Nombre de la Deuda / Tarjeta *"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Tarjeta BAC Visa"
            required
          />

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-on-surface select-none">
              Moneda *
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="w-full bg-surface-container-low border border-transparent text-on-surface rounded-xl px-4 py-4 outline-none focus:border-[#005226]/40 focus:ring-2 focus:ring-[#005226]/20 focus:bg-surface-bright"
            >
              <option value="CRC">CRC (₡ - Colón)</option>
              <option value="USD">USD ($ - Dólar)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Saldo Pendiente *"
              type="number"
              value={balance || ""}
              onChange={(e) => setBalance(Number(e.target.value))}
              placeholder="0"
              min="0"
              required
            />
            <InputField
              label="Tasa de Interés (%)"
              type="number"
              step="0.01"
              value={interestRate || ""}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              placeholder="Ej. 24"
              min="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Cuota Mensual *"
              type="number"
              value={totalInstallment || ""}
              onChange={(e) => setTotalInstallment(Number(e.target.value))}
              placeholder="0"
              min="0"
              required
            />
            <InputField
              label="Meses Restantes"
              type="number"
              value={remainingTerms || ""}
              onChange={(e) => setRemainingTerms(Number(e.target.value))}
              placeholder="12"
              min="1"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/20 flex justify-end gap-3 bg-surface-container/30">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Registrando..." : "Guardar Deuda"}
          </Button>
        </div>
      </div>
    </div>
  );
}
