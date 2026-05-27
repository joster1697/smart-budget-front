import {
  IconToolsKitchen2,
  IconCar,
  IconHome,
  IconDeviceTv,
  IconMedicalCross,
  IconChartPie,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";

export interface BudgetCategoryData {
  id: string;
  name: string;
  allocated_amount: number;
  original_allocated_amount: number;
  spent_amount: number;
  usage_percentage: number;
  is_exceeded: boolean;
}

interface BudgetCategoryCardProps {
  category: BudgetCategoryData;
  canEdit: boolean;
  isActive: boolean;
  plannedIncome: number;
  onAllocationChange: (categoryId: string, amount: number) => void;
  formatCurrency: (amount: number) => string;
}

const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("aliment") || lowerName.includes("comida")) return <IconToolsKitchen2 size={24} className="text-[#005226]" />;
  if (lowerName.includes("transport") || lowerName.includes("auto")) return <IconCar size={24} className="text-[#005226]" />;
  if (lowerName.includes("vivienda") || lowerName.includes("hogar")) return <IconHome size={24} className="text-[#005226]" />;
  if (lowerName.includes("entretenimiento") || lowerName.includes("ocio")) return <IconDeviceTv size={24} className="text-[#005226]" />;
  if (lowerName.includes("salud") || lowerName.includes("medic")) return <IconMedicalCross size={24} className="text-[#005226]" />;
  return <IconChartPie size={24} className="text-[#005226]" />;
};

export default function BudgetCategoryCard({
  category,
  canEdit,
  isActive,
  plannedIncome,
  onAllocationChange,
  formatCurrency,
}: BudgetCategoryCardProps) {
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAllocationChange(category.id, Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAllocationChange(category.id, Number(e.target.value));
  };

  return (
    <div className={`flex flex-col justify-between bg-surface-container-lowest rounded-[24px] p-5 shadow-sm border transition-all duration-300 ${canEdit ? 'border-[#005226]/30 bg-surface-container-low/20 shadow-md scale-[1.01]' : 'border-outline-variant/20'}`}>
      <div className="flex flex-col mb-4">
        <div className="flex flex-wrap justify-between items-center gap-x-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-primary-container/30 p-2 rounded-xl shrink-0">
              {getCategoryIcon(category.name)}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-lg text-on-surface truncate" title={category.name}>{category.name}</h4>
            </div>
          </div>

          {canEdit ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-outline font-medium">₡</span>
              <input
                type="number"
                value={category.allocated_amount || ""}
                onChange={handleInputChange}
                className="w-24 bg-surface-container border border-outline-variant/30 rounded-lg px-2 py-1 text-right text-on-surface font-bold focus:outline-none focus:ring-1 focus:ring-[#005226]"
                placeholder="0"
              />
            </div>
          ) : (
            <div className="text-left sm:text-right shrink-0 whitespace-nowrap">
              <span className="text-xs text-outline font-medium">Límite:</span>
              <span className="ml-2 font-bold text-on-surface">{formatCurrency(category.allocated_amount)}</span>
            </div>
          )}
        </div>

        {isActive && category.original_allocated_amount !== category.allocated_amount && (
          <div className={`w-fit text-[10px] font-bold px-2 py-0.5 rounded-full flex items-start gap-1 mt-1 ${category.allocated_amount > category.original_allocated_amount ? 'bg-error/10 text-error' : 'bg-[#008f43]/10 text-[#008f43]'}`}>
            <span className="shrink-0 mt-[2px]">
              {category.allocated_amount > category.original_allocated_amount ? <IconArrowUp size={10} /> : <IconArrowDown size={10} />}
            </span>
            <span className="leading-tight">
              {formatCurrency(Math.abs(category.allocated_amount - category.original_allocated_amount))} ajustado (Orig: {formatCurrency(category.original_allocated_amount)})
            </span>
          </div>
        )}
      </div>

      {canEdit ? (
        <div className="mt-4 mb-2">
          <div className="flex justify-between text-xs text-outline mb-1">
            <span>$0</span>
            <span>{formatCurrency(plannedIncome)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={plannedIncome > 0 ? plannedIncome : 1000}
            step="1000"
            value={category.allocated_amount}
            onChange={handleRangeChange}
            className="budget-slider cursor-pointer"
          />
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm mb-2">
            <span className="text-outline font-medium truncate">
              {formatCurrency(category.spent_amount)} de {formatCurrency(category.allocated_amount)} gastado
            </span>
            <span className="font-bold text-on-surface">{Math.round(category.usage_percentage)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${category.is_exceeded ? 'bg-error' : 'bg-[#008f43]'}`}
              style={{ width: `${Math.min(category.usage_percentage, 100)}%` }}
            ></div>
          </div>
          {category.is_exceeded && (
            <p className="text-error text-xs mt-2 font-medium">Has excedido el presupuesto para esta categoría.</p>
          )}
        </div>
      )}
    </div>
  );
}
