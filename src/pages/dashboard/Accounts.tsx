import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AIChatBubble from "../../components/dashboard/AIChatBubble";
import AccountCard from "../../components/dashboard/AccountCard";
import AccountDetails from "../../components/dashboard/accounts/AccountDetails";
import PrimaryCheckingAnalysis from "../../components/dashboard/accounts/PrimaryCheckingAnalysis";
import LinkedCreditCards from "../../components/dashboard/accounts/LinkedCreditCards";
import SmartTools from "../../components/dashboard/accounts/SmartTools";
import DangerZone from "../../components/dashboard/accounts/DangerZone";
import CreateAccountModal from "../../components/dashboard/accounts/CreateAccountModal";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import {
  IconBuildingBank,
  IconPigMoney,
  IconTrendingUp,
  IconLeaf,
  IconPlus,
} from "@tabler/icons-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12,
    },
  },
} as const;

// Helpers externos declarados fuera del componente para evitar reinstanciaciones innecesarias
const getAccountIcon = (type: string) => {
  switch (type) {
    case "savings":
      return <IconPigMoney size={16} />;
    case "investment":
      return <IconTrendingUp size={16} />;
    case "credit":
      return <IconLeaf size={16} />;
    default:
      return <IconBuildingBank size={16} />;
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(value);

export default function Accounts() {
  const dispatch = useAppDispatch();
  const { accounts, loading } = useAppSelector((state) => state.accounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // Hook robusto que maneja la inicialización y el caso límite de selección tras eliminar cuentas
  useEffect(() => {
    if (accounts.length > 0) {
      const exists = accounts.some((account) => account.id === selectedAccountId);
      if (!exists) {
        setSelectedAccountId(accounts[0].id);
      }
    } else {
      setSelectedAccountId(null);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 240);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
  );

  return (
    <section className="flex flex-col gap-6 pb-20 pt-4 px-4 sm:px-6">
      {/* ── STICKY ACTIVE ACCOUNT HEADER ── */}
      <AnimatePresence>
        {showStickyHeader && selectedAccount && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="fixed top-0 left-0 lg:left-[280px] right-0 z-40 bg-[#f6f8f7]/90 backdrop-blur-md border-b border-outline-variant/30 px-4 pl-5 pr-20 lg:pr-6 py-4 lg:py-2.5 flex justify-between items-center shadow-sm h-[72px] lg:h-auto"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[#005226] shrink-0">
                {getAccountIcon(selectedAccount.type)}
              </span>
              <span className="text-xs sm:text-[13px] font-extrabold uppercase text-[#1B252D] tracking-wider truncate">
                {selectedAccount.name}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-bold shrink-0">
              <div className="flex flex-col sm:flex-row sm:gap-1.5 items-end sm:items-center">
                <span className="text-outline/60 text-[9px] uppercase">Real</span>
                <span className="text-[#1B252D] tabular-nums font-extrabold">
                  {formatCurrency(selectedAccount.balance)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-1.5 items-end sm:items-center border-l border-outline-variant/30 pl-3">
                <span className="text-outline/60 text-[9px] uppercase">Virtual</span>
                <span className="text-[#008f43] tabular-nums font-black">
                  {formatCurrency(
                    selectedAccount.balance - (selectedAccount.reserved_balance ?? 0)
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 12 }}
      >
        <AIChatBubble
          layoutId="accounts-header"
          title="Gestión de Cuentas"
          message="Selecciona una de tus cuentas para profundizar en su análisis patrimonial y opciones de gestión."
          actions={
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#006b3a] hover:bg-[#005a30] active:scale-95 text-white text-[13px] font-bold px-4 py-2 rounded-full shadow-sm transition-all duration-200 cursor-pointer"
            >
              <IconPlus size={16} /> Add Account
            </button>
          }
        />
      </motion.div>

      {loading || (accounts.length > 0 && !selectedAccountId) ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006b3a]"></div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Grid de tarjetas dinámico */}
          <motion.div variants={itemVariants}>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest pl-2 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008f43]" />
                <span>Resumen de Cuentas</span>
              </div>
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5"
              >
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
                    <motion.div key={account.id} variants={itemVariants}>
                      <AccountCard
                        title={account.name}
                        icon={icon}
                        balance={formattedBalance}
                        virtualBalance={formattedVirtual}
                        isDark={account.type === "credit"}
                        isSelected={account.id === selectedAccountId}
                        onClick={() => setSelectedAccountId(account.id)}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>

          {/* Subcontenedor animado para desgloses inferiores. Se recrea al cambiar de cuenta seleccionada */}
          <motion.div
            key={selectedAccountId ?? "no-account"}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {/* Análisis Patrimonial */}
            {selectedAccount && (
              <motion.div variants={itemVariants}>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest pl-2 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#008f43]" />
                    <span>Análisis Patrimonial - {selectedAccount.name}</span>
                  </div>
                  <PrimaryCheckingAnalysis account={selectedAccount} />
                </div>
              </motion.div>
            )}

            {/* Detalles y Saldos */}
            {selectedAccount && (
              <motion.div variants={itemVariants}>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest pl-2 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#008f43]" />
                    <span>Detalles y Saldos</span>
                  </div>
                  <AccountDetails account={selectedAccount} />
                </div>
              </motion.div>
            )}

            {/* Tarjetas Ligadas */}
            {selectedAccount && selectedAccount.type !== "credit" && (
              <motion.div variants={itemVariants}>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest pl-2 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#008f43]" />
                    <span>Tarjetas de Crédito Vinculadas</span>
                  </div>
                  <LinkedCreditCards account={selectedAccount} />
                </div>
              </motion.div>
            )}

            {/* Herramientas Inteligentes */}
            <motion.div variants={itemVariants}>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest pl-2 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008f43]" />
                  <span>Herramientas Inteligentes</span>
                </div>
                <SmartTools />
              </div>
            </motion.div>

            {/* Zona de Peligro */}
            {selectedAccount && (
              <motion.div variants={itemVariants}>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest pl-2 select-none mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-error" />
                    <span className="text-error">Zona de Peligro</span>
                  </div>
                  <DangerZone account={selectedAccount} />
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Modal para Crear Cuenta (encapsulado en componente autónomo para aislar renders de teclado) */}
      <CreateAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
