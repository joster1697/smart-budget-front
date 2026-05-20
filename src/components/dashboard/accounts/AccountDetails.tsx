import { useEffect, useState } from "react";
import { BankIcon, EditIcon } from "../../ui/Icons";
import { IconListDetails } from "@tabler/icons-react";

export default function AccountDetails({ account }: { account: any }) {
  const [accountName, setAccountName] = useState("Primary Checking");

  useEffect(() => {
    if (!account) return;
    setAccountName(account.name);
  }, [account]);

  if (!account) {
    return (
      <div className="p-6 text-center text-[#424943]">
        Cargando detalles de la cuenta...
      </div>
    );
  }
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(value);

  console.log("DEBUG: selected account is", account);

  const pendingAmount = Number(account.reserved_balance ?? 0);

  const virtualBalance = Number(account.balance - pendingAmount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
      {/* Columna Izquierda: Account Details */}
      <div className="flex flex-col">
        <h2 className="text-[22px] font-bold text-[#1B252D]">
          Account Details
        </h2>

        <label className="text-[13px] text-[#424943] mt-6 font-medium">
          Account Name
        </label>

        <div className="flex items-center gap-2 mt-1.5 cursor-pointer hover:opacity-80 transition-opacity w-max">
          <BankIcon className="text-[#006b3a]" size={18} />
          <EditIcon className="text-[#006b3a]" size={14} />
          <span className="text-[#006b3a] text-[12px] font-bold">
            Change Icon
          </span>
        </div>

        <div className="flex items-center gap-3 mt-3 max-w-sm">
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="flex-1 border border-outline-variant/40 rounded-lg p-3 bg-[#fbfdfc] text-[#1B252D] font-medium focus:outline-none focus:border-primary-fixed hover:border-primary-fixed cursor-pointer transition-all duration-300 hover:shadow-md"
          />
          <button className="bg-[#e4e6e5]/60 transition-colors px-6 py-3 rounded-lg font-bold text-[#1B252D] text-[14px]  cursor-pointer border-2 border-primary-fixed hover:bg-primary-fixed">
            Save
          </button>
        </div>

        <button className="bg-[#006b3a] hover:bg-[#005a30] transition-colors text-white px-5 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-8 shadow-sm w-max cursor-pointer">
          <IconListDetails size={20} />
          View Transactions
        </button>
      </div>

      {/* Columna Derecha: Balance Breakdown */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 flex flex-col">
        <h3 className="text-[20px] font-bold text-[#1B252D]">
          Balance Breakdown
        </h3>

        <div className="flex justify-between items-center mt-6">
          <span className="text-[#424943] text-[14px]">Real Balance</span>
          <span className="text-[#1B252D] font-medium text-[15px] tabular-nums">
            {formatCurrency(account.balance)}
          </span>
        </div>

        <div className="flex justify-between items-center mt-3">
          <span className="text-[#ba1a1a] text-[14px]">Pending Amounts</span>
          <span className="text-[#ba1a1a] font-medium text-[15px] tabular-nums">
            -{formatCurrency(pendingAmount)}
          </span>
        </div>

        <div className="h-px w-full bg-[#c4c7c5]/50 my-5"></div>

        <div className="flex justify-between items-center">
          <span className="text-[#1B252D] font-bold text-[15px]">
            Virtual Balance
          </span>
          <span className="text-[#2ae574] font-bold text-[16px] tabular-nums tracking-wide">
            {formatCurrency(virtualBalance)}
          </span>
        </div>

        <span className="text-[#424943] text-[12px] mt-8 font-medium">
          Manual Adjustment
        </span>
        <div className="flex items-center gap-3 mt-2 max-w-sm">
          <input
            type="text"
            placeholder={formatCurrency(0)}
            className="flex-1 border border-outline-variant/40 rounded-lg p-2.5 bg-white text-[#1B252D] focus:outline-none focus:border-[#006b3a] transition-colors"
          />
          <button className="bg-[#e4e6e5]/60 transition-colors px-6 py-2.5 rounded-lg font-bold text-[#1B252D] text-[13px] cursor-pointer border-2 border-primary-fixed hover:bg-primary-fixed">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
