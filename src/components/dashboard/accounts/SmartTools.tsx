import { BankIcon, LockIcon } from "../../ui/Icons";
import { IconSwitchHorizontal } from "@tabler/icons-react";

export default function SmartTools() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tax Optimization */}
        <div className="flex-1 bg-[#fbfdfc] border border-outline-variant/20 rounded-2xl rounded-tl-sm p-5 flex gap-3 hover:border-primary-fixed cursor-pointer transition-all duration-300 hover:shadow-md shadow-sm">
          <div className="w-11 h-11 bg-[#e2f5e8] rounded-md flex items-center justify-center text-primary">
            <BankIcon size={22} />
          </div>
          <div className="mt-1">
            <p className="text-[15px] font-bold text-[#1B252D]">
              Tax Optimization
            </p>
            <p className="text-[13px] text-[#424943] mt-2 leading-relaxed">
              Review deductible flows and potential harvesting.
            </p>
          </div>
        </div>

        {/* Automated Transfers */}
        <div className="flex-1 bg-[#fbfdfc] border border-outline-variant/20 rounded-2xl rounded-tl-sm p-5 flex gap-3  hover:border-primary-fixed cursor-pointer transition-all duration-300 hover:shadow-md shadow-sm">
          <div className="w-11 h-11 bg-[#e2f5e8] rounded-md flex items-center justify-center text-primary">
            <IconSwitchHorizontal size={22} stroke={2} />
          </div>
          <div className="mt-1">
            <p className="text-[15px] font-bold text-[#1B252D]">
              Automated Transfers
            </p>
            <p className="text-[13px] text-[#424943] mt-2 leading-relaxed">
              Manage sweeper rules and recurring funding.
            </p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="w-full bg-[#fbfdfc] border border-outline-variant/20 rounded-2xl rounded-tl-sm p-5 flex items-start gap-3 hover:border-primary-fixed cursor-pointer transition-all duration-300 hover:shadow-md shadow-sm">
        <div className="w-11 h-11 bg-[#e2f5e8] rounded-md flex items-center justify-center text-primary shrink-0">
          <LockIcon size={22} />
        </div>
        <div className="mt-1">
          <p className="text-[15px] font-bold text-[#1B252D]">
            Security Settings
          </p>
          <p className="text-[13px] text-[#424943] mt-2 leading-relaxed">
            Configure limits, freezes, and alert thresholds.
          </p>
        </div>
      </div>
    </div>
  );
}
