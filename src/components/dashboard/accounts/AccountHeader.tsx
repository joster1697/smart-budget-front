import { PlusIcon } from "../../ui/Icons";

interface AccountHeaderProps {
  onAddAccount: () => void;
}

export default function AccountHeader({ onAddAccount }: AccountHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/10">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-on-surface font-manrope">
          Account Management
        </h1>
        <p className="text-xs text-on-surface-variant">
          Review and configure your financial instruments.
        </p>
      </div>
      <button
        onClick={onAddAccount}
        className="hidden md:flex bg-[#006b3a] hover:bg-[#005a30] active:scale-95 text-white text-[13px] font-bold px-4 py-2.5 rounded-xl items-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
      >
        <span className="text-lg leading-none">+</span> Add Account
      </button>
      <button
        onClick={onAddAccount}
        className="md:hidden w-8 h-8 rounded-full bg-[#f0f2f1] border-2 border-primary-fixed hover:bg-primary-fixed active:scale-95 flex items-center justify-center text-[#1B252D] cursor-pointer transition-all duration-200"
        aria-label="Vincular Tarjeta"
      >
        <PlusIcon size={18} />
      </button>
    </div>
  );
}
