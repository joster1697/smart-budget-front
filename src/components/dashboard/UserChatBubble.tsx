import { ReactNode } from "react";
import { IconUser } from "@tabler/icons-react";

interface UserChatBubbleProps {
  message: string | ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function UserChatBubble({ message, icon, className = "" }: UserChatBubbleProps) {
  return (
    <div className={`flex gap-4 items-start justify-end w-full ${className}`}>
      <div className="bg-primary-container rounded-2xl rounded-tr-sm p-4 shadow-sm max-w-[80%] lg:max-w-[70%] min-w-0">
        <div className="text-sm font-medium text-on-primary-container leading-snug break-words">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center shrink-0 shadow-sm border border-outline-variant/30">
        {icon || <IconUser size={20} className="text-on-surface-variant" />}
      </div>
    </div>
  );
}
