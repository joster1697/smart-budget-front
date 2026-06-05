import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AccountCardProps {
  title: string;
  icon: ReactNode;
  balance: string;
  virtualBalance: string;
  isDark?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function AccountCard({
  title,
  icon,
  balance,
  virtualBalance,
  isDark = false,
  isSelected = false,
  onClick,
}: AccountCardProps) {
  const baseClasses =
    "relative rounded-2xl rounded-tl-sm p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer select-none hover:shadow-md";
  
  const colorClasses = isDark
    ? "bg-on-primary shadow-lg"
    : isSelected
      ? "bg-[#ebfbf2] shadow-md"
      : "bg-surface-container-lowest shadow-sm";

  const borderClasses = isSelected
    ? isDark
      ? "border-2 border-primary -translate-y-1.5 shadow-[0_10px_20px_rgba(56,224,123,0.25)]"
      : "border-2 border-[#008f43] -translate-y-1.5 shadow-md"
    : isDark
      ? "border-2 border-transparent hover:-translate-y-0.5"
      : "border border-outline-variant/20 hover:-translate-y-0.5";

  const textTitleClasses = isDark ? "text-white/80" : "text-on-surface-variant";
  const textRealClasses = isDark ? "text-white" : "text-on-surface";
  const textVirtualLabelClasses = isDark ? "text-white/50" : "text-outline/60";
  const textVirtualValueClasses = isDark
    ? "text-primary"
    : "text-[#008f43] font-bold";
  const iconColor = isDark ? "text-primary" : "text-[#005226]";

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${colorClasses} ${borderClasses}`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {isSelected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className={`flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black shrink-0 ${
                isDark ? "bg-primary text-on-primary" : "bg-[#008f43] text-white"
              }`}
            >
              ✓
            </motion.span>
          )}
          <p
            className="text-[11px] font-bold uppercase tracking-wider text-opacity-80 leading-none truncate"
            style={{ color: isDark ? "white" : undefined }}
          >
            <span className={textTitleClasses}>{title}</span>
          </p>
        </div>
        <div className={`${iconColor} shrink-0`}>{icon}</div>
      </div>
      <div className="min-w-0 mt-4">
        <p
          className={
            textVirtualLabelClasses + " text-[9px] font-bold uppercase"
          }
        >
          REAL
        </p>
        <p
          className={`text-base lg:text-lg font-black leading-tight truncate tabular-nums ${textRealClasses}`}
        >
          {balance}
        </p>
        <div className="flex justify-between items-end mt-1 gap-2">
          <p
            className={
              textVirtualLabelClasses + " text-[9px] font-bold shrink-0"
            }
          >
            Virtual
          </p>
          <p
            className={`text-[11px] font-black tabular-nums truncate ${textVirtualValueClasses}`}
          >
            {virtualBalance}
          </p>
        </div>
      </div>
    </div>
  );
}

