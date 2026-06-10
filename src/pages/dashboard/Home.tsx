import { useState, useEffect } from "react";
import {
  IconBuildingBank,
  IconPigMoney,
  IconTrendingUp,
  IconLeaf,
  IconHistory,
  IconShoppingCart,
  IconCash,
  IconToolsKitchen2,
  IconDeviceTv,
  IconBulb,
  IconCalendarEvent,
} from "@tabler/icons-react";
import AIChatBubble from "../../components/dashboard/AIChatBubble";
import AccountCard from "../../components/dashboard/AccountCard";
import ActivityItem from "../../components/dashboard/ActivityItem";
import PaymentCard from "../../components/dashboard/TransactionCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { div, style } from "framer-motion/client";
import { fetchTransactions } from "../../store/slices/transactionsSlice";
import type { Transaction } from "../../store/slices/transactionsSlice";
import transactionService from "../../services/transactionService";

export const formatDueDate = (dateString: string) => {
  const date = new Date(dateString);
  return `Vence a las ${date.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })} `;
};

export default function Home() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { accounts } = useAppSelector((state) => state.accounts);
  const { transactions } = useAppSelector((state) => state.transactions);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  //State for upcoming payments
  const [upcomingPayments, setUpcomingPayments] = useState<Transaction[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    dispatch(fetchTransactions({ limit: 10 }));
  }, [dispatch]);

  // useEffect(() => {
  //   setLoadingUpcoming(true);
  //   const fetchUpcoming = async () => {
  //     try {
  //       const today = new Date().toISOString();
  //       const response = await transactionService.getTransactions({
  //         from: today,
  //         type: "expense",
  //         limit: 5,
  //       });
  //       setUpcomingPayments(response.transactions || []);
  //     } catch (error) {
  //       console.error("Error al obtener los datos", error);
  //     } finally {
  //       setLoadingUpcoming(false);
  //     }
  //   };
  //   fetchUpcoming();
  // }, [transactions]);

  useEffect(() => {
    setLoadingUpcoming(true);
    const fetchUpcoming = async () => {
      try {
        // 1. Solicitamos los gastos al servidor (sin mandar el filtro 'from')
        const response = await transactionService.getTransactions({
          type: "expense",
          limit: 50, // Traemos un límite alto para tener de dónde filtrar
        });

        console.log("🔍 Gastos recibidos del servidor:", response.transactions);

        // 2. Filtramos en JavaScript las transacciones cuya fecha sea posterior a "ahora"
        const now = new Date();
        const futurePayments = (response.transactions || []).filter(
          (payment) => new Date(payment.date) > now,
        );

        console.log("🔍 Pagos futuros filtrados en el Front:", futurePayments);

        // 3. Guardamos solo los primeros 5 pagos futuros
        setUpcomingPayments(futurePayments.slice(0, 5));
      } catch (error) {
        console.error("❌ Error al obtener los datos:", error);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchUpcoming();
  }, [transactions]);

  const formatTxCurrency = (value: number) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(value);

  const formatTxDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryIcon = (categoryName?: string) => {
    const name = categoryName?.toLowerCase() || "";
    if (
      name.includes("supermercado") ||
      name.includes("compras") ||
      name.includes("shopping")
    ) {
      return <IconShoppingCart size={20} className="text-on-surface-variant" />;
    }
    if (
      name.includes("restaurante") ||
      name.includes("comida") ||
      name.includes("food")
    ) {
      return (
        <IconToolsKitchen2 size={20} className="text-on-surface-variant" />
      );
    }
    if (
      name.includes("servicio") ||
      name.includes("luz") ||
      name.includes("agua") ||
      name.includes("bulb")
    ) {
      return <IconBulb size={20} className="text-on-surface-variant" />;
    }
    if (
      name.includes("streaming") ||
      name.includes("suscripción") ||
      name.includes("entretenimiento")
    ) {
      return <IconDeviceTv size={20} className="text-on-surface-variant" />;
    }
    return <IconCash size={20} className="text-on-surface-variant" />;
  };

  const getDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate().toString().padStart(2, "0");
  };

  const getMonthAbbreviation = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("es-CR", { month: "short" })
      .replace(".", "")
      .toUpperCase();
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Greeting Card */}
      <AIChatBubble message="¡Hola de nuevo, Jorge! He preparado el resumen de tu arquitectura patrimonial hoy." />

      {/* Cuentas */}
      <div>
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-[22px] font-black tracking-tight text-on-surface font-manrope">
            Cuentas
          </h2>
          <button
            onClick={() => navigate("/dashboard/accounts")}
            className="text-xs font-bold text-[#005226] hover:opacity-80 cursor-pointer"
          >
            Ver todas
          </button>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5">
          {accounts &&
            accounts.map((account) => {
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
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Actividad Reciente */}
        <div className="flex-1 bg-surface-container-lowest rounded-[28px] p-6 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-black tracking-tight text-[#001f26] font-manrope">
              Actividad Reciente
            </h2>
          </div>
          <div className="space-y-5">
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const isIncome = transaction.type === "income";
                return (
                  <ActivityItem
                    key={transaction.id}
                    icon={
                      isIncome ? (
                        <IconCash size={20} />
                      ) : (
                        getCategoryIcon(transaction.category?.name)
                      )
                    }
                    title={transaction.description || "Transaction"}
                    date={formatTxDate(transaction.date)}
                    amount={formatTxCurrency(transaction.amount)}
                    isNegative={!isIncome}
                    iconBgClass={
                      isIncome ? "bg-primary-container/40" : undefined
                    }
                  />
                );
              })
            ) : (
              <div className="text-center py-6 text-sm text-gray-500">
                No hay transacciones reciente
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/dashboard/transactions")}
              className="text-[13px] font-bold text-[#005226] hover:opacity-80 cursor-pointer"
            >
              Ver toda la actividad &gt;
            </button>
          </div>
        </div>

        {/* Próximos Pagos */}
        <div className="flex-1 bg-surface-container-lowest rounded-[28px] p-6 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-black tracking-tight text-[#001f26] font-manrope">
              Próximos Pagos
            </h2>
            <IconCalendarEvent size={22} className="text-[#005226]" />
          </div>
          <div className="flex flex-col gap-3">
            {loadingUpcoming ? (
              <div className="text-center py-6 text-sm text-gray-500 font-medium animate-pulse">
                Cargando próximos pagos...
              </div>
            ) : upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  day={getDay(payment.date)}
                  month={getMonthAbbreviation(payment.date)}
                  title={payment.description || "Pago Programado"}
                  amount={formatTxCurrency(payment.amount)}
                  icon={getCategoryIcon(payment.category?.name)}
                  isNegative={payment.type === "expense"}
                  subtitle={formatDueDate(payment.date)}
                />
              ))
            ) : (
              <div className="text-center py-8 px-4 border border-dashed border-[#005226]/20 rounded-2xl bg-surface-variant/10">
                <p className="text-sm text-on-surface-variant font-bold mb-1">
                  ¡Todo al día!
                </p>
                <p className="text-xs text-on-surface-variant/70">
                  No tienes pagos programados próximamente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
