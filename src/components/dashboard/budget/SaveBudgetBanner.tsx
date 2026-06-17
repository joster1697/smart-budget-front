import { IconDeviceFloppy } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { use, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../ui/Button";
import { BudgetContext } from "./BudgetContext";
import { useTranslation } from "react-i18next";

interface OutletContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function SaveBudgetBanner() {
  const { t } = useTranslation();
  const context = use(BudgetContext);
  const outletContext = useOutletContext<OutletContextType>() || { isCollapsed: true };
  const wasVisibleRef = useRef(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  if (!context) return null;

  const { state, actions } = context;
  const {
    isDraft,
    monthYearStr,
    remainingToAllocate,
    isPastMonth,
    capitalizedMonth,
    loading,
    hasUnsavedChanges,
    budgetCategories,
  } = state;
  const { handleSaveBudget, handleActivateBudget, formatCurrency } = actions;

  const isVisible = (!loading && (hasUnsavedChanges || isDraft) && budgetCategories.length > 0);

  // Collapse the bottom navbar automatically only on the initial appearance of the banner
  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) {
      if (!outletContext.isCollapsed && outletContext.setIsCollapsed) {
        outletContext.setIsCollapsed(true);
      }
    }
    wasVisibleRef.current = isVisible;
  }, [isVisible, outletContext.isCollapsed, outletContext.setIsCollapsed]);

  // Dynamically measure own height and expose it as a CSS variable on the root document element
  useEffect(() => {
    if (isVisible && bannerRef.current) {
      const updateHeight = () => {
        const height = bannerRef.current?.getBoundingClientRect().height || 0;
        document.documentElement.style.setProperty("--banner-height", `${height}px`);
      };

      updateHeight();

      const observer = new ResizeObserver(updateHeight);
      observer.observe(bannerRef.current);

      return () => {
        observer.disconnect();
        document.documentElement.style.setProperty("--banner-height", "0px");
      };
    } else {
      document.documentElement.style.setProperty("--banner-height", "0px");
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      ref={bannerRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{ bottom: "calc(var(--bottom-spacing, 70px) + 12px)" }}
      className="fixed left-4 right-4 lg:left-[calc(50%+140px)] lg:-translate-x-1/2 lg:right-auto lg:w-full lg:max-w-3xl z-[55] bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/30 px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-6"
    >
      <div className="flex flex-row md:flex-col justify-between items-center md:items-start gap-2 mr-0 md:mr-2">
        <span className="text-[10px] md:text-xs text-outline font-bold uppercase tracking-wider capitalize select-none">
          {isDraft ? t("budget.draftTitle", { month: monthYearStr }) : t("budget.adjust", { month: monthYearStr })}
        </span>
        <span className="text-xs md:text-sm font-bold text-on-surface">
          {t("budget.toAllocate", { amount: formatCurrency(remainingToAllocate) })}
        </span>
      </div>

      {isDraft ? (
        <div className="flex items-center justify-between md:justify-start gap-4 md:gap-3 w-full md:w-auto">
          <button
            onClick={handleSaveBudget}
            disabled={loading || !hasUnsavedChanges}
            className="flex items-center justify-center gap-2 text-sm font-bold text-on-surface hover:text-primary transition-colors disabled:opacity-50 py-2 px-3 hover:bg-surface-container rounded-xl md:rounded-none md:p-0 cursor-pointer border-none bg-transparent"
          >
            <IconDeviceFloppy size={18} /> {t("common.save")}
          </button>
          <div className="hidden md:block w-[1px] h-6 bg-outline-variant/30"></div>
          {isPastMonth ? (
            <span className="text-xs text-outline italic px-2">{t("budget.notEditable")}</span>
          ) : (
            <Button variant="primary" size="sm" onClick={handleActivateBudget} loading={loading}>
              {t("budget.activateMonth", { month: capitalizedMonth })}
            </Button>
          )}
        </div>
      ) : (
        <Button variant="primary" size="sm" onClick={handleSaveBudget} loading={loading}>
          {t("budget.saveMonth", { month: capitalizedMonth })}
        </Button>
      )}
    </motion.div>
  );
}
