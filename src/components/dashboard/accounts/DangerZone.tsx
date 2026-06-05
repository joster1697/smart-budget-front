import { useState } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { deleteCreatedAccount } from "../../../store/slices/accountsSlice";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";

interface DangerZoneProps {
  account?: any;
}

export default function DangerZone({ account }: DangerZoneProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    if (!account || confirmInput !== "ELIMINAR") return;
    setIsDeleting(true);
    try {
      await dispatch(deleteCreatedAccount(account.id)).unwrap();
      setIsConfirmed(false);
      setConfirmInput("");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setConfirmInput("");
  };

  if (!account) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#fdfaf9] border border-[#f5dbda] rounded-2xl rounded-tl-sm p-5 gap-6 shadow-sm">
        <div className="flex items-start gap-3 flex-1 pr-0 sm:pr-4">
          <IconAlertTriangle className="text-error shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-[15px] font-bold text-[#1B252D]">
              Eliminar Cuenta:{" "}
              <span className="text-[15px] font-extrabold underline text-error">
                {account.name}
              </span>
            </p>
            <p className="text-[13px] text-[#424943] mt-1.5 leading-relaxed">
              Esta acción es permanente y eliminará todo el historial de transacciones y
              análisis de esta cuenta.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch justify-center w-full sm:w-auto gap-3 shrink-0">
          <label className="flex items-center justify-center gap-2 bg-[#e4e6e5]/40 border border-[#c4c7c5] px-4 py-3.5 rounded-xl cursor-pointer hover:bg-[#e4e6e5]/60 transition-colors select-none w-full sm:w-auto">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant bg-transparent accent-[#ba1a1a]"
            />
            <span className="text-[12px] font-bold text-[#1B252D] whitespace-nowrap">
              Confirmar Acción
            </span>
          </label>
          <button
            onClick={() => isConfirmed && setIsModalOpen(true)}
            disabled={!isConfirmed}
            className={`px-6 py-3.5 rounded-xl text-[13px] font-extrabold transition-all duration-200 whitespace-nowrap leading-none w-full sm:w-auto flex items-center justify-center ${isConfirmed
                ? "bg-error hover:bg-[#931010] text-white cursor-pointer shadow-sm active:scale-95"
                : "bg-[#e4e6e5]/40 border border-outline-variant/30 text-[#424943]/40 cursor-not-allowed opacity-60"
              }`}
          >
            Eliminar Cuenta
          </button>
        </div>
      </div>

      {/* Modal de Doble Confirmación de Seguridad */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-[#f5dbda] rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
              <IconTrash className="text-error shrink-0" size={22} />
              <h3 className="text-lg font-bold text-[#1B252D]">
                ¿Eliminar cuenta permanentemente?
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Estás a punto de eliminar la cuenta{" "}
                <strong className="text-black font-extrabold underline">{account.name}</strong>.
                Esto borrará todos los saldos, tarjetas vinculadas, presupuestos e historial de transacciones asociados.
                <span className="text-error font-bold"> Esta acción no se puede deshacer.</span>
              </p>

              <div className="flex flex-col gap-2 bg-[#fdfaf9] border border-[#f5dbda] rounded-xl p-3.5 mt-1">
                <label className="text-[12px] font-bold text-gray-700">
                  Por favor, escribe <span className="text-error font-black uppercase tracking-wider">ELIMINAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  required
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
                  placeholder="ELIMINAR"
                  className="border border-gray-300 rounded-lg p-2.5 bg-white text-black font-extrabold text-center tracking-widest uppercase focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all text-[14px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmInput !== "ELIMINAR" || isDeleting}
                className={`text-white text-[13px] font-bold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center min-w-[120px] ${confirmInput === "ELIMINAR" && !isDeleting
                    ? "bg-error hover:bg-[#931010] cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
