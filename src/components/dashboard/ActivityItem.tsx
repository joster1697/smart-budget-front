import { ReactNode } from "react";

interface ActivityItemProps {
  icon: ReactNode;
  title: string;
  date: string;
  amount: string;
  isNegative?: boolean;
  iconBgClass?: string;
}

export default function ActivityItem({ 
  icon, 
  title, 
  date, 
  amount, 
  isNegative = true,
  iconBgClass = "bg-surface-variant/40"
}: ActivityItemProps) {
  return (
    <div className="flex justify-between items-center group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${iconBgClass}`}>
          {icon}
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-bold text-on-surface group-hover:text-primary transition-colors">{title}</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">{date}</p>
        </div>
      </div>
      <p className={`text-[13px] font-bold tabular-nums ${isNegative ? "text-error" : "text-[#005226]"}`}>
        {isNegative ? "-" : "+"}{amount}
      </p>
    </div>
  );
}
