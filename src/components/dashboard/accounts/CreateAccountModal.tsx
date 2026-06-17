import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { createNewAccount } from "../../../store/slices/accountsSlice";
import { useTranslation } from "react-i18next";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAccountModal({ isOpen, onClose }: CreateAccountModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [type, setType] = useState<
    "checking" | "savings" | "credit" | "investment" | "cash"
  >("checking");
  const [balance, setBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dispatch(
        createNewAccount({ name, type, balance: Number(balance) }),
      ).unwrap();

      // Resetear formulario y cerrar modal
      setName("");
      setType("checking");
      setBalance("");
      onClose();
    } catch (err) {
      console.error("Error al crear cuenta:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
          <h3 className="text-lg font-bold text-[#1B252D]">
            {t("accounts.createAccountTitle")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl cursor-pointer p-1"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-600">
              {t("accounts.accountNameLabel")}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("accounts.accountNamePlaceholder")}
              className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-600">
              {t("accounts.accountTypeLabel")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all"
            >
              <option value="checking">{t("accounts.checking")}</option>
              <option value="savings">{t("accounts.savings")}</option>
              <option value="credit">{t("accounts.credit")}</option>
              <option value="investment">{t("accounts.investment")}</option>
              <option value="cash">{t("accounts.cash")}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-600">
              {t("accounts.initialBalanceLabel")}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#006b3a] hover:bg-[#005a30] disabled:bg-gray-400 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center min-w-[100px]"
            >
              {isSubmitting ? t("accounts.creating") : t("accounts.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
