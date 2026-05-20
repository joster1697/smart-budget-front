import { CreditCardIcon, PlusIcon, ChevronRightIcon } from "../../ui/Icons";

interface LinkedCreditCardsProps {
  onAddCard?: () => void;
}

export default function LinkedCreditCards({
  onAddCard,
}: LinkedCreditCardsProps) {
  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard();
    } else {
      console.log("Agregar nueva tarjeta");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-medium text-[#1B252D]">
          Tarjetas Ligadas
        </h3>
        <button
          onClick={handleAddCard}
          className="md:hidden w-8 h-8 rounded-full bg-[#f0f2f1] border-2 border-primary-fixed hover:bg-primary-fixed active:scale-95 flex items-center justify-center text-[#1B252D] cursor-pointer transition-all duration-200"
          aria-label="Vincular Tarjeta"
        >
          <PlusIcon size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 sm:p-4 bg-[#fbfdfc] border-2 border-outline-variant/30 rounded-xl gap-2 hover:border-primary-fixed cursor-pointer transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#f0f2f1] rounded-lg flex items-center justify-center text-[#424943] shrink-0">
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

        <div
          onClick={handleAddCard}
          className="hidden md:flex group items-center justify-between p-3 sm:p-4 bg-[#fbfdfc]/50 border-2 border-dashed border-outline-variant/50 rounded-xl gap-2 hover:border-primary-fixed hover:bg-[#fbfdfc] cursor-pointer transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#f0f2f1]/50 group-hover:bg-[#f0f2f1] rounded-lg flex items-center justify-center text-[#727972] group-hover:text-[#1B252D] shrink-0 transition-all duration-300">
              <PlusIcon size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] sm:text-[15px] font-bold text-[#727972] group-hover:text-[#1B252D] truncate transition-colors duration-300">
                Vincular Tarjeta
              </p>
              <p className="text-[11px] sm:text-xs text-[#727972]/70 mt-0.5 truncate">
                Asociar cuenta de crédito
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#727972]/50 group-hover:text-[#1B252D] transition-colors duration-300">
              <ChevronRightIcon size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
