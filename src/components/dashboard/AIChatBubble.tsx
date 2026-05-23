import { ReactNode } from "react";
import { IconRobot } from "@tabler/icons-react";
import { motion } from "framer-motion";

interface AIChatBubbleProps {
  message: string | ReactNode;
  icon?: ReactNode;
  className?: string;
  layoutId?: string;
}

export default function AIChatBubble({ message, icon, className = "", layoutId }: AIChatBubbleProps) {
  return (
    <motion.div 
      layoutId={layoutId}
      className={`flex gap-4 items-start lg:max-w-3xl ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
        {icon || <IconRobot size={28} className="text-on-primary" />}
      </div>
      <div className="bg-surface-container-lowest rounded-2xl rounded-tl-sm p-4 shadow-sm border border-outline-variant/20 flex-1 min-w-0">
        <div className="text-sm font-medium text-on-surface leading-snug break-words">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>
      </div>
    </motion.div>
  );
}
