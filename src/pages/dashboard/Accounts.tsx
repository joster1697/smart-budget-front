import { useState, useEffect } from "react";
import AccountHeader from "../../components/dashboard/accounts/AccountHeader";
import AccountAIBanner from "../../components/dashboard/accounts/AccountAIBanner";
import AccountCard from "../../components/dashboard/AccountCard";
import AccountDetails from "../../components/dashboard/accounts/AccountDetails";
import PrimaryCheckingAnalysis from "../../components/dashboard/accounts/PrimaryCheckingAnalysis";
import LinkedCreditCards from "../../components/dashboard/accounts/LinkedCreditCards";
import SmartTools from "../../components/dashboard/accounts/SmartTools";
import DangerZone from "../../components/dashboard/accounts/DangerZone";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { createNewAccount } from "../../store/slices/accountsSlice";
import {
  IconBuildingBank,
  IconPigMoney,
  IconTrendingUp,
  IconLeaf,
} from "@tabler/icons-react";

export default function Accounts() {
  const dispatch = useAppDispatch();
  const { accounts } = useAppSelector((state) => state.accounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<
    "checking" | "savings" | "credit" | "investment" | "cash"
  >("checking");
  const [balance, setBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
      const selectedAccount = accounts.find(
        (account) => account.id === selectedAccountId,
      );
    }
  }, [accounts, selectedAccountId]);
  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Llamamos a nuestro thunk pasándole los datos
      await dispatch(
        createNewAccount({ name, type, balance: Number(balance) }),
      ).unwrap();

      // Reseteamos el formulario y cerramos modal
      setName("");
      setType("checking");
      setBalance("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating account:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 pb-20 pt-4 px-4 sm:px-6">
      <AccountAIBanner />
      <AccountHeader onAddAccount={() => setIsModalOpen(true)} />
      {/* Grid de tarjetas dinámico */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5 mt-4 mb-4">
        {accounts.map((account) => {
          // Elegimos el icono según el tipo de cuenta
          let icon = <IconBuildingBank size={18} />;
          if (account.type === "savings") icon = <IconPigMoney size={18} />;
          if (account.type === "investment")
            icon = <IconTrendingUp size={18} />;
          if (account.type === "credit") icon = <IconLeaf size={18} />;
          // Formateamos los balances en formato de colones (₡100.00)
          const formattedBalance = new Intl.NumberFormat("es-CR", {
            style: "currency",
            currency: "CRC",
          }).format(account.balance);
          const formattedVirtual = new Intl.NumberFormat("es-CR", {
            style: "currency",
            currency: "CRC",
          }).format(account.balance - (account.reserved_balance ?? 0));
          return (
            <AccountCard
              key={account.id}
              title={account.name}
              icon={icon}
              balance={formattedBalance}
              virtualBalance={formattedVirtual}
              isDark={account.type === "credit"}
              isSelected={account.id === selectedAccountId}
              onClick={() => setSelectedAccountId(account.id)}
            />
          );
        })}
      </div>
      <PrimaryCheckingAnalysis />
      <AccountDetails account={selectedAccount} />
      <LinkedCreditCards account={selectedAccount} />
      <SmartTools />
      <DangerZone account={selectedAccount} />
      {/* Modal para Crear Cuenta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 mx-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <h3 className="text-lg font-bold text-[#1B252D]">
                Create New Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black text-xl cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleCreateAccount}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Daily Spending"
                  className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600">
                  Account Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit">Credit Card</option>
                  <option value="investment">Investment</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600">
                  Initial Balance
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
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#006b3a] hover:bg-[#005a30] disabled:bg-gray-400 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center min-w-[100px]"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
