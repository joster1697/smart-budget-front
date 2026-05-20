import { LockIcon } from "../../ui/Icons";
interface DangerZoneProps {
  account?: any;
}

export default function DangerZone({ account }: DangerZoneProps) {
  if (!account) return null;
  return (
    <div className="flex flex-col gap-5 mt-8">
      <div className="h-px w-full bg-[#f2dfdf] mb-1"></div>

      <div className="flex items-center gap-2.5">
        <LockIcon size={20} className="text-[#ba1a1a]" />
        <h3 className="text-[19px] font-normal text-[#1B252D]">Danger Zone</h3>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#fdfaf9] border border-[#f5dbda] rounded-xl p-5 gap-6">
        <div className="flex-1 pr-4">
          <p className="text-[15px] font-bold text-[#1B252D]">
            Archive or Delete Account
          </p>
          <p className="text-[14px] text-[#424943] mt-1.5 leading-relaxed">
            This action is permanent and will remove all transaction history and
            analytics for this account.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-2 bg-[#e4e6e5]/40 border border-[#c4c7c5] px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[#e4e6e5]/60 transition-colors">
            <input
              type="checkbox"
              className="w-4 h-4 rounded-sm border-outline-variant bg-transparent accent-primary"
            />
            <span className="text-[12px] font-medium leading-tight text-[#1B252D]">
              Confirm
              <br />
              Action
            </span>
          </label>
          <button className="px-6 py-3.5 bg-[#db8b88] text-white rounded-lg text-[14px] font-bold hover:brightness-95 transition-colors leading-tight">
            Delete
            <br />
            Account
          </button>
        </div>
      </div>
    </div>
  );
}
