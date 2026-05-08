import { IconMessageCircle, IconSend } from "@tabler/icons-react";
interface DashboardNavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function DashboardNavbar({ isCollapsed, setIsCollapsed }: DashboardNavbarProps) {
  return (
    <nav
      className={`fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-5 pb-8 pt-3 flex flex-col gap-4 transition-all duration-500 ease-in-out ${isCollapsed ? "translate-y-[calc(100%-70px)]" : "translate-y-0"
        }`}
    >
      {/* Handle / Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex flex-col items-center justify-center -mt-1 py-1 w-full active:opacity-60 transition-opacity"
      >
        <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mb-1" />
        {isCollapsed && (
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider animate-pulse">
            <IconMessageCircle size={18} />
            <span>Preguntar a Fynkro</span>
          </div>
        )}
      </button>

      {/* Content - Hidden when collapsed if you want, but translate-y handles most of it */}
      <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {/* Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Pregúntale a Fynkro..."
            className="w-full bg-surface border border-outline-variant/30 rounded-full py-3.5 pl-5 pr-14 text-[13px] outline-none placeholder:text-outline shadow-sm focus:border-primary/50 transition-colors text-on-surface font-medium"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#005226] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm">
            <IconSend size={18} className="-ml-0.5" />
          </button>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2.5 pb-1">
          <button className="whitespace-nowrap px-4 py-2 bg-[#d1efdc] text-[#005226] font-bold text-[11px] rounded-full uppercase tracking-wider">
            Mastery
          </button>
          <button className="whitespace-nowrap px-4 py-2 bg-surface-variant/60 text-on-surface-variant font-bold text-[11px] rounded-full uppercase tracking-wider">
            Accounts
          </button>
          <button className="whitespace-nowrap px-4 py-2 bg-surface-variant/60 text-on-surface-variant font-bold text-[11px] rounded-full uppercase tracking-wider">
            Payments
          </button>
          <button className="whitespace-nowrap px-4 py-2 bg-surface-variant/60 text-on-surface-variant font-bold text-[11px] rounded-full uppercase tracking-wider">
            Intelligence
          </button>
        </div>
      </div>
    </nav>
  );
}
