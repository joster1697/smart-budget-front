import { BankIcon } from "../../components/ui/Icons";

export default function Home() {
  return (
    <section className="flex-col mt-4">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 px-1">
          Wealth Overview
        </h2>
        <div className="relative bg-inverse-surface text-surface aspect-[2/1] rounded-xl p-5">
          <p className="text-sm font-medium text-secondary-fixed-dim">
            Total Balance
          </p>
          <p className="text-3xl font-black tracking-tight mt-1">
            $142,580.00
          </p>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BankIcon size={100} className="text-surface" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div className="shadow-sm bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
          <p className="text-xs font-medium text-on-surface-variant">Savings</p>
          <p className="text-lg font-bold text-on-surface mt-1">$42,900</p>
        </div>
        <div className="shadow-sm bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
          <p className="text-xs font-medium text-on-surface-variant">
            Monthly Income
          </p>
          <p className="text-lg font-bold text-on-surface mt-1">$12,000</p>
        </div>
        <div className="shadow-sm bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
          <p className="text-xs font-medium text-on-surface-variant">
            Total Expenses
          </p>
          <p className="text-lg font-bold text-on-surface mt-1">$12,000</p>
        </div>
        <div className="shadow-sm bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
          <p className="text-xs font-medium text-on-surface-variant">
            Amount Saved
          </p>
          <p className="text-lg font-bold text-on-surface mt-1">$12,000</p>
        </div>
      </div>
    </section>
  );
}
