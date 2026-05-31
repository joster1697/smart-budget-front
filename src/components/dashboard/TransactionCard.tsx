import { ReactNode } from "react";

interface TransactionCardProps {
  day: string;
  month: string;
  title: string;
  amount: string;
  icon?: ReactNode;
  isNegative?: boolean;
}

export default function TransactionCard({
  day,
  month,
  title,
  amount,
  icon,
  isNegative = true,
}: TransactionCardProps) {
  return (
    <div className="flex items-center gap-4 bg-surface p-3 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
      {/* Calendario con diseño premium (Cabecera de color + Cuerpo del día) */}
      <div className="flex flex-col items-center w-12 h-12 bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden shrink-0 shadow-sm transition-all duration-300 group-hover:shadow-md">
        {/* Franja superior del calendario (Mes) */}
        <div className="w-full bg-[#005226] text-[8px] font-black text-white py-1 text-center uppercase tracking-widest leading-none">
          {month}
        </div>

        {/* Cuerpo del calendario (Día) */}
        <div className="flex-1 flex items-center justify-center w-full bg-white dark:bg-neutral-900">
          <span className="text-base font-black text-on-surface leading-none -mt-0.5">
            {day}
          </span>
        </div>
      </div>

      {/* Icono de Categoría/Transacción */}
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-surface-variant/40 flex items-center justify-center shrink-0 text-on-surface-variant">
          {icon}
        </div>
      )}

      {/* Título de la Transacción */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="text-[11px] text-on-surface-variant font-medium">
          Transacción
        </p>
      </div>

      {/* Monto de la Transacción */}
      <div className="text-right shrink-0">
        <p className={`text-[14px] font-black tabular-nums ${isNegative ? "text-error" : "text-[#005226]"}`}>
          {amount}
        </p>
      </div>
    </div>
  );
}
