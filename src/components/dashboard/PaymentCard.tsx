interface PaymentCardProps {
  day: string;
  month: string;
  title: string;
  amount: string;
}

export default function PaymentCard({ day, month, title, amount }: PaymentCardProps) {
  return (
    <div className="flex items-center gap-4 bg-surface p-3 rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group">
      <div className="flex flex-col items-center justify-center w-12 h-12 bg-surface-container-lowest rounded-lg border border-outline-variant/20 shrink-0 shadow-sm group-hover:bg-primary-container/30 transition-colors">
        <span className="text-[10px] font-black text-[#005226] leading-none uppercase">{month}</span>
        <span className="text-lg font-black text-on-surface leading-tight">{day}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">{title}</p>
        <p className="text-[11px] text-on-surface-variant font-medium">Pago programado</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[14px] font-black text-on-surface tabular-nums">{amount}</p>
      </div>
    </div>
  );
}
