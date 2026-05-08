import { useEffect, useRef } from "react";
import { useAppSelector } from "../../store/hooks";
import AIChatBubble from "../../components/dashboard/AIChatBubble";
import UserChatBubble from "../../components/dashboard/UserChatBubble";
import ActionInlineButtons from "../../components/dashboard/ActionInlineButtons";
import { IconLoader2 } from "@tabler/icons-react";

export default function Chat() {
  const { messages, isThinking, pendingActions } = useAppSelector((state) => state.chat);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking, pendingActions]);

  return (
    <div className="flex flex-col h-full bg-background rounded-3xl p-4 lg:p-6 pb-32 overflow-y-auto">
      <div className="flex flex-col gap-6 flex-1 max-w-4xl mx-auto w-full">
        {/* Empty state if no messages */}
        {messages.length === 0 && !isThinking && (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant/60">
            <p className="text-lg font-medium">Comienza a chatear con Fynkro</p>
          </div>
        )}

        {/* Message History */}
        {messages.map((msg) => (
          msg.sender === "user" ? (
            <UserChatBubble key={msg.id} message={msg.text} />
          ) : (
            <AIChatBubble key={msg.id} message={msg.text} />
          )
        ))}

        {/* Pending Actions */}
        {pendingActions.length > 0 && (
          <div className="flex flex-col gap-4">
            {pendingActions.map((action, index) => (
              <div key={`action-${index}`} className="flex gap-4 items-start max-w-[90%] lg:max-w-3xl">
                {/* Visual anchor matching AI bubble */}
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="flex-1">
                  <ActionInlineButtons action={action} actionIndex={index} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-4 items-start max-w-[90%] lg:max-w-3xl opacity-70">
            <div className="w-12 h-12 rounded-2xl bg-surface-variant flex items-center justify-center shrink-0">
              <IconLoader2 size={24} className="animate-spin text-on-surface-variant" />
            </div>
            <div className="bg-surface-container-lowest rounded-2xl rounded-tl-sm p-4 shadow-sm border border-outline-variant/20 flex items-center h-12">
               <span className="text-sm font-medium text-on-surface-variant animate-pulse">Escribiendo...</span>
            </div>
          </div>
        )}
        
        {/* Dummy div to anchor auto-scroll */}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
