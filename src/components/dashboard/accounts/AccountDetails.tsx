import { useEffect, useState } from "react";
import { BankIcon, EditIcon } from "../../ui/Icons";
import { IconListDetails } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateCreatedAccount } from "../../../store/slices/accountsSlice";

export default function AccountDetails({ account }: { account: any }) {
  const [accountName, setAccountName] = useState("Primary Checking");

  const dispatch = useAppDispatch();
  const [adjustment, setAdjustment] = useState("");
  const { accounts } = useAppSelector((state) => state.accounts);

  const handleApplyAdjustment = async () => {
    if (!account) return;
    try {
      const adjustmentValue = Number(adjustment);
      if (isNaN(adjustmentValue)) return;
      const newBalance = adjustmentValue;
      await dispatch(
        updateCreatedAccount({
          ...account,
          balance: newBalance,
        }),
      ).unwrap();
      setAdjustment("");
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const handleSaveName = async () => {
    if (!account) return;
    try {
      await dispatch(
        updateCreatedAccount({
          ...account,
          name: accountName,
        }),
      ).unwrap();
    } catch (error) {
      console.error("Error while updating account: ", error);
    }
  };

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

  const linkedCreditCards = accounts.filter(
    (acc) => acc.type === "credit" && acc.account_linked === account.id
  );

  // El balance de las tarjetas en la base de datos es negativo cuando hay deuda, 
  // por lo que usamos Math.abs para obtener el valor de la deuda en positivo.
  const creditCardsPending = linkedCreditCards.reduce(
    (sum, card) => sum + Math.abs(Number(card.balance)),
    0
  );

  const pendingAmount = Number(account.reserved_balance ?? 0);

  const virtualBalance = Number(account.balance - pendingAmount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-1">
      {/* Columna Izquierda: Account Details */}
      <div className="flex flex-col bg-surface-container-low border border-outline-variant/20 rounded-2xl rounded-tl-sm p-6 shadow-sm">
        <h3 className="text-[20px] font-bold text-[#1B252D] border-b pb-2 border-outline-variant/10">
          Account Details
        </h3>

        <label className="text-[13px] text-[#424943] mt-5 font-medium">
          Account Name
        </label>

        <div className="flex items-center gap-2 mt-1.5 cursor-pointer hover:opacity-80 transition-opacity w-max">
          <BankIcon className="text-[#006b3a]" size={18} />
          <EditIcon className="text-[#006b3a]" size={14} />
          <span className="text-[#006b3a] text-[12px] font-bold">
            Change Icon
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-3 max-w-sm w-full">
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full border border-outline-variant/40 rounded-lg p-3 bg-[#fbfdfc] text-[#1B252D] font-medium focus:outline-none focus:border-primary-fixed hover:border-primary-fixed cursor-pointer transition-all duration-300 hover:shadow-md"
          />
          <button
            onClick={handleSaveName}
            className="bg-primary-container hover:bg-[#8ee9ac] active:scale-95 text-on-primary-container transition-all duration-200 px-6 py-3 rounded-lg font-bold text-[14px] cursor-pointer w-full sm:w-auto shrink-0"
          >
            Save
          </button>
        </div>

        <button className="bg-[#006b3a] hover:bg-[#005a30] transition-colors text-white px-5 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-8 shadow-sm w-max cursor-pointer">
          <IconListDetails size={20} />
          View Transactions
        </button>
      </div>

      {/* Columna Derecha: Balance Breakdown */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl rounded-tl-sm p-6 flex flex-col shadow-sm">
        <h3 className="text-[20px] font-bold text-[#1B252D] border-b pb-2 border-outline-variant/10">
          Balance Breakdown
        </h3>

        <div className="flex justify-between items-center mt-5">
          <span className="text-[#424943] text-[14px]">Real Balance</span>
          <span className="text-[#1B252D] font-medium text-[15px] tabular-nums">
            {formatCurrency(account.balance)}
          </span>
        </div>

        {creditCardsPending > 0 && (
          <div className="flex justify-between items-center mt-3">
            <span className="text-[#ba1a1a] text-[14px]">Tarjetas Ligadas</span>
            <span className="text-[#ba1a1a] font-medium text-[15px] tabular-nums">
              -{formatCurrency(creditCardsPending)}
            </span>
          </div>
        )}

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 max-w-sm w-full">
          <input
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(e.target.value)}
            placeholder={formatCurrency(0)}
            className="w-full border border-outline-variant/40 rounded-lg p-2.5 bg-white text-[#1B252D] focus:outline-none focus:border-[#006b3a] transition-colors"
          />
          <button
            onClick={handleApplyAdjustment}
            className="bg-primary-container hover:bg-[#8ee9ac] active:scale-95 text-on-primary-container transition-all duration-200 px-6 py-2.5 rounded-lg font-bold text-[13px] cursor-pointer w-full sm:w-auto shrink-0"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
