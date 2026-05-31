import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTransactions } from "../../store/slices/transactionsSlice";
import AIChatBuble from "../../components/dashboard/AIChatBubble";
import Button from "../../components/ui/Button";
import {
  IconPlus,
  IconCash,
  IconShoppingCart,
  IconToolsKitchen2,
  IconBulb,
  IconDeviceTv,
} from "@tabler/icons-react";
import ActivityItem from "../../components/dashboard/ActivityItem";
import TransactionCard from "../../components/dashboard/TransactionCard";

export default function Transactions() {
  const { transactions, loading } = useAppSelector(
    (state) => state.transactions,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTransactions({ limit: 20 }));
  }, [dispatch]);

  const formatTxCurrency = (value: number) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(value);

  const getDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  const getMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("es-CR", { month: "short" })
      .replace(".", "")
      .toUpperCase();
  };

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

  return (
    <section className="flex flex-col gap-6 pb-20 pt-4 px-4 sm:px-6">
      <AIChatBuble message="He revisado tus últimos movimientos y próximos compromisos de pago." />
      {/* Contenedor Principal de Transacciones */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Historial Reciente (abajo en móvil, izquierda en desktop) */}
        <div className="flex-1 order-2 md:order-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">
              Historial Reciente
            </h2>
            <Button leftIcon={<IconPlus />}>Añadir Transacción</Button>
          </div>
          <div className="flex flex-col gap-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const isIncome = transaction.type === "income";
                return (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center bg-surface p-3 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group w-full"
                  >
                    {/* Izquierda: Icono y Título */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 bg-surface-variant/40">
                        {isIncome ? (
                          <IconCash
                            size={20}
                            className="text-on-surface-variant"
                          />
                        ) : (
                          getCategoryIcon(transaction.category?.name)
                        )}
                      </div>
                      <div className="leading-tight">
                        <p className="text-[13px] font-bold text-on-surface group-hover:text-primary transition-colors">
                          {transaction.description || "Transacción"}
                        </p>
                      </div>
                    </div>

                    {/* Derecha: Monto (arriba) y Fecha con punto verde (abajo) */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {/* Monto */}
                      <p
                        className={`text-[13px] font-bold tabular-nums ${!isIncome ? "text-error" : "text-[#005226]"}`}
                      >
                        {!isIncome ? "-" : "+"}
                        {formatTxCurrency(transaction.amount)}
                      </p>

                      {/* Fecha y Punto verde */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {formatTxDate(transaction.date)}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#005226]" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 text-center text-on-surface-variant">
                <p className="text-sm">No transactions yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Programados/Futuros (arriba en móvil, derecha en desktop) */}
        <div className="flex-1 order-1 md:order-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 px-1">
            Programados/Futuros
          </h2>
          {/* Listado de Pagos Programados (Mock) */}
          <div className="flex flex-col gap-3">
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const isIncome = transaction.type === "income";
                const prefix = isIncome ? "+" : "-";
                return (
                  <TransactionCard
                    key={transaction.id}
                    icon={getCategoryIcon(transaction.category?.name)}
                    title={transaction.description || "Transacción"}
                    day={getDay(transaction.date)}
                    month={getMonth(transaction.date)}
                    amount={`${prefix}${formatTxCurrency(transaction.amount)}`}
                    isNegative={!isIncome}
                  />
                );
              })
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 text-center text-on-surface-variant">
                <p className="text-sm">No hay pagos programados aun.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
