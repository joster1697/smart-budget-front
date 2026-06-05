import { ReactNode } from "react";
import { IconRobot } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface AIChatBubbleProps {
  message: string | ReactNode;
  icon?: ReactNode;
  className?: string;
  layoutId?: string;
  title?: string;
  actions?: ReactNode;
}

export default function AIChatBubble({ message, icon, className = "", layoutId, title, actions }: AIChatBubbleProps) {
  return (
    <div className={`flex flex-col gap-2.5 w-full lg:max-w-3xl ${className}`}>
      <motion.div 
        layoutId={layoutId}
        className="flex gap-2.5 sm:gap-4 items-start w-full"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
          {icon || <IconRobot size={24} className="text-on-primary" />}
        </div>
        <div className="bg-surface-container-lowest rounded-2xl rounded-tl-sm p-3.5 sm:p-4 shadow-sm border border-outline-variant/20 flex-1 min-w-0 flex flex-col gap-3">
          <div>
            {title && (
              <div className="text-[10px] font-black uppercase tracking-widest text-[#005226] mb-1.5 select-none">
                {title}
              </div>
            )}
            <div className="text-sm font-medium text-on-surface leading-snug break-words">
              {typeof message === "string" ? <p className="whitespace-pre-line">{message}</p> : message}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2.5 flex-wrap w-full pt-3 border-t border-outline-variant/10">
              {actions}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
