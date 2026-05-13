import InstrumentCard from "./InstrumentCard";
import { FilledCheck } from "../../ui/Icons";

export default function AccountCardsSlider() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="snap-center shrink-0 w-[90vw] sm:w-[300px]">
        <InstrumentCard
          type="Checking"
          name="Primary Checking"
          mask="...4928"
          balance="$45,280.00"
          isActive={true}
          icon={<FilledCheck size={20} className="opacity-80" />}
        />
      </div>
      <div className="snap-center shrink-0 w-[90vw] sm:w-[300px]">
        <InstrumentCard
          type="Savings"
          name="High-Yield Savings"
          mask="...1104"
          balance="$120,450.00"
          isActive={false}
        />
      </div>
    </div>
  );
}
