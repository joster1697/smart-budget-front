import { useState } from "react";
import { CreditCardIcon, PlusIcon, TrashIcon } from "../../ui/Icons";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { linkAccountThunk, unlinkAccountThunk } from "../../../store/slices/accountsSlice";

interface LinkedCreditCardsProps {
  account?: any;
}

export default function LinkedCreditCards({ account }: LinkedCreditCardsProps) {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState("");

  const { accounts } = useAppSelector((state) => state.accounts);

  if (!account) return null;

  // Filtrar tarjetas vinculadas a la cuenta seleccionada
  const linkedCards = accounts.filter(
    (acc) => acc.type === "credit" && acc.account_linked === account.id
  );

  // Filtrar tarjetas de crédito que no están vinculadas a ninguna cuenta
  const availableCards = accounts.filter(
    (acc) => acc.type === "credit" && !acc.account_linked
  );

  const handleLinkCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId) return;

    try {
      await dispatch(
        linkAccountThunk({
          accountId: selectedCardId,
          linkedAccountId: account.id,
        })
      ).unwrap();
      setIsModalOpen(false);
      setSelectedCardId("");
    } catch (err) {
      console.error("Error linking card:", err);
    }
  };

  const handleUnlinkCard = async (cardId: string) => {
    if (window.confirm("¿Estás seguro de que deseas desvincular esta tarjeta?")) {
      try {
        await dispatch(unlinkAccountThunk(cardId)).unwrap();
      } catch (err) {
        console.error("Error unlinking card:", err);
      }
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(value);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-medium text-[#1B252D]">
          Tarjetas Ligadas
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="md:hidden w-8 h-8 rounded-full bg-[#f0f2f1] border-2 border-primary-fixed hover:bg-primary-fixed active:scale-95 flex items-center justify-center text-[#1B252D] cursor-pointer transition-all duration-200"
          aria-label="Vincular Tarjeta"
        >
          <PlusIcon size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {linkedCards.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between p-3 sm:p-4 bg-[#fbfdfc] border-2 border-outline-variant/30 rounded-xl gap-2 hover:border-primary-fixed cursor-pointer transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#f0f2f1] rounded-lg flex items-center justify-center text-[#424943] shrink-0">
                <CreditCardIcon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] sm:text-[15px] font-bold text-[#1B252D] truncate">
                  {card.name}
                </p>
                <p className="text-[11px] sm:text-xs text-[#727972] mt-0.5 truncate">
                  Tarjeta de Crédito
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-[8px] sm:text-[9px] font-bold text-[#ba1a1a] uppercase tracking-wider mb-1">
                  Saldo Tarjeta
                </p>
                <p className="text-[14px] sm:text-[16px] font-bold text-[#ba1a1a] tabular-nums">
                  {formatCurrency(card.balance)}
                </p>
              </div>
              <button
                onClick={() => handleUnlinkCard(card.id)}
                className="w-9 h-9 rounded-lg hover:bg-red-50 text-[#ba1a1a] flex items-center justify-center cursor-pointer transition-colors"
                title="Desvincular Tarjeta"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          </div>
        ))}

        {/* Botón de Vincular Tarjeta (Dasheado) */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex group items-center justify-between p-3 sm:p-4 bg-[#fbfdfc]/50 border-2 border-dashed border-outline-variant/50 rounded-xl gap-2 hover:border-primary-fixed hover:bg-[#fbfdfc] cursor-pointer transition-all duration-300 hover:shadow-md"
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
        </div>
      </div>

      {/* Modal para Vincular Tarjeta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-outline-variant/30 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 mx-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <h3 className="text-lg font-bold text-[#1B252D]">
                Vincular Tarjeta de Crédito
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedCardId("");
                }}
                className="text-gray-500 hover:text-black text-xl cursor-pointer p-1"
              >
                &times;
              </button>
            </div>

            {availableCards.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No hay tarjetas de crédito disponibles para vincular.
              </div>
            ) : (
              <form onSubmit={handleLinkCard} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-600">
                    Seleccionar Tarjeta
                  </label>
                  <select
                    required
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 bg-white text-black focus:outline-none focus:border-[#006b3a] transition-all"
                  >
                    <option value="">-- Elige una tarjeta --</option>
                    {availableCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} ({formatCurrency(card.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedCardId("");
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#006b3a] hover:bg-[#005a30] text-white text-[13px] font-bold px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
                  >
                    Vincular
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
