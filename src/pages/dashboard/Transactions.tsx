import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../../store/slices/transactionsSlice";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import { categoryService } from "../../services/categoryService";
import AIChatBuble from "../../components/dashboard/AIChatBubble";
import Button from "../../components/ui/Button";
import {
  IconPlus,
  IconCash,
  IconShoppingCart,
  IconToolsKitchen2,
  IconBulb,
  IconDeviceTv,
  IconPencil,
  IconTrash,
  IconDotsVertical,
} from "@tabler/icons-react";
import ActivityItem from "../../components/dashboard/ActivityItem";
import TransactionCard from "../../components/dashboard/TransactionCard";
import { formatDueDate } from "./Home";

export default function Transactions() {
  const { transactions, loading } = useAppSelector(
    (state) => state.transactions,
  );
  const dispatch = useAppDispatch();

  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense" | "transfer">(
    "expense",
  );
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState<
    string | null
  >(null);

  // Dropdown state for transaction row actions
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any | null>(
    null,
  );
  const INITIAL_LIMIT = 5;
  const accounts = useAppSelector((state) => state.accounts.accounts);
  const [limit, setLimit] = useState(INITIAL_LIMIT);

  useEffect(() => {
    dispatch(fetchTransactions({ limit }));
  }, [dispatch, limit]);

  useEffect(() => {
    if (isModalOpen) {
      // Cargar categorías y cuentas (esto se queda igual)
      categoryService
        .getCategories()
        .then((res) => {
          setCategories(res.categories || []);
        })
        .catch((err) => console.error("Error fetching categories:", err));

      if (accounts.length === 0) {
        dispatch(fetchAccounts());
      }

      // VALIDACIÓN: ¿Estamos editando o creando una nueva?
      if (editingTransaction) {
        // Rellenamos el formulario con los datos de la transacción a editar
        setDescription(editingTransaction.description);
        setAmount(editingTransaction.amount.toString());
        setType(editingTransaction.type);

        // Ajustamos la fecha para que el input local datetime lo entienda bien
        const localDate = new Date(editingTransaction.date);
        localDate.setMinutes(
          localDate.getMinutes() - localDate.getTimezoneOffset(),
        );
        setDate(localDate.toISOString().slice(0, 16));

        setCategoryId(editingTransaction.category?.id || "");
        setAccountId(editingTransaction.account?.id || "");
      } else {
        // Creación normal: Limpiamos todos los campos del formulario
        setDescription("");
        setAmount("");
        setType("expense");
        const localNow = new Date();
        localNow.setMinutes(
          localNow.getMinutes() - localNow.getTimezoneOffset(),
        );
        setDate(localNow.toISOString().slice(0, 16));
        setCategoryId("");
        setAccountId("");
      }
    } else {
      // Si el modal se cierra, reseteamos la transacción en edición
      setEditingTransaction(null);
    }
  }, [isModalOpen, editingTransaction, accounts.length, dispatch]); // <-- Asegúrate de incluir 'editingTransaction' aquí

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !accountId) {
      alert("Por favor, completa los campos requeridos.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingTransaction) {
        // Modo Edición: Actualizar
        await dispatch(
          updateTransaction({
            id: editingTransaction.id,
            data: {
              description,
              amount: parseFloat(amount),
              type,
              date: new Date(date).toISOString(),
              category_id: categoryId || undefined,
              account_id: accountId,
            },
          }),
        ).unwrap();
      } else {
        // Modo Creación: Crear
        await dispatch(
          createTransaction({
            description,
            amount: parseFloat(amount),
            type,
            date: new Date(date).toISOString(),
            category_id: categoryId || undefined,
            account_id: accountId,
          }),
        ).unwrap();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Hubo un error al guardar la transacción.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const handleEditClick = (transaction: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransactionToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDeleteId) return;
    setSubmitting(true);
    try {
      await dispatch(deleteTransaction(transactionToDeleteId)).unwrap();
      setIsDeleteModalOpen(false);
      setTransactionToDeleteId(null);
    } catch (error) {
      console.error("Error al eliminar la transacción:", error);
      alert("Hubo un error al eliminar la transacción.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (transactions.length >= limit) {
      setLimit((prev) => prev + 10);
    } else {
      setLimit(INITIAL_LIMIT);
    }
  };
  ``;

  return (
    <section className="flex flex-col gap-6 pb-20 pt-4 px-4 sm:px-6">
      {activeDropdownId && (
        <div
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => setActiveDropdownId(null)}
        />
      )}
      <AIChatBuble message="He revisado tus últimos movimientos y próximos compromisos de pago." />
      {/* Contenedor Principal de Transacciones */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Historial Reciente (abajo en móvil, izquierda en desktop) */}
        <div className="flex-1 order-2 md:order-1">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">
              Historial Reciente
            </h2>
            <Button
              leftIcon={<IconPlus />}
              onClick={() => setIsModalOpen(true)}
            >
              Añadir Transacción
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const isIncome = transaction.type === "income";
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group w-full"
                  >
                    {/* Izquierda: Icono y Título */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
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
                      <div className="leading-tight truncate">
                        <p className="text-[13px] font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                          {transaction.description || "Transacción"}
                        </p>
                      </div>
                    </div>

                    {/* Centro-Derecha: Monto (arriba) y Fecha con punto verde (abajo) */}
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

                    {/* Extremo Derecho: Botón de 3 puntos y Menú Desplegable */}
                    <div
                      className={`relative flex items-center justify-center shrink-0 transition-opacity duration-200 md:opacity-100`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(
                            activeDropdownId === transaction.id
                              ? null
                              : transaction.id,
                          );
                        }}
                        className={`p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant/40 transition-colors cursor-pointer ${
                          activeDropdownId === transaction.id
                            ? "text-primary bg-surface-variant/40"
                            : ""
                        }`}
                        title="Acciones"
                      >
                        <IconDotsVertical size={16} />
                      </button>

                      {activeDropdownId === transaction.id && (
                        <div className="absolute right-0 top-full mt-1 z-30 w-32 bg-white border border-outline-variant/20 rounded-xl shadow-xl py-1 flex flex-col">
                          <button
                            onClick={(e) => {
                              setActiveDropdownId(null);
                              handleEditClick(transaction, e);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-black hover:bg-gray-100 transition-colors w-full text-left cursor-pointer"
                          >
                            <IconPencil size={14} className="text-gray-500" />
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              setActiveDropdownId(null);
                              handleDeleteClick(transaction.id, e);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors w-full text-left border-t border-outline-variant/10 cursor-pointer"
                          >
                            <IconTrash size={14} className="text-red-600" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 text-center text-on-surface-variant">
                <p className="text-sm">No transactions yet.</p>
              </div>
            )}
            {/*Boton Show More/Less*/}
            {(transactions.length === limit || limit > INITIAL_LIMIT) && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  loading={loading}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  {transactions.length >= limit ? "Show More" : "Show Less"}
                </Button>
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
                    subtitle={formatDueDate(transaction.date)}
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

      {/* Modal para Añadir Transacción */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 mx-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <h3 className="text-lg font-bold text-[#1B252D]">
                Nueva Transacción
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-black text-xl cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Descripción */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600">
                  Descripción *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. Compra de supermercado"
                  className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all text-sm"
                />
              </div>

              {/* Tipo de Transacción */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600">
                  Tipo de movimiento
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all text-sm"
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>

              {/* Monto */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all text-sm"
                />
              </div>

              {/* Fecha */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600">
                  Fecha y Hora (Formato 24hrs) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all text-sm"
                />
              </div>

              {/* Cuenta */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600">
                  Cuenta *
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all text-sm"
                >
                  <option value="" disabled>
                    Selecciona una cuenta
                  </option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (
                      {new Intl.NumberFormat("es-CR", {
                        style: "currency",
                        currency: "CRC",
                      }).format(acc.balance)}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all text-sm"
                >
                  <option value="">Ninguna</option>
                  {categories
                    .filter((cat) => {
                      if (type === "expense") return cat.type === "EXPENSE";
                      if (type === "income") return cat.type === "INCOME";
                      return true;
                    })
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#006b3a] hover:bg-[#005a30] disabled:bg-gray-400 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center min-w-[100px]"
                >
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center gap-4 mx-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <IconTrash size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-gray-950">
                Confirmar eliminación
              </h3>
              <p className="text-sm text-gray-500">
                ¿Estás seguro de que deseas eliminar esta transacción? Esta
                acción no se puede deshacer.
              </p>
            </div>
            <div className="flex w-full gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTransactionToDeleteId(null);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                {submitting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
