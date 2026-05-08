import { CreditCardIcon } from "../../ui/Icons";

export default function LinkedCreditCards() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[18px] font-medium text-[#1B252D]">
        Tarjetas Ligadas
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 sm:p-4 bg-[#fbfdfc] border border-outline-variant/30 rounded-xl gap-2">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-10 sm:w-12 h-10 bg-[#f0f2f1] rounded-lg flex items-center justify-center text-[#424943] shrink-0">
              <CreditCardIcon size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] sm:text-[15px] font-bold text-[#1B252D] truncate">
                Platinum Credit
              </p>
              <p className="text-[11px] sm:text-xs text-[#727972] mt-0.5 truncate">
                Fynkro Premium • • • • 1234
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[8px] sm:text-[9px] font-bold text-[#727972] uppercase tracking-wider mb-1">
              Available Credit
            </p>
            <p className="text-[14px] sm:text-[16px] font-bold text-[#1B252D] tabular-nums">
              $35,000.00
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
