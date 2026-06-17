
interface PrimaryCheckingAnalysisProps {
  account?: any;
}

export default function PrimaryCheckingAnalysis({ account }: PrimaryCheckingAnalysisProps) {
  if (!account) return null;

  const isCredit = account.type === "credit";
  const trajectoryLabel = isCredit ? "Debt Trajectory" : "Liquidity Trajectory";
  const inflowLabel = isCredit ? "Debt Growth" : "InFlow Growth";

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Gráfico */}
      <div className="w-full h-56 sm:h-72 bg-[#fbfdfc] border border-outline-variant/30 rounded-2xl rounded-tl-sm flex items-center justify-center p-6 relative overflow-hidden shadow-sm">
        {/* Etiqueta de Trayectoria Integrada */}
        <div className="absolute top-4 left-4 z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#005226]/80 bg-white/70 px-2.5 py-1 rounded-full border border-outline-variant/20 backdrop-blur-sm select-none">
          {trajectoryLabel}
        </div>

        {/* Elementos decorativos (Fondo de gráfico) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#e2f5e8] to-transparent opacity-60"></div>
        <svg
          className="absolute w-full h-full opacity-25 bottom-0 left-0"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path
            d="M0,100 L0,70 Q20,90 40,50 T80,30 L100,10 L100,100 Z"
            fill="currentColor"
            className="text-[#006b3a]"
          />
          <path
            d="M0,70 Q20,90 40,50 T80,30 L100,10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-[#006b3a]"
          />
        </svg>

        {/* Métricas Centrales (InFlow y Ratio) */}
        <div className="relative z-10 flex gap-8 md:gap-12 items-center text-center bg-white/85 px-8 py-5 rounded-2xl backdrop-blur-md border border-outline-variant/50 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[#424943] text-[12px] uppercase font-bold tracking-widest">
              {inflowLabel}
            </span>
            <span className="text-[#006b3a] text-[28px] font-black mt-1">
              {isCredit ? "+5.8%" : "+14.2%"}
            </span>
          </div>

          {/* Divisor vertical entre las métricas */}
          <div className="w-px h-12 bg-[#c4c7c5]/60"></div>

          <div className="flex flex-col">
            <span className="text-[#424943] text-[12px] uppercase font-bold tracking-widest">
              {isCredit ? "Utilization Ratio" : "Liquidity Ratio"}
            </span>
            <span className="text-[#1B252D] text-[28px] font-black mt-1">
              {isCredit ? "0.45x" : "1.8x"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
