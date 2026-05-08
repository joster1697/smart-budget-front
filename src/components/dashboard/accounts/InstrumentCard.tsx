import { ReactNode } from "react";
import { BankIcon } from "../../ui/Icons";

interface InstrumentCardProps {
  type: string;
  name: string;
  mask: string;
  balance: string;
  isActive?: boolean;
  icon?: ReactNode;
}

export default function InstrumentCard({
  type,
  name,
  mask,
  balance,
  isActive = false,
  icon,
}: InstrumentCardProps) {
  const baseClasses =
    "relative overflow-hidden rounded-2xl p-4 flex flex-col justify-between h-40 w-full flex-shrink-0 transition-all";
  const bgClasses = isActive
    ? "bg-primary text-on-primary shadow-lg"
    : "bg-surface-container-lowest border border-outline-variant/20 text-on-surface shadow-sm";
  const typeTextClasses = isActive ? "text-on-primary/70" : "text-outline";
  const nameTextClasses = isActive ? "text-on-primary" : "text-on-surface";
  const maskTextClasses = isActive
    ? "text-on-primary/60"
    : "text-outline-variant";

  return (
    <div className={`${baseClasses} ${bgClasses}`}>
      {/* Background Icon */}
      {isActive && (
        <div className="absolute right-[-10px] top-[-10px] opacity-[0.08] pointer-events-none">
          <BankIcon size={100} />
        </div>
      )}

      <div className="flex justify-between items-start relative z-10">
        <p
          className={`text-[10px] font-bold uppercase tracking-wider ${typeTextClasses}`}
        >
          {type}
        </p>
        {icon && (
          <div className={isActive ? "text-on-primary" : "text-primary"}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 relative z-10">
        <p className={`text-sm font-bold truncate ${nameTextClasses}`}>
          {name}
        </p>
        <p className={`text-[10px] ${maskTextClasses}`}>{mask}</p>
      </div>

      <div className="mt-auto relative z-10">
        <p
          className={`text-xl font-black tabular-nums tracking-tight ${nameTextClasses}`}
        >
          {balance}
        </p>
      </div>
    </div>
  );
}
