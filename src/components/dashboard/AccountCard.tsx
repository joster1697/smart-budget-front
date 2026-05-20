import { ReactNode } from "react";

interface AccountCardProps {
  title: string;
  icon: ReactNode;
  balance: string;
  virtualBalance: string;
  isDark?: boolean;
}

export default function AccountCard({
  title,
  icon,
  balance,
  virtualBalance,
  isDark = false,
}: AccountCardProps) {
  const baseClasses =
    "rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-md";
  const colorClasses = isDark
    ? "bg-on-primary shadow-lg"
    : "bg-surface-container-lowest shadow-sm border border-outline-variant/20";

  const textTitleClasses = isDark ? "text-white/80" : "text-on-surface-variant";
  const textRealClasses = isDark ? "text-white" : "text-on-surface";
  const textVirtualLabelClasses = isDark ? "text-white/50" : "text-outline/60";
  const textVirtualValueClasses = isDark
    ? "text-primary"
    : "text-primary-fixed-dim";
  const iconColor = isDark ? "text-primary" : "text-[#005226]";

  return (
    <div className={`${baseClasses} ${colorClasses}`}>
      <div className="flex justify-between items-start">
        <p
          className="text-[11px] font-medium uppercase tracking-wider text-opacity-80 leading-none"
          style={{ color: isDark ? "white" : undefined }}
        >
          <span className={textTitleClasses}>{title}</span>
        </p>
        <div className={iconColor}>{icon}</div>
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
