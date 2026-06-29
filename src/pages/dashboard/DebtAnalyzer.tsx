import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUpload,
  IconPlus,
  IconTrash,
  IconAlertCircle,
  IconTrendingDown,
  IconHourglass,
  IconShieldLock,
  IconX,
  IconFileSpreadsheet,
  IconCoins,
  IconCheck,
  IconSparkles
} from "@tabler/icons-react";
import debtService, {
  Debt,
  AmortizationPeriod,
  SimulationResult,
  ValidateDebtPayload
} from "../../services/debtService";

export default function DebtAnalyzer() {
  const navigate = useNavigate();
  const location = useLocation();

  // Page States
  const [debts, setDebts] = useState<Debt[]>([]);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [selectedDebtDetails, setSelectedDebtDetails] = useState<{
    debt: Debt;
    schedule: AmortizationPeriod[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // OCR/Upload States
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
  
  // Manual Entry States
  const [showManualForm, setShowManualForm] = useState<boolean>(false);
  
  // Simulation States
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [extraPaymentType, setExtraPaymentType] = useState<"monthly" | "one_time">("monthly");
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  // Budget Sync States
  const [plannedExtraPayment, setPlannedExtraPayment] = useState<number>(0);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [syncSuccessAmount, setSyncSuccessAmount] = useState<number>(0);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  
  // Form State (shared between manual entry and OCR validation)
  const [debtType, setDebtType] = useState<"standard" | "simple">("standard");
  const [formFields, setFormFields] = useState<ValidateDebtPayload>({
    name: "",
    currency: "CRC",
    balance: 0,
    interest_rate: 0,
    total_installment: 0,
    insurance_cost: 0,
    other_fees: 0,
    remaining_terms: 0,
    operation_number: "",
    temp_file_id: undefined
  });

  const handleFormFieldChange = (field: keyof ValidateDebtPayload, value: any) => {
    setFormFields(prev => {
      const updated = { ...prev, [field]: value };
      if (debtType === "simple") {
        if (field === "balance" || field === "remaining_terms") {
          const bal = field === "balance" ? Number(value) : Number(prev.balance);
          const terms = field === "remaining_terms" ? Number(value) : Number(prev.remaining_terms);
          if (terms > 0) {
            updated.total_installment = Number((bal / terms).toFixed(2));
          }
        }
      }
      return updated;
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch debts on mount
  useEffect(() => {
    loadDebts();
    
    // Auto-open manual form if guided mode is active and no specific id is specified
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("guided") === "true" && !searchParams.get("id")) {
      openManualForm();
    }
  }, []);

  const loadDebts = async () => {
    setLoading(true);
    try {
      const response = await debtService.getDebts();
      setDebts(response.debts);
      if (response.debts.length > 0) {
        const searchParams = new URLSearchParams(window.location.search);
        const urlId = searchParams.get("id");
        const match = response.debts.find(d => d.id === urlId);
        if (match) {
          handleSelectDebt(match.id);
        } else {
          // Select the first debt by default
          handleSelectDebt(response.debts[0].id);
        }
      } else {
        setSelectedDebtId(null);
        setSelectedDebtDetails(null);
      }
    } catch (err) {
      console.error("Error loading debts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDebt = async (id: string) => {
    setSelectedDebtId(id);
    try {
      const response = await debtService.getDebtById(id);
      setSelectedDebtDetails({
        debt: response.debt,
        schedule: response.schedule
      });
      // Load sync states from loaded debt details
      setPlannedExtraPayment(response.debt.planned_extra_payment || 0);
      setSyncSuccess(false);
      setSyncWarning(null);

      // Reset simulation state
      setExtraPayment(0);
      setExtraPaymentType("monthly");
      setSimulation(null);
    } catch (err) {
      console.error("Error fetching debt details:", err);
    }
  };

  const handleSyncBudget = async (enableSync: boolean) => {
    if (!selectedDebtId) return;
    setSyncLoading(true);
    setSyncSuccess(false);
    setSyncWarning(null);
    try {
      const response = await debtService.syncBudget(
        selectedDebtId,
        enableSync,
        enableSync ? plannedExtraPayment : 0
      );
      setSyncSuccess(true);
      setSyncWarning(response.warning || null);
      setSyncSuccessAmount(enableSync ? ((response.debt.total_installment || 0) + (response.debt.planned_extra_payment || 0)) : 0);
      
      // Update local details
      if (selectedDebtDetails) {
        setSelectedDebtDetails({
          ...selectedDebtDetails,
          debt: {
            ...selectedDebtDetails.debt,
            sync_budget: response.debt.sync_budget,
            planned_extra_payment: response.debt.planned_extra_payment
          }
        });
      }
      
      // Reload left menu cards list
      const updatedResponse = await debtService.getDebts();
      setDebts(updatedResponse.debts);
    } catch (err) {
      console.error("Budget sync failed:", err);
      alert("Error al sincronizar con el presupuesto. Inténtalo de nuevo.");
    } finally {
      setSyncLoading(false);
    }
  };

  // Run simulation whenever extra payments change
  useEffect(() => {
    if (!selectedDebtId || extraPayment <= 0) {
      setSimulation(null);
      return;
    }

    const runSimulation = async () => {
      setSimLoading(true);
      try {
        const response = await debtService.simulateSavings(
          selectedDebtId,
          extraPayment,
          extraPaymentType
        );
        setSimulation(response.simulation);
      } catch (err) {
        console.error("Simulation failed:", err);
      } finally {
        setSimLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      runSimulation();
    }, 400); // Debounce API calls

    return () => clearTimeout(delayDebounce);
  }, [extraPayment, extraPaymentType, selectedDebtId]);

  // Handle PDF Upload
  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("El archivo debe ser un PDF.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await debtService.extractDebt(file);
      const data = result.data;
      
      setFormFields({
        name: data.name || "Nuevo Crédito",
        currency: data.currency || "CRC",
        balance: data.balance || 0,
        interest_rate: data.interest_rate || 0,
        total_installment: data.total_installment || 0,
        insurance_cost: data.insurance_cost || 0,
        other_fees: data.other_fees || 0,
        remaining_terms: data.remaining_terms || 0,
        operation_number: data.operation_number || "",
        temp_file_id: result.temp_file_id
      });
      
      setShowValidationModal(true);
      setShowManualForm(false);
    } catch (err: any) {
      setUploadError(err.message || "Error al procesar el archivo. Revisa que sea un PDF válido.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Handle Form Submission
  const handleSaveDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await debtService.validateDebt(formFields);
      setShowValidationModal(false);
      setShowManualForm(false);

      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get("guided") === "true") {
        // Auto-sync the new debt with 0 planned extra payment initially
        await debtService.syncBudget(response.debt.id, true, 0);
        // Reload debts list and select the new debt so they can analyze it
        const updatedResponse = await debtService.getDebts();
        setDebts(updatedResponse.debts);
        handleSelectDebt(response.debt.id);
        return;
      }
      
      // Reload debts list
      const updatedResponse = await debtService.getDebts();
      setDebts(updatedResponse.debts);
      handleSelectDebt(response.debt.id);
    } catch (err: any) {
      alert(`Error al guardar: ${err.message || "Inténtalo de nuevo."}`);
    }
  };

  // Handle Manual Form Toggle
  const openManualForm = () => {
    setDebtType("standard");
    setFormFields({
      name: "",
      currency: "CRC",
      balance: 0,
      interest_rate: 0,
      total_installment: 0,
      insurance_cost: 0,
      other_fees: 0,
      remaining_terms: 0,
      operation_number: "",
      temp_file_id: undefined
    });
    setShowManualForm(true);
  };

  // Delete Debt
  const handleDeleteDebt = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta deuda? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      await debtService.deleteDebt(id);
      loadDebts();
    } catch (err) {
      console.error("Error deleting debt:", err);
    }
  };

  // Format currencies appropriately
  const formatValue = (value: number, currency: "CRC" | "USD") => {
    return new Intl.NumberFormat(currency === "CRC" ? "es-CR" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  // Calculate Cuota breakdown details
  const getBreakdownDetails = (debt: Debt) => {
    const monthlyRate = debt.interest_rate / 12 / 100;
    const interest = debt.balance * monthlyRate;
    const insurance = debt.insurance_cost;
    const fees = debt.other_fees;
    
    // Capital is whatever remains of the total monthly payment
    let capital = debt.total_installment - interest - insurance - fees;
    if (capital < 0) capital = 0;

    const total = interest + insurance + fees + capital;

    return {
      capital: Math.round(capital),
      interest: Math.round(interest),
      insuranceAndFees: Math.round(insurance + fees),
      total: total > 0 ? total : 1
    };
  };

  const getFreedomDates = (remainingMonths: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + remainingMonths);
    return date.toLocaleDateString("es-CR", { month: "long", year: "numeric" });
  };

  // Render SVG Donut Chart
  const renderDonutChart = (debt: Debt) => {
    const breakdown = getBreakdownDetails(debt);
    const capPct = (breakdown.capital / breakdown.total) * 100;
    const intPct = (breakdown.interest / breakdown.total) * 100;
    const insPct = (breakdown.insuranceAndFees / breakdown.total) * 100;

    const r = 40;
    const circ = 2 * Math.PI * r; // 251.327

    // Cumulative dash offsets
    const capOffset = 0;
    const intOffset = -circ * (capPct / 100);
    const insOffset = -circ * ((capPct + intPct) / 100);

    return (
      <div className="flex flex-col md:flex-row items-center gap-8 bg-surface rounded-2xl p-6 border border-outline-variant/30">
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              cx="50"
              cy="50"
              r={r}
              className="stroke-surface-variant fill-none"
              strokeWidth="10"
            />
            {/* Capital slice (Green) */}
            {capPct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                className="stroke-primary fill-none transition-all duration-500 ease-out"
                strokeWidth="10"
                strokeDasharray={`${circ * (capPct / 100)} ${circ}`}
                strokeDashoffset={capOffset}
                strokeLinecap="round"
              />
            )}
            {/* Interest slice (Orange) */}
            {intPct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                className="stroke-warning fill-none transition-all duration-500 ease-out"
                style={{ stroke: "#ffb74d" }}
                strokeWidth="10"
                strokeDasharray={`${circ * (intPct / 100)} ${circ}`}
                strokeDashoffset={intOffset}
                strokeLinecap="round"
              />
            )}
            {/* Insurances/Fees slice (Blue) */}
            {insPct > 0 && (
              <circle
                cx="50"
                cy="50"
                r={r}
                className="stroke-info fill-none transition-all duration-500 ease-out"
                style={{ stroke: "#42a5f5" }}
                strokeWidth="10"
                strokeDasharray={`${circ * (insPct / 100)} ${circ}`}
                strokeDashoffset={insOffset}
                strokeLinecap="round"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Cuota Total</span>
            <span className="text-base font-black text-on-surface leading-tight font-manrope">
              {formatValue(debt.total_installment, debt.currency)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h4 className="text-xs font-bold text-on-surface mb-2 uppercase tracking-wide">Distribución de la Cuota</h4>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-on-surface">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Amortización a Capital</span>
                </div>
                <div className="text-right">
                  <span className="font-black block">{formatValue(breakdown.capital, debt.currency)}</span>
                  <span className="text-[10px] font-bold text-muted">{capPct.toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-on-surface">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ffb74d" }} />
                  <span>Intereses Puros</span>
                </div>
                <div className="text-right">
                  <span className="font-black block" style={{ color: "#e68a00" }}>{formatValue(breakdown.interest, debt.currency)}</span>
                  <span className="text-[10px] font-bold text-muted">{intPct.toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-on-surface">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#42a5f5" }} />
                  <span>Seguros y Comisiones</span>
                </div>
                <div className="text-right">
                  <span className="font-black block" style={{ color: "#1e88e5" }}>{formatValue(breakdown.insuranceAndFees, debt.currency)}</span>
                  <span className="text-[10px] font-bold text-muted">{insPct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Generate actionable Insights cards
  const renderInsights = (debt: Debt) => {
    const breakdown = getBreakdownDetails(debt);
    const insPct = (breakdown.insuranceAndFees / breakdown.total) * 100;
    const insights = [];

    if (insPct > 15) {
      insights.push({
        id: "ins-high",
        type: "warning" as const,
        text: `Tus seguros representan el ${insPct.toFixed(0)}% de tu cuota mensual. Considera cotizar pólizas de vida e incendio con aseguradoras independientes y externalizarlas en el banco para reducir este cargo fijo.`
      });
    }

    if (debt.interest_rate > 10.5 && debt.currency === "CRC") {
      insights.push({
        id: "rate-high-crc",
        type: "warning" as const,
        text: `Tu tasa nominal del ${debt.interest_rate}% en colones está por encima de los promedios del mercado actual para créditos consolidados. Valora una compra de saldo o refinanciamiento institucional.`
      });
    } else if (debt.interest_rate > 7.5 && debt.currency === "USD") {
      insights.push({
        id: "rate-high-usd",
        type: "warning" as const,
        text: `Tu tasa en dólares (${debt.interest_rate}%) es elevada. Evalúa si te conviene cambiar el crédito a colones si tus ingresos son en colones para evitar el riesgo cambiario y negociar mejores tasas.`
      });
    }

    if (debt.remaining_terms > 120) {
      insights.push({
        id: "long-term",
        type: "info" as const,
        text: `Al ser un crédito a largo plazo (${Math.round(debt.remaining_terms / 12)} años restantes), cualquier abono extraordinario realizado en los primeros años reducirá drásticamente el saldo principal y multiplicará tu ahorro en intereses acumulados.`
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: "healthy",
        type: "info" as const,
        text: "¡Tu crédito tiene parámetros saludables! Mantener abonos extraordinarios te liberará aún más rápido de este compromiso."
      });
    }

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-on-surface uppercase tracking-wide mb-1 flex items-center gap-1.5">
          <IconAlertCircle size={16} className="text-[#005226]" />
          Insights del Diagnóstico Financiero
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-2xl text-xs font-medium border flex items-start gap-3 transition-colors ${
                insight.type === "warning"
                  ? "bg-[#fffde7] border-[#fff59d] text-[#5d4037]"
                  : "bg-primary-container/30 border-[#a6f5c0]/50 text-[#00210c]"
              }`}
            >
              <span className="text-base leading-none mt-0.5">💡</span>
              <p className="leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const searchParams = new URLSearchParams(location.search);
  const isGuided = searchParams.get("guided") === "true";
  const isWizard = searchParams.get("wizard") === "true";
  const currentStep = searchParams.get("step");

  const handleBackToBudget = () => {
    if (isWizard) {
      navigate(`/dashboard/budget?wizard=true&step=${currentStep || "2"}`);
    } else {
      navigate("/dashboard/budget?editing=true");
    }
  };

  return (
    <div className="space-y-6">
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
                Modo Asistido: Registro de Deudas
              </h3>
              <p className="text-xs text-muted font-medium mt-0.5">
                Para completar la planeación, ingresa tu deuda de forma manual o subiendo tu PDF. El agente la sincronizará con tu presupuesto automáticamente.
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
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface font-manrope">
            Analizador de Deudas
          </h1>
          <p className="text-xs text-muted font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
            <IconShieldLock size={14} className="text-primary-fixed-dim" />
            Cifrado AES-256 en Reposo • Privacidad Bancaria Certificada
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openManualForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-surface-variant/40 border border-outline-variant/60 text-xs font-bold text-on-surface transition-all cursor-pointer shadow-sm"
          >
            <IconPlus size={16} />
            Agregar Manualmente
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#005226] hover:bg-[#003d1c] text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
          >
            <IconUpload size={16} />
            Subir Estado de Cuenta (PDF)
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted uppercase tracking-wider">Cargando tus créditos...</p>
        </div>
      ) : debts.length === 0 ? (
        /* Empty State Onboarding */
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center p-8 md:p-16 bg-surface-container-lowest rounded-[28px] border-2 border-dashed border-outline-variant/40 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden"
        >
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-[#005226] border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="font-black text-on-surface text-lg">Procesando documento...</h3>
                <p className="text-xs text-muted font-medium mt-1">Nuestra IA está extrayendo los datos financieros e indexando el crédito</p>
              </div>
            </div>
          )}

          <div className="w-16 h-16 rounded-3xl bg-primary-container/30 flex items-center justify-center mb-6 text-primary">
            <IconFileSpreadsheet size={32} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-on-surface leading-tight font-manrope">
            Optimiza y elimina tus deudas hoy
          </h2>
          <p className="text-sm text-on-surface-variant font-medium max-w-xl mt-3 leading-relaxed">
            Sube los estados de cuenta de tus préstamos o hipotecas (en PDF). Fynkro extraerá automáticamente las tasas, plazos y comisiones para calcular el plan acelerado de libertad financiera.
          </p>

          {uploadError && (
            <div className="mt-4 p-3 bg-error-container text-on-error-container text-xs font-semibold rounded-xl border border-error/20 flex items-center gap-2 max-w-md">
              <IconAlertCircle size={16} />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#005226] hover:bg-[#003d1c] text-sm font-bold text-white transition-all cursor-pointer shadow-md"
            >
              Seleccionar Archivo PDF
            </button>
            <button
              onClick={openManualForm}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-surface-variant/40 border border-outline border-outline-variant text-sm font-bold text-on-surface transition-all cursor-pointer shadow-sm"
            >
              Introducir Deuda Manualmente
            </button>
          </div>
          <span className="text-[11px] font-bold text-muted uppercase tracking-widest mt-6 block">
            Soporta extractos de BAC, BCR, BNCR y más costarricenses • Arrastra y suelta tu archivo aquí
          </span>
        </div>
      ) : (
        /* Standard Dashboard View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Panel: Debt Selection Cards */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xs font-bold text-on-surface uppercase tracking-wide px-1">
              Mis Compromisos Activos ({debts.length})
            </h2>
            <div className="space-y-3 max-h-[calc(100vh-290px)] overflow-y-auto custom-scrollbar pr-1">
              {debts.map((debt) => {
                const isSelected = debt.id === selectedDebtId;
                return (
                  <div
                    key={debt.id}
                    onClick={() => handleSelectDebt(debt.id)}
                    className={`p-5 rounded-[22px] border text-left cursor-pointer transition-all duration-300 relative group ${
                      isSelected
                        ? "bg-[#0a1f12] border-primary text-white shadow-md scale-[1.02]"
                        : "bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:bg-surface-variant/10 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-black text-sm tracking-tight">{debt.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-primary" : "text-primary-fixed-dim"}`}>
                            Tasa: {debt.interest_rate}% Anual
                          </p>
                          {debt.sync_budget && (
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              isSelected 
                                ? "bg-primary-container text-on-primary-container border-primary/30" 
                                : "bg-[#d1efdc] text-[#005226] border-[#005226]/10"
                            }`}>
                              Presupuestado
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteDebt(debt.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? "text-white/40 hover:text-white hover:bg-white/10"
                            : "text-muted hover:text-error hover:bg-error-container/20 opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>

                    <div className="mt-4 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider block opacity-60">Saldo Actual</span>
                        <span className="text-base font-black leading-none mt-0.5">
                          {formatValue(debt.balance, debt.currency)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold uppercase tracking-wider block opacity-60">Plazo restante</span>
                        <span className="text-xs font-bold font-manrope">
                          {debt.remaining_terms} meses ({Math.round(debt.remaining_terms / 12)} años)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Upload inline box inside left panel */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-[22px] border border-dashed border-outline-variant/60 hover:bg-surface-variant/20 flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#005226] border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Procesando PDF...</span>
                </>
              ) : (
                <>
                  <IconUpload size={20} className="text-[#005226]" />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Subir nuevo PDF de estado de cuenta
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Panel: Selected Debt Dashboard Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDebtDetails ? (
              <motion.div
                key={selectedDebtDetails.debt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-surface-container-lowest rounded-[28px] p-6 md:p-8 border border-outline-variant/20 shadow-sm space-y-6"
              >
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
                  <div>
                    <h2 className="text-2xl font-black text-on-surface font-manrope">
                      {selectedDebtDetails.debt.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1.5 text-[11px] font-bold text-muted uppercase tracking-wide">
                      <span>N° Operación: {selectedDebtDetails.debt.operation_number || "Ingreso Manual"}</span>
                      <span>•</span>
                      <span>Amortización Francesa</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Saldo Pendiente</span>
                    <span className="text-2xl font-black text-[#005226] font-manrope">
                      {formatValue(selectedDebtDetails.debt.balance, selectedDebtDetails.debt.currency)}
                    </span>
                  </div>
                </div>

                {/* Core Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1">Tasa Nominal</span>
                    <span className="text-lg font-black text-on-surface">{selectedDebtDetails.debt.interest_rate}%</span>
                    <span className="text-[9px] font-bold text-muted block mt-0.5">Anual fija/revisable</span>
                  </div>

                  <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1">Mensualidad</span>
                    <span className="text-lg font-black text-on-surface">
                      {formatValue(selectedDebtDetails.debt.total_installment, selectedDebtDetails.debt.currency)}
                    </span>
                    <span className="text-[9px] font-bold text-muted block mt-0.5">Cuota amortizada</span>
                  </div>

                  <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1">Plazo Restante</span>
                    <span className="text-lg font-black text-on-surface">{selectedDebtDetails.debt.remaining_terms}</span>
                    <span className="text-[9px] font-bold text-muted block mt-0.5">Meses de amortización</span>
                  </div>

                  <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20">
                    <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1">Fecha Libertad</span>
                    <span className="text-xs font-black text-on-surface uppercase truncate block mt-1.5" style={{ letterSpacing: "0.05em" }}>
                      {getFreedomDates(selectedDebtDetails.debt.remaining_terms)}
                    </span>
                  </div>
                </div>

                {/* Donut Chart Portion */}
                {renderDonutChart(selectedDebtDetails.debt)}

                {/* Actionable Insights */}
                {renderInsights(selectedDebtDetails.debt)}

                {/* Budget Integration Section */}
                <div className="border-t border-outline-variant/30 pt-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-on-surface font-manrope">
                      Planificación de Presupuesto
                    </h3>
                    <p className="text-xs text-muted font-medium mt-1">
                      Sincroniza tus cuotas de deudas y abonos planificados para automatizar la reserva de liquidez en tu presupuesto de este mes.
                    </p>
                  </div>

                  {selectedDebtDetails.debt.sync_budget ? (
                    /* Active Sync Panel */
                    <div className="bg-[#005226]/5 border border-[#005226]/20 rounded-2xl p-5 space-y-4">
                      {/* Active Status Badge */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#d1efdc] text-[#005226] flex items-center justify-center text-xs font-bold shrink-0">
                          ✓
                        </div>
                        <div>
                          <span className="text-xs font-black text-on-surface block">Vínculo de Presupuesto Activo</span>
                          <span className="text-[10px] font-bold text-[#005226] block">
                            Categoría "{selectedDebtDetails.debt.name}" sincronizada en tu presupuesto mensual.
                          </span>
                        </div>
                      </div>

                      {/* Allocation Values Details */}
                      <div className="grid grid-cols-2 gap-4 bg-surface rounded-xl p-3 border border-outline-variant/20 text-xs">
                        <div>
                          <span className="text-muted block text-[9px] uppercase font-bold tracking-wider mb-0.5">Cuota Reservada</span>
                          <span className="font-black text-on-surface">
                            {formatValue(selectedDebtDetails.debt.total_installment, selectedDebtDetails.debt.currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted block text-[9px] uppercase font-bold tracking-wider mb-0.5">Abono Extra Planificado</span>
                          <span className="font-black text-on-surface">
                            {formatValue(selectedDebtDetails.debt.planned_extra_payment || 0, selectedDebtDetails.debt.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Planned Extra Payment input to modify */}
                      <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-on-surface block">Planificar abonos extraordinarios mensuales</span>
                            <span className="text-[10px] font-bold text-muted block">
                              Ajusta el monto extra que planificas destinar este mes a capital.
                            </span>
                          </div>
                          {extraPayment > 0 && extraPaymentType === "monthly" && (
                            <button
                              type="button"
                              onClick={() => setPlannedExtraPayment(extraPayment)}
                              className="text-[10px] font-bold text-[#005226] bg-[#d1efdc]/60 hover:bg-[#d1efdc] px-2 py-1 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                            >
                              Copiar de simulación ({formatValue(extraPayment, selectedDebtDetails.debt.currency)})
                            </button>
                          )}
                        </div>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                            {selectedDebtDetails.debt.currency === "CRC" ? "₡" : "$"}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step={selectedDebtDetails.debt.currency === "CRC" ? "1000" : "1"}
                            value={plannedExtraPayment || ""}
                            onChange={(e) => setPlannedExtraPayment(Number(e.target.value))}
                            placeholder="0"
                            className="w-full bg-white border border-outline-variant/30 rounded-xl py-2.5 pl-8 pr-4 text-xs font-bold outline-none text-on-surface"
                          />
                        </div>
                      </div>

                      {/* Update / Unlink Action buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSyncBudget(true)}
                          disabled={syncLoading}
                          className="px-5 py-2.5 rounded-full bg-[#005226] hover:bg-[#003d1c] text-xs font-bold text-white transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {syncLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Actualizando...</span>
                            </>
                          ) : (
                            <>
                              <IconCoins size={16} />
                              <span>Actualizar Presupuesto</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSyncBudget(false)}
                          disabled={syncLoading}
                          className="px-5 py-2.5 rounded-full bg-white hover:bg-error-container/10 border border-error/30 text-xs font-bold text-error transition-all cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          Desvincular del Presupuesto
                        </button>
                      </div>

                      {/* Success / Warning Banners */}
                      {syncSuccess && (
                        <div className="flex flex-col gap-2 mt-1.5 w-full">
                          <div className="text-xs font-bold text-[#005226] flex items-center gap-1.5">
                            <IconCheck size={16} className="text-primary-fixed-dim" />
                            {selectedDebtDetails.debt.sync_budget ? (
                              <span>¡Presupuesto actualizado! Total asignado: {formatValue(syncSuccessAmount, selectedDebtDetails.debt.currency)} en la categoría "{selectedDebtDetails.debt.name}".</span>
                            ) : (
                              <span>¡Desvinculado con éxito! Se ha eliminado la asignación de presupuesto.</span>
                            )}
                          </div>
                          {syncWarning && (
                            <div className="p-3.5 rounded-2xl text-[11px] font-semibold bg-[#fffde7] border border-[#fff59d] text-[#5d4037] flex items-start gap-2.5 shadow-sm mt-1">
                              <span className="text-base leading-none mt-0.5">⚠️</span>
                              <p className="leading-relaxed">{syncWarning}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Inactive Sync Panel */
                    <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 space-y-4">
                      {/* Onboarding description */}
                      <div className="space-y-1">
                        <span className="text-xs font-black text-on-surface block">Sincronización Desactivada</span>
                        <p className="text-[10px] font-bold text-muted leading-relaxed">
                          Vincula este crédito al presupuesto mensual para separar automáticamente la cuota de {formatValue(selectedDebtDetails.debt.total_installment, selectedDebtDetails.debt.currency)} en una categoría dedicada.
                        </p>
                      </div>

                      {/* Optional planned extra payment when initiating */}
                      <div className="space-y-2.5 pt-2 border-t border-outline-variant/20">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-on-surface block">¿Deseas planificar abonos extraordinarios mensuales? (Opcional)</span>
                            <span className="text-[10px] font-bold text-muted block">
                              Monto adicional regular que planeas abonar aparte de la cuota.
                            </span>
                          </div>
                          {extraPayment > 0 && extraPaymentType === "monthly" && (
                            <button
                              type="button"
                              onClick={() => setPlannedExtraPayment(extraPayment)}
                              className="text-[10px] font-bold text-[#005226] bg-[#d1efdc]/60 hover:bg-[#d1efdc] px-2 py-1 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                            >
                              Copiar de simulación ({formatValue(extraPayment, selectedDebtDetails.debt.currency)})
                            </button>
                          )}
                        </div>

                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">
                            {selectedDebtDetails.debt.currency === "CRC" ? "₡" : "$"}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step={selectedDebtDetails.debt.currency === "CRC" ? "1000" : "1"}
                            value={plannedExtraPayment || ""}
                            onChange={(e) => setPlannedExtraPayment(Number(e.target.value))}
                            placeholder="Monto adicional opcional (Ej. 50000)"
                            className="w-full bg-white border border-outline-variant/30 rounded-xl py-2.5 pl-8 pr-4 text-xs font-bold outline-none text-on-surface"
                          />
                        </div>
                      </div>

                      {/* Prominent Action Button to Sync */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleSyncBudget(true)}
                          disabled={syncLoading}
                          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#005226] hover:bg-[#003d1c] text-xs font-bold text-white transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                        >
                          {syncLoading ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Sincronizando...</span>
                            </>
                          ) : (
                            <>
                              <IconCoins size={16} />
                              <span>Sincronizar con Presupuesto</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Error / Success feedback if any */}
                      {syncSuccess && !selectedDebtDetails.debt.sync_budget && (
                        <div className="flex flex-col gap-2 mt-1.5 w-full">
                          <div className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1.5">
                            <IconCheck size={16} className="text-[#ba1a1a]" />
                            <span>Deuda desvinculada del presupuesto con éxito.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Simulator Section */}
                <div className="border-t border-outline-variant/30 pt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-on-surface font-manrope">
                      Simulador de Pagos Extraordinarios
                    </h3>
                    <p className="text-xs text-muted font-medium mt-1">
                      Descubre cuánto dinero de intereses y cuántos meses de tu vida ahorras realizando aportes extraordinarios directos al capital.
                    </p>
                  </div>

                  {/* Simulator Control Board */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-surface border border-outline-variant/30 rounded-2xl p-5">
                    {/* Extra payment type toggler */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Tipo de Abono</label>
                      <div className="grid grid-cols-2 gap-2 bg-surface-variant/40 rounded-xl p-1 border border-outline-variant/30">
                        <button
                          type="button"
                          onClick={() => setExtraPaymentType("monthly")}
                          className={`py-2 rounded-lg text-center text-xs font-bold transition-all cursor-pointer ${
                            extraPaymentType === "monthly"
                              ? "bg-white text-on-surface shadow-sm"
                              : "text-muted hover:text-on-surface"
                          }`}
                        >
                          Mensual
                        </button>
                        <button
                          type="button"
                          onClick={() => setExtraPaymentType("one_time")}
                          className={`py-2 rounded-lg text-center text-xs font-bold transition-all cursor-pointer ${
                            extraPaymentType === "one_time"
                              ? "bg-white text-on-surface shadow-sm"
                              : "text-muted hover:text-on-surface"
                          }`}
                        >
                          Único (Ya)
                        </button>
                      </div>
                    </div>

                    {/* Extra payment value range slider */}
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">
                          Monto del Abono Extraordinario
                        </label>
                        <span className="text-xs font-black text-[#005226]">
                          {formatValue(extraPayment, selectedDebtDetails.debt.currency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          // Scale dynamic limit based on currency & monthly installment size
                          max={selectedDebtDetails.debt.currency === "CRC" 
                            ? Math.round(selectedDebtDetails.debt.total_installment * 3) 
                            : Math.round(selectedDebtDetails.debt.total_installment * 3)}
                          step={selectedDebtDetails.debt.currency === "CRC" ? 5000 : 10}
                          value={extraPayment}
                          onChange={(e) => setExtraPayment(Number(e.target.value))}
                          className="flex-1 budget-slider"
                        />
                        <input
                          type="number"
                          value={extraPayment || ""}
                          placeholder="0"
                          onChange={(e) => setExtraPayment(Number(e.target.value))}
                          className="w-24 bg-white border border-outline-variant/30 rounded-xl py-2 px-3 text-xs text-center font-bold outline-none text-on-surface"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Simulator Results Dashboard */}
                  {simLoading ? (
                    <div className="flex items-center justify-center py-8 gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-muted uppercase tracking-wider">Simulando plan...</span>
                    </div>
                  ) : simulation ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6 bg-gradient-to-br from-[#d1efdc]/40 to-transparent p-6 rounded-[24px] border border-primary/20"
                    >
                      {/* Savings summary grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-white rounded-xl shadow-sm border border-primary/10">
                          <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1">Interés Ahorrado</span>
                          <span className="text-lg font-black text-[#005226]">
                            {formatValue(simulation.summary.interest_savings, selectedDebtDetails.debt.currency)}
                          </span>
                        </div>

                        <div className="p-4 bg-white rounded-xl shadow-sm border border-primary/10">
                          <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1">Cuotas Recortadas</span>
                          <span className="text-lg font-black text-on-surface">
                            {simulation.summary.months_saved} meses
                          </span>
                        </div>

                        <div className="p-4 bg-white rounded-xl shadow-sm border border-primary/10 col-span-2 sm:col-span-1">
                          <span className="text-[9px] font-bold text-muted uppercase tracking-wider block mb-1">Ahorro Total</span>
                          <span className="text-lg font-black text-primary-fixed-dim">
                            {formatValue(simulation.summary.total_savings, selectedDebtDetails.debt.currency)}
                          </span>
                        </div>
                      </div>

                      {/* Freedom Timeline Track Panel */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-on-surface uppercase tracking-wider">
                          Línea Temporal Comparativa (Freedom Timeline)
                        </h4>
                        
                        <div className="space-y-5 bg-white p-5 rounded-2xl border border-outline-variant/20 shadow-sm">
                          {/* Original track */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-on-surface-variant flex items-center gap-1.5">
                                <IconHourglass size={14} />
                                Plan Tradicional
                              </span>
                              <span className="text-on-surface">{simulation.summary.original_term} cuotas ({getFreedomDates(simulation.summary.original_term)})</span>
                            </div>
                            <div className="w-full h-4 bg-surface-variant/80 rounded-full overflow-hidden">
                              <div className="h-full bg-outline-variant/80 rounded-full" style={{ width: "100%" }} />
                            </div>
                          </div>

                          {/* Optimized track */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-primary flex items-center gap-1.5">
                                <IconTrendingDown size={14} />
                                Plan Fynkro Acelerado
                              </span>
                              <span className="text-[#005226] font-black">
                                {simulation.summary.optimized_term} cuotas ({getFreedomDates(simulation.summary.optimized_term)})
                              </span>
                            </div>
                            <div className="w-full h-4 bg-surface-variant/80 rounded-full overflow-hidden relative">
                              <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: `${(simulation.summary.optimized_term / simulation.summary.original_term) * 100}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="h-full bg-primary rounded-full relative shadow-inner"
                              />
                            </div>
                            {simulation.summary.months_saved > 0 && (
                              <div className="flex items-center justify-end text-[10px] font-bold text-[#005226] uppercase mt-1">
                                <span>✨ ¡Te liberas {Math.round(simulation.summary.months_saved)} meses antes! ({Math.round(simulation.summary.months_saved / 12 * 10) / 10} años)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-4 bg-surface rounded-2xl text-center text-xs font-bold text-muted border border-dashed border-outline-variant/40">
                      Modifica el abono extraordinario para ver las proyecciones aceleradas
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      )}

      {/* Validation Modal & Manual Form Modal */}
      <AnimatePresence>
        {(showValidationModal || showManualForm) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-lowest rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-outline-variant/30 p-6 md:p-8"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-on-surface font-manrope">
                    {showValidationModal ? "Validar Extracción Bancaria (OCR)" : "Agregar Deuda Manualmente"}
                  </h3>
                  <p className="text-xs text-muted font-medium mt-1">
                    {showValidationModal 
                      ? "Nuestra IA extrajo estos parámetros financieros de tu PDF. Por favor verifica que sean correctos antes de encriptar y guardar."
                      : "Introduce los datos financieros de tu crédito según tu contrato actual."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowValidationModal(false);
                    setShowManualForm(false);
                  }}
                  className="p-2 hover:bg-surface-variant/40 rounded-xl transition-colors cursor-pointer text-muted"
                >
                  <IconX size={20} />
                </button>
              </div>

              {/* Tipo de Deuda Selection (Manual entry only) */}
              {showManualForm && (
                <div className="mb-6 space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Tipo de Deuda</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDebtType("standard");
                      }}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        debtType === "standard"
                          ? "bg-[#005226]/10 border-[#005226] text-[#005226]"
                          : "bg-surface border-outline-variant/30 text-muted hover:border-outline-variant/60"
                      }`}
                    >
                      <span>🏦</span>
                      <span>Crédito Bancario / Tarjeta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDebtType("simple");
                        setFormFields(prev => {
                          const updated = {
                            ...prev,
                            interest_rate: 0,
                            insurance_cost: 0,
                            other_fees: 0
                          };
                          const bal = Number(prev.balance);
                          const terms = Number(prev.remaining_terms);
                          if (terms > 0) {
                            updated.total_installment = Number((bal / terms).toFixed(2));
                          }
                          return updated;
                        });
                      }}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        debtType === "simple"
                          ? "bg-[#005226]/10 border-[#005226] text-[#005226]"
                          : "bg-surface border-outline-variant/30 text-muted hover:border-outline-variant/60"
                      }`}
                    >
                      <span>🤝</span>
                      <span>Deuda Simple / Familiar / Tasa Cero</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Opción de Subir PDF (OCR) */}
              {showManualForm && (
                <div className="mb-6 bg-[#005226]/5 border border-dashed border-[#005226]/20 rounded-2xl p-4 flex flex-col items-center text-center gap-2.5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#005226]/10 text-[#005226]">
                    <IconUpload size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-on-surface font-manrope">¿Tienes el estado de cuenta en PDF?</h4>
                    <p className="text-[10px] text-muted font-medium mt-0.5 max-w-sm">
                      Sube el documento PDF oficial y nuestra IA extraerá el saldo, intereses y plazos automáticamente para que no tengas que rellenar el formulario.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#005226] hover:bg-[#003d1c] text-xs font-bold text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isUploading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <IconUpload size={14} />
                    )}
                    <span>{isUploading ? "Procesando..." : "Subir PDF de Estado de Cuenta"}</span>
                  </button>
                  {uploadError && (
                    <p className="text-[10px] font-bold text-error mt-1">{uploadError}</p>
                  )}
                </div>
              )}

              {/* Form Content */}
              <form onSubmit={handleSaveDebt} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Debt Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Nombre de la Deuda</label>
                    <input
                      type="text"
                      required
                      value={formFields.name}
                      onChange={(e) => handleFormFieldChange("name", e.target.value)}
                      placeholder="Ej. Hipoteca BAC Casa o Préstamo Familiar"
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Operation Number */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <IconShieldLock size={12} className="text-primary-fixed-dim" />
                      Número de Operación (AES-256)
                    </label>
                    <input
                      type="text"
                      value={formFields.operation_number || ""}
                      onChange={(e) => handleFormFieldChange("operation_number", e.target.value)}
                      placeholder="Ej. 104523992"
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Moneda</label>
                    <select
                      value={formFields.currency}
                      onChange={(e) => handleFormFieldChange("currency", e.target.value as "CRC" | "USD")}
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="CRC">Colones (₡)</option>
                      <option value="USD">Dólares ($)</option>
                    </select>
                  </div>

                  {/* Outstanding Balance */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Saldo Actual (Principal)</label>
                    <input
                      type="number"
                      required
                      step="any"
                      min="0.01"
                      value={formFields.balance || ""}
                      onChange={(e) => handleFormFieldChange("balance", Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Interest Rate */}
                  {debtType !== "simple" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Tasa Nominal Anual (%)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        value={formFields.interest_rate || ""}
                        onChange={(e) => handleFormFieldChange("interest_rate", Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  )}

                  {/* Total Installment */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Cuota Mensual Total</label>
                    <input
                      type="number"
                      required
                      step="any"
                      min="0.01"
                      value={formFields.total_installment || ""}
                      onChange={(e) => handleFormFieldChange("total_installment", Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Insurance Cost */}
                  {debtType !== "simple" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Seguros Mensuales</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={formFields.insurance_cost || ""}
                        onChange={(e) => handleFormFieldChange("insurance_cost", Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  )}

                  {/* Other Fees */}
                  {debtType !== "simple" && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Comisiones/Cargos Fijos</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={formFields.other_fees || ""}
                        onChange={(e) => handleFormFieldChange("other_fees", Number(e.target.value))}
                        placeholder="0.00"
                        className="w-full bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  )}

                  {/* Remaining Terms */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Plazo Restante (en Meses)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formFields.remaining_terms || ""}
                      onChange={(e) => handleFormFieldChange("remaining_terms", Number(e.target.value))}
                      placeholder="Ej. 65"
                      className="w-full bg-surface border border-outline-variant/30 rounded-xl py-2.5 px-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-outline-variant/30 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowValidationModal(false);
                      setShowManualForm(false);
                    }}
                    className="px-5 py-2.5 rounded-full border border-outline-variant/60 text-xs font-bold hover:bg-surface-variant/40 transition-all cursor-pointer text-on-surface"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#005226] hover:bg-[#003d1c] text-xs font-bold text-white transition-all cursor-pointer shadow-md"
                  >
                    Confirmar y Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
