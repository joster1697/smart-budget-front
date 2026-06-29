import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconPigMoney,
  IconPlus,
  IconClock,
  IconTrash,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconCalendar,
  IconTrendingUp,
  IconAward,
  IconWallet,
  IconX,
  IconInfoCircle,
  IconSparkles,
} from "@tabler/icons-react";
import AIChatBubble from "../../components/dashboard/AIChatBubble";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import savingsService from "../../services/savingsService";
import { SavingsGoal, SavingsSchedule, SavingsProjection } from "../../types/savings";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
  }).format(value);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
} as const;

export default function Savings() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { accounts } = useAppSelector((state) => state.accounts);
  
  // Estados locales
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [schedules, setSchedules] = useState<SavingsSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para la meta seleccionada para proyecciones
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [projection, setProjection] = useState<SavingsProjection | null>(null);
  const [loadingProjection, setLoadingProjection] = useState(false);

  // Modales
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState<"contribute" | "withdraw">("contribute");
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Form de Meta
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [goalAccount, setGoalAccount] = useState("");
  const [goalCategory, setGoalCategory] = useState("Ahorro General");

  // Form de Programación
  const [schGoalId, setSchGoalId] = useState("");
  const [schAccountId, setSchAccountId] = useState("");
  const [schAmount, setSchAmount] = useState("");
  const [schFreq, setSchFreq] = useState<"DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY">("MONTHLY");
  const [schDayOfWeek, setSchDayOfWeek] = useState("1");
  const [schDayOfMonth, setSchDayOfMonth] = useState("1");

  // Form de Transacción Manual (Aporte/Retiro)
  const [txGoalId, setTxGoalId] = useState("");
  const [txAccountId, setTxAccountId] = useState("");
  const [txAmount, setTxAmount] = useState("");

  // Form de Sincronización con Presupuesto
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncGoalId, setSyncGoalId] = useState("");
  const [syncGoalName, setSyncGoalName] = useState("");
  const [syncAmount, setSyncAmount] = useState("");
  const [syncPeriod, setSyncPeriod] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  const getMonthlyQuota = (target: number, current: number, dateStr?: string) => {
    if (!dateStr || target <= current) return 0;
    const targetDate = new Date(dateStr);
    const now = new Date();
    let months = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
    if (months <= 0) {
      months = targetDate > now ? 1 : 0;
    }
    if (months === 0) return 0;
    return (target - current) / months;
  };

  const openSyncBudget = (goal: SavingsGoal) => {
    const quota = getMonthlyQuota(Number(goal.target_amount), Number(goal.current_amount), goal.target_date);
    setSyncGoalId(goal.id);
    setSyncGoalName(goal.name);
    setSyncAmount(quota > 0 ? Math.round(quota).toString() : "");
    setSyncPeriod(new Date().toISOString().substring(0, 7));
    setIsSyncModalOpen(true);
  };

  const handleSyncBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncGoalId || !syncAmount || !syncPeriod) return;

    try {
      setError(null);
      await savingsService.syncBudget(syncGoalId, syncPeriod, Number(syncAmount));
      setIsSyncModalOpen(false);
      alert("¡Cuota de ahorro añadida al presupuesto con éxito!");
      loadData();
    } catch (err: any) {
      setError(err?.message || "Error al sincronizar con el presupuesto");
    }
  };

  // Carga inicial de datos
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Asegurarse de tener cuentas cargadas
      dispatch(fetchAccounts());

      const goalsRes = await savingsService.getGoals();
      const schedulesRes = await savingsService.getSchedules();

      setGoals(goalsRes.goals);
      setSchedules(schedulesRes.schedules);

      if (goalsRes.goals.length > 0) {
        const searchParams = new URLSearchParams(window.location.search);
        const urlId = searchParams.get("id");
        const match = goalsRes.goals.find(g => g.id === urlId);
        if (match) {
          setSelectedGoalId(match.id);
        } else {
          setSelectedGoalId(goalsRes.goals[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Ocurrió un error al cargar los datos de ahorros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("guided") === "true" && !searchParams.get("id")) {
      openCreateGoal();
    }
  }, [location.search]);

  // Carga proyecciones cuando cambia la meta seleccionada
  useEffect(() => {
    const loadProjection = async () => {
      if (!selectedGoalId) {
        setProjection(null);
        return;
      }
      try {
        setLoadingProjection(true);
        const res = await savingsService.getProjections(selectedGoalId);
        setProjection(res.projections);
      } catch (err) {
        console.error("Error al cargar proyecciones", err);
      } finally {
        setLoadingProjection(false);
      }
    };
    loadProjection();
  }, [selectedGoalId, goals]);

  // Manejo de Modales / Editores
  const openCreateGoal = () => {
    setEditingGoal(null);
    setGoalName("");
    setGoalTarget("");
    setGoalDate("");
    setGoalAccount(accounts[0]?.id || "");
    setGoalCategory("Ahorro General");
    setIsGoalModalOpen(true);
  };

  const openEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalTarget(goal.target_amount.toString());
    setGoalDate(goal.target_date ? goal.target_date.split("T")[0] : "");
    setGoalAccount(goal.account_id || "");
    setGoalCategory(goal.category || "Ahorro General");
    setIsGoalModalOpen(true);
  };

  const openSchedule = (goalId?: string) => {
    setSchGoalId(goalId || goals[0]?.id || "");
    setSchAccountId(accounts[0]?.id || "");
    setSchAmount("");
    setSchFreq("MONTHLY");
    setIsScheduleModalOpen(true);
  };

  const openTx = (type: "contribute" | "withdraw", goal: SavingsGoal) => {
    setTxType(type);
    setTxGoalId(goal.id);
    setTxAccountId(goal.account_id || accounts[0]?.id || "");
    setTxAmount("");
    setIsTxModalOpen(true);
  };

  // Enviar formularios
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName) return;

    try {
      setError(null);
      const targetVal = goalTarget ? Number(goalTarget) : 0;
      const payload = {
        name: goalName,
        target_amount: targetVal,
        target_date: goalDate || undefined,
        account_id: goalAccount || undefined,
        category: goalCategory,
      };

      let savedGoal: SavingsGoal;
      if (editingGoal) {
        const response = await savingsService.updateGoal(editingGoal.id, payload);
        savedGoal = response.goal;
      } else {
        const response = await savingsService.createGoal(payload);
        savedGoal = response.goal;
      }

      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get("guided") === "true") {
        // Auto-sync savings goal quota
        const quota = getMonthlyQuota(targetVal, savedGoal ? Number(savedGoal.current_amount) : 0, goalDate);
        const amountToSync = quota > 0 ? Math.round(quota) : 0;
        const periodStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        await savingsService.syncBudget(savedGoal.id, periodStr, amountToSync);
        
        setIsGoalModalOpen(false);
        loadData();
        return;
      }

      setIsGoalModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err?.message || "Error al guardar la meta de ahorro");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta meta? El saldo reservado de la cuenta asociada volverá a estar disponible.")) {
      return;
    }
    try {
      setError(null);
      await savingsService.deleteGoal(id);
      loadData();
    } catch (err: any) {
      setError(err?.message || "Error al eliminar la meta de ahorro");
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schGoalId || !schAccountId || !schAmount) return;

    try {
      setError(null);
      await savingsService.createSchedule({
        savings_goal_id: schGoalId,
        source_account_id: schAccountId,
        amount: Number(schAmount),
        frequency: schFreq,
        day_of_week: schFreq === "WEEKLY" ? Number(schDayOfWeek) : undefined,
        day_of_month: schFreq === "MONTHLY" ? Number(schDayOfMonth) : undefined,
      });
      setIsScheduleModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err?.message || "Error al crear la programación de ahorro");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta regla de ahorro programado?")) {
      return;
    }
    try {
      setError(null);
      await savingsService.deleteSchedule(id);
      loadData();
    } catch (err: any) {
      setError(err?.message || "Error al eliminar la programación");
    }
  };

  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txGoalId || !txAmount) return;

    try {
      setError(null);
      const amount = Number(txAmount);
      if (txType === "contribute") {
        await savingsService.contribute(txGoalId, amount, txAccountId || undefined);
      } else {
        await savingsService.withdraw(txGoalId, amount, txAccountId || undefined);
      }
      setIsTxModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err?.message || "Error al realizar el movimiento de ahorro");
    }
  };

  // Cálculos agregados
  const totalSaved = goals.reduce((acc, g) => acc + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((acc, g) => acc + Number(g.target_amount), 0);
  const aggregateProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  // Sumar ahorro mensual estimado de las reglas activas
  const monthlySavingsEstimate = schedules.reduce((acc, s) => {
    const amount = Number(s.amount);
    if (s.frequency === "DAILY") return acc + amount * 30;
    if (s.frequency === "WEEKLY") return acc + amount * 4.33;
    if (s.frequency === "BIWEEKLY") return acc + amount * 2.16;
    return acc + amount; // MONTHLY
  }, 0);

  const searchParams = new URLSearchParams(location.search);
  const isGuided = searchParams.get("guided") === "true";
  const isWizard = searchParams.get("wizard") === "true";
  const currentStep = searchParams.get("step");

  const handleBackToBudget = () => {
    if (isWizard) {
      navigate(`/dashboard/budget?wizard=true&step=${currentStep || "3"}`);
    } else {
      navigate("/dashboard/budget?editing=true");
    }
  };

  return (
    <section className="flex flex-col gap-6 pb-20 pt-4 px-4 sm:px-6">
      {/* Guided Banner */}
      {isGuided && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#005226]/10 to-[#008f43]/5 border border-[#005226]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#005226]/10 text-[#005226] rounded-xl flex items-center justify-center shrink-0">
              <IconSparkles size={20} className="animate-pulse text-[#008f43]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-on-surface font-manrope">
                Modo Asistido: Metas de Ahorros
              </h3>
              <p className="text-xs text-muted font-medium mt-0.5">
                Para completar la planeación, crea tu meta de ahorro. El agente calculará la cuota mensual sugerida y la sincronizará con tu presupuesto automáticamente.
              </p>
            </div>
          </div>
          <button
            onClick={handleBackToBudget}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/60 text-xs font-bold text-on-surface hover:bg-surface-variant/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
          >
            ← Volver al Presupuesto
          </button>
        </motion.div>
      )}
      {/* Mensaje de error global */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
          <IconInfoCircle className="shrink-0 mt-0.5" size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Header e Introducción */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 14 }}
      >
        <AIChatBubble
          layoutId="savings-header"
          title="Metas de Ahorros e Inteligencia Recurrente"
          message="Configura bolsillos virtuales para resguardar tus ahorros directamente dentro de tus cuentas actuales. Fynkro se encargará de automatizar las reservas y darte proyecciones de libertad financiera."
          actions={
            <div className="flex gap-2">
              <button
                onClick={openCreateGoal}
                className="flex items-center gap-1.5 bg-[#006b3a] hover:bg-[#005a30] active:scale-95 text-white text-[13px] font-bold px-4 py-2.5 rounded-full shadow-sm transition-all duration-200 cursor-pointer"
              >
                <IconPlus size={16} /> Crear Meta
              </button>
              <button
                onClick={() => openSchedule()}
                disabled={goals.length === 0}
                className="flex items-center gap-1.5 bg-[#0a1f12] hover:bg-[#122e1c] disabled:opacity-50 active:scale-95 text-white text-[13px] font-bold px-4 py-2.5 rounded-full shadow-sm border border-[#38e07b]/20 transition-all duration-200 cursor-pointer"
              >
                <IconClock size={16} /> Programar Ahorro
              </button>
            </div>
          }
        />
      </motion.div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006b3a]"></div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* ── SECCIÓN DE TARJETAS DE MÉTRICAS (Bento Grid Header) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              variants={itemVariants}
              className="bg-surface border border-outline-variant/30 rounded-[24px] p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-outline uppercase tracking-widest">
                  Total Ahorrado
                </span>
                <div className="p-2 bg-[#d1efdc] text-[#005226] rounded-xl">
                  <IconPigMoney size={20} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-[#1B252D] tabular-nums">
                  {formatCurrency(totalSaved)}
                </h3>
                <p className="text-xs text-outline/80 mt-1">
                  En {goals.length} bolsillos virtuales activos.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-surface border border-outline-variant/30 rounded-[24px] p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-outline uppercase tracking-widest">
                  Ahorro Mensual Prometido
                </span>
                <div className="p-2 bg-[#dcf2fe] text-[#0070a3] rounded-xl">
                  <IconTrendingUp size={20} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-black text-[#1B252D] tabular-nums">
                  {formatCurrency(monthlySavingsEstimate)}
                </h3>
                <p className="text-xs text-outline/80 mt-1">
                  Acumulando de forma 100% automatizada.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-surface border border-outline-variant/30 rounded-[24px] p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-black text-outline uppercase tracking-widest">
                  Progreso Ponderado Metas
                </span>
                <div className="p-2 bg-[#fef5d1] text-[#785900] rounded-xl">
                  <IconAward size={20} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-2xl font-black text-[#1B252D] tabular-nums">
                    {Math.round(aggregateProgress)}%
                  </span>
                  <span className="text-[10px] text-outline font-bold">
                    Meta: {formatCurrency(totalTarget)}
                  </span>
                </div>
                <div className="w-full h-3 bg-outline-variant/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(aggregateProgress, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* METAS DE AHORRO Y NAVEGACIÓN */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* CUADRÍCULA DE METAS */}
            <div className="xl:col-span-2 flex flex-col gap-4">
              <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest pl-2 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008f43]" />
                <span>Mis Bolsillos de Ahorro ({goals.length})</span>
              </div>

              {goals.length === 0 ? (
                <div className="bg-surface border border-dashed border-outline-variant/50 rounded-[24px] p-12 text-center flex flex-col items-center justify-center">
                  <IconPigMoney size={48} className="text-outline/40 mb-3" />
                  <p className="text-sm font-semibold text-outline">No tienes metas de ahorro todavía.</p>
                  <button
                    onClick={openCreateGoal}
                    className="mt-4 text-xs font-bold text-white bg-[#006b3a] px-5 py-2.5 rounded-full hover:bg-[#005a30] transition-colors cursor-pointer"
                  >
                    Crear mi primer bolsillo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((goal) => {
                    const progress = (goal.current_amount / goal.target_amount) * 100;
                    const isSelected = selectedGoalId === goal.id;
                    
                    return (
                      <motion.div
                        key={goal.id}
                        variants={itemVariants}
                        onClick={() => setSelectedGoalId(goal.id)}
                        className={`bg-surface border rounded-[24px] p-5 shadow-sm relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between h-[255px] ${
                          isSelected
                            ? "border-[#008f43] ring-1 ring-[#008f43]/40"
                            : "border-outline-variant/30 hover:border-[#008f43]/50"
                        }`}
                      >
                        {/* Indicador de seleccionado */}
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-8 h-8 bg-[#008f43]/10 rounded-bl-3xl flex items-center justify-center text-[#008f43]">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#008f43]" />
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between items-start pr-4">
                            <div>
                              <span className="text-[9px] font-bold text-white bg-teal-600/80 px-2.5 py-0.5 rounded-full uppercase">
                                {goal.category || "General"}
                              </span>
                              <h4 className="text-lg font-black text-[#1B252D] mt-2 truncate">
                                {goal.name}
                              </h4>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex justify-between text-xs font-bold text-outline/80 mb-1.5">
                              <span className="text-[#008f43]">{Math.round(progress)}% completado</span>
                              <span className="tabular-nums">
                                {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-outline-variant/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            {goal.target_date && (
                              <div className="text-[10px] text-outline mt-2.5 font-semibold flex justify-between items-center">
                                <span>Límite: {goal.target_date.split("T")[0]}</span>
                                {Number(goal.target_amount) > Number(goal.current_amount) && (
                                  <span className="text-[#006b3a] font-bold bg-[#d1efdc]/60 px-2.5 py-0.5 rounded-full select-none" title="Cuota de ahorro mensual sugerida">
                                    {formatCurrency(getMonthlyQuota(Number(goal.target_amount), Number(goal.current_amount), goal.target_date))}/mes
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Cuenta Vinculada y Botones de Acción */}
                        <div className="mt-auto pt-3 border-t border-outline-variant/20 flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs text-outline/70 min-w-0">
                            <IconWallet size={14} className="shrink-0" />
                            <span className="truncate">
                              {goal.account?.name || "Bolsillo Virtual"}
                            </span>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openTx("contribute", goal);
                              }}
                              className="p-1.5 bg-[#006b3a]/10 hover:bg-[#006b3a]/20 text-[#006b3a] rounded-lg transition-colors cursor-pointer"
                              title="Aportar dinero"
                            >
                              <IconArrowUpRight size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openTx("withdraw", goal);
                              }}
                              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 rounded-lg transition-colors cursor-pointer"
                              title="Retirar dinero"
                            >
                              <IconArrowDownLeft size={16} />
                            </button>
                            {Number(goal.target_amount) > Number(goal.current_amount) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSyncBudget(goal);
                                }}
                                className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 rounded-lg transition-colors cursor-pointer"
                                title="Añadir esta cuota al presupuesto mensual"
                              >
                                <IconCalendar size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditGoal(goal);
                              }}
                              className="p-1.5 bg-outline-variant/30 hover:bg-outline-variant/50 text-[#1B252D] rounded-lg transition-colors cursor-pointer text-xs font-bold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGoal(goal.id);
                              }}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar meta"
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECCIÓN DE AUTOMATIZACIONES (Columna Derecha) */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center text-[10px] sm:text-xs text-outline font-black uppercase tracking-widest select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Ahorros Automatizados ({schedules.length})</span>
                </div>
                {goals.length > 0 && (
                  <button
                    onClick={() => openSchedule()}
                    className="text-[10px] font-extrabold uppercase text-[#006b3a] hover:text-[#005a30] transition-colors"
                  >
                    + Nuevo Ahorro
                  </button>
                )}
              </div>

              <div className="bg-surface border border-outline-variant/30 rounded-[24px] p-5 shadow-sm flex flex-col gap-3">
                {schedules.length === 0 ? (
                  <div className="text-center py-8 text-xs text-outline">
                    No tienes programaciones activas.<br />
                    Automatiza tus ahorros con el botón de arriba.
                  </div>
                ) : (
                  schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex justify-between items-center p-3 border border-outline-variant/20 hover:border-[#008f43]/30 rounded-xl transition-all"
                    >
                      <div className="min-w-0">
                        <h5 className="text-xs font-black text-[#1B252D] truncate">
                          {schedule.goal?.name || "Bolsillo"}
                        </h5>
                        <p className="text-[10px] text-outline/80 mt-0.5">
                          Desde: {schedule.sourceAccount?.name || "Cuenta origen"}
                        </p>
                        <div className="flex gap-1 items-center text-[9px] text-blue-600 font-bold uppercase tracking-wider mt-1">
                          <IconCalendar size={10} />
                          <span>
                            {schedule.frequency} • Próx: {schedule.next_run_date ? schedule.next_run_date.split("T")[0] : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black text-[#008f43] tabular-nums">
                          {formatCurrency(Number(schedule.amount))}
                        </span>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors cursor-pointer"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* GRÁFICO DE PROYECCIONES */}
          {selectedGoalId && projection && (
            <motion.div
              variants={itemVariants}
              className="bg-surface border border-outline-variant/30 rounded-[24px] p-6 shadow-sm mt-2"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h4 className="text-lg font-black text-[#1B252D]">
                    Proyección de Ahorro: {projection.goal_name}
                  </h4>
                  <p className="text-xs text-outline/80 mt-1">
                    Crecimiento proyectado a 36 meses basándose en tus programaciones.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-outline-variant/10 px-4 py-2.5 rounded-2xl text-xs shrink-0">
                  <div>
                    <span className="block text-[9px] font-black text-outline uppercase">Ahorro Mensual</span>
                    <span className="font-extrabold text-[#008f43]">
                      {formatCurrency(projection.monthly_saving_rate)}/mes
                    </span>
                  </div>
                  <div className="border-l border-outline-variant/30 pl-4">
                    <span className="block text-[9px] font-black text-outline uppercase">Meta Estimada</span>
                    <span className="font-extrabold text-[#1B252D]">
                      {projection.estimated_completion_date || "Meta no alcanzable con ahorro actual"}
                    </span>
                  </div>
                </div>
              </div>

              {loadingProjection ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#006b3a]"></div>
                </div>
              ) : projection.projection_points && projection.projection_points.length > 1 ? (
                <div className="h-64 w-full relative">
                  {/* Gráfico SVG Personalizado Premium */}
                  <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38e07b" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#38e07b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="5%" y1="10" x2="95%" y2="10" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="5%" y1="65" x2="95%" y2="65" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="5%" y1="120" x2="95%" y2="120" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="5%" y1="175" x2="95%" y2="175" stroke="#E2E8F0" strokeWidth="0.5" />

                    {(() => {
                      const points = projection.projection_points;
                      const maxVal = projection.target_amount;
                      
                      // Convertir puntos a coordenadas SVG
                      const svgPoints = points.map((p, idx) => {
                        const x = 5 + (idx / (points.length - 1)) * 90; // 5% a 95%
                        const y = 175 - (p.projected_amount / maxVal) * 155; // max height 165
                        return { x: `${x}%`, y, rawX: x, rawY: y, label: p.date, amount: p.projected_amount };
                      });

                      const pathD = `M ${svgPoints[0].x} ${svgPoints[0].y} ` + 
                                    svgPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
                      
                      const areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} 175 L ${svgPoints[0].x} 175 Z`;

                      return (
                        <>
                          {/* Área degradada */}
                          <path d={areaD} fill="url(#areaGradient)" />

                          {/* Línea principal */}
                          <path d={pathD} fill="none" stroke="#008f43" strokeWidth="2.5" strokeLinecap="round" />

                          {/* Puntos en la curva */}
                          {svgPoints.filter((_, i) => i === 0 || i === svgPoints.length - 1 || i % Math.max(1, Math.round(svgPoints.length / 5)) === 0).map((p, idx) => (
                            <g key={idx}>
                              <circle cx={p.x} cy={p.y} r="4" fill="#008f43" stroke="#FFF" strokeWidth="1.5" />
                              <text
                                x={p.x}
                                y={p.y - 10}
                                textAnchor="middle"
                                fill="#1B252D"
                                className="text-[8px] font-bold"
                              >
                                {formatCurrency(p.amount)}
                              </text>
                              <text
                                x={p.x}
                                y="195"
                                textAnchor="middle"
                                fill="#A0AEC0"
                                className="text-[8px] font-bold"
                              >
                                {p.label.substring(5, 10)}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-outline">
                  No hay suficientes datos de proyección. Agrega programaciones de ahorro para calcular tu crecimiento futuro.
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* ── MODAL DE META (Crear / Editar) ── */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface max-w-md w-full rounded-[28px] border border-outline-variant/30 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="absolute top-4 right-4 text-outline hover:text-[#1B252D] p-1.5 hover:bg-outline-variant/10 rounded-full cursor-pointer"
              >
                <IconX size={20} />
              </button>

              <h3 className="text-lg font-black text-[#1B252D] mb-4">
                {editingGoal ? "Editar Meta de Ahorro" : "Nueva Meta de Ahorro"}
              </h3>

              <form onSubmit={handleSaveGoal} className="flex flex-col gap-4 text-sm">
                <div>
                  <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                    Nombre del objetivo
                  </label>
                  <input
                    type="text"
                    required
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="Ej. Fondo de Emergencia, Vacaciones..."
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none placeholder:text-outline/50 focus:border-[#006b3a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                    Monto Objetivo (CRC)
                  </label>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="Monto a alcanzar (Opcional)"
                    className="w-full bg-surface border border-[#E2E8F0] dark:border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none placeholder:text-outline/50 focus:border-[#006b3a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                      Fecha Límite
                    </label>
                    <input
                      type="date"
                      value={goalDate}
                      onChange={(e) => setGoalDate(e.target.value)}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                      Categoría
                    </label>
                    <select
                      value={goalCategory}
                      onChange={(e) => setGoalCategory(e.target.value)}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                    >
                      <option value="Ahorro General">Ahorro General</option>
                      <option value="Emergencia">Fondo de Emergencia</option>
                      <option value="Viajes">Viajes</option>
                      <option value="Vehículo">Vehículo</option>
                      <option value="Vivienda">Vivienda</option>
                      <option value="Educación">Educación</option>
                    </select>
                  </div>
                </div>

                {goalTarget && goalDate && (
                  <div className="bg-[#d1efdc]/40 border border-[#008f43]/20 rounded-xl p-3 text-xs text-[#005226] font-medium mt-1 select-none">
                    📊 <strong>Cuota sugerida:</strong> Para cumplir tu meta a tiempo, necesitas ahorrar <strong>{formatCurrency(getMonthlyQuota(Number(goalTarget), editingGoal ? Number(editingGoal.current_amount) : 0, goalDate))}</strong> al mes.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                    Cuenta Vinculada (Bolsillo Virtual)
                  </label>
                  <select
                    value={goalAccount}
                    onChange={(e) => setGoalAccount(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                  >
                    <option value="">Ninguna (Ahorro Virtual Simple)</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-outline mt-1">
                    Al asociar una cuenta, los depósitos a esta meta se bloquearán del saldo disponible de dicha cuenta.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#006b3a] hover:bg-[#005a30] text-white py-3 rounded-xl font-bold transition-all shadow-md mt-2 cursor-pointer"
                >
                  {editingGoal ? "Guardar Cambios" : "Crear Meta"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL DE PROGRAMACIÓN RECURRENTE ── */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface max-w-md w-full rounded-[28px] border border-outline-variant/30 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="absolute top-4 right-4 text-outline hover:text-[#1B252D] p-1.5 hover:bg-outline-variant/10 rounded-full cursor-pointer"
              >
                <IconX size={20} />
              </button>

              <h3 className="text-lg font-black text-[#1B252D] mb-4">
                Programar Ahorro Automático
              </h3>

              <form onSubmit={handleCreateSchedule} className="flex flex-col gap-4 text-sm">
                <div>
                  <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                    Meta de Ahorro Destino
                  </label>
                  <select
                    required
                    value={schGoalId}
                    onChange={(e) => setSchGoalId(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                  >
                    {goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.name} (Meta: {formatCurrency(goal.target_amount)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                    Cuenta Origen
                  </label>
                  <select
                    required
                    value={schAccountId}
                    onChange={(e) => setSchAccountId(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                      Monto a transferir
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={schAmount}
                      onChange={(e) => setSchAmount(e.target.value)}
                      placeholder="Monto por periodo"
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none placeholder:text-outline/50 focus:border-[#006b3a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                      Frecuencia
                    </label>
                    <select
                      value={schFreq}
                      onChange={(e) => setSchFreq(e.target.value as any)}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                    >
                      <option value="DAILY">Diario</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="BIWEEKLY">Quincenal</option>
                      <option value="MONTHLY">Mensual</option>
                    </select>
                  </div>
                </div>

                {schFreq === "WEEKLY" && (
                  <div>
                    <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                      Día de la semana
                    </label>
                    <select
                      value={schDayOfWeek}
                      onChange={(e) => setSchDayOfWeek(e.target.value)}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                    >
                      <option value="1">Lunes</option>
                      <option value="2">Martes</option>
                      <option value="3">Miércoles</option>
                      <option value="4">Jueves</option>
                      <option value="5">Viernes</option>
                      <option value="6">Sábado</option>
                      <option value="7">Domingo</option>
                    </select>
                  </div>
                )}

                {schFreq === "MONTHLY" && (
                  <div>
                    <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                      Día del mes (1 - 28)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="28"
                      value={schDayOfMonth}
                      onChange={(e) => setSchDayOfMonth(e.target.value)}
                      className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-md mt-2 cursor-pointer"
                >
                  Programar Transferencias
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL DE TRANSACCIÓN MANUAL (Aporte / Retiro) ── */}
      <AnimatePresence>
        {isTxModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface max-w-md w-full rounded-[28px] border border-outline-variant/30 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="absolute top-4 right-4 text-outline hover:text-[#1B252D] p-1.5 hover:bg-outline-variant/10 rounded-full cursor-pointer"
              >
                <IconX size={20} />
              </button>

              <h3 className="text-lg font-black text-[#1B252D] mb-4">
                {txType === "contribute" ? "Aportar a Meta" : "Retirar de Meta"}
              </h3>

              <form onSubmit={handleTxSubmit} className="flex flex-col gap-4 text-sm">
                <div>
                  <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                    Cuenta Origen/Destino
                  </label>
                  <select
                    required
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                    Monto (CRC)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Ingresa el monto"
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none placeholder:text-outline/50 focus:border-[#006b3a]"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full text-white py-3 rounded-xl font-bold transition-all shadow-md mt-2 cursor-pointer ${
                    txType === "contribute" ? "bg-[#006b3a] hover:bg-[#005a30]" : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {txType === "contribute" ? "Confirmar Aporte" : "Confirmar Retiro"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL DE SINCRONIZACIÓN CON PRESUPUESTO ── */}
      <AnimatePresence>
        {isSyncModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface max-w-md w-full rounded-[28px] border border-outline-variant/30 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="absolute top-4 right-4 text-outline hover:text-[#1B252D] p-1.5 hover:bg-outline-variant/10 rounded-full cursor-pointer"
              >
                <IconX size={20} />
              </button>

              <h3 className="text-lg font-black text-[#1B252D] mb-2">
                Añadir al Presupuesto Mensual
              </h3>
              <p className="text-xs text-outline mb-4 font-medium">
                Asigna la cuota mensual de ahorro de la meta <strong>{syncGoalName}</strong> como una salida planificada en tu presupuesto.
              </p>

              <form onSubmit={handleSyncBudgetSubmit} className="flex flex-col gap-4 text-sm">
                <div>
                  <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                    Periodo del Presupuesto (Mes)
                  </label>
                  <input
                    type="month"
                    required
                    value={syncPeriod}
                    onChange={(e) => setSyncPeriod(e.target.value)}
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none focus:border-[#006b3a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-outline uppercase tracking-wider mb-1">
                    Monto Mensual a Presupuestar (CRC)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={syncAmount}
                    onChange={(e) => setSyncAmount(e.target.value)}
                    placeholder="Monto a destinar este mes"
                    className="w-full bg-surface border border-outline-variant/40 rounded-xl py-2.5 px-4 outline-none placeholder:text-outline/50 focus:border-[#006b3a]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#006b3a] hover:bg-[#005a30] text-white py-3 rounded-xl font-bold transition-all shadow-md mt-2 cursor-pointer"
                >
                  Confirmar y Sincronizar
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
