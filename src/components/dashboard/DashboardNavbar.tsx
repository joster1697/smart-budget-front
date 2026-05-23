import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconMessageCircle, IconSend } from "@tabler/icons-react";
import { useAgentChat } from "../../hooks/useAgentChat";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { NAV_ITEMS } from "../../constants/navigation";
import { addMessage, setThinking } from "../../store/slices/chatSlice";

interface DashboardNavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function DashboardNavbar({ isCollapsed, setIsCollapsed }: DashboardNavbarProps) {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { sendMessage } = useAgentChat();
  const isThinking = useAppSelector((state) => state.chat.isThinking);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    sendMessage(inputValue);
    setInputValue("");

    // Redirect to chat and collapse navbar
    navigate("/dashboard/chat");
    setIsCollapsed(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleChipClick = async (item: typeof NAV_ITEMS[0]) => {
    if (isThinking) return;

    // Case: "Ver mi conversación" (Chat) - Direct redirection
    if (item.to === "/dashboard/chat") {
      setInputValue("");
      setIsCollapsed(true);
      navigate(item.to);
      return;
    }

    // Case: Other sections - Simulation flow
    setInputValue("");
    setIsCollapsed(true);

    // 2. Immediate jump to chat to show the interaction
    navigate("/dashboard/chat");

    // 3. Add user message
    dispatch(addMessage({
      id: Math.random().toString(),
      sender: "user",
      text: item.mobileLabel || "",
      timestamp: new Date().toISOString()
    }));

    // 4. Start thinking effect
    dispatch(setThinking(true));

    // 5. Short delay for the first response (Greeting)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    dispatch(addMessage({
      id: Math.random().toString(),
      sender: "agent",
      text: item.greeting || "",
      timestamp: new Date().toISOString()
    }));

    // 6. Keep thinking a bit more before showing content
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 7. Final navigation to the actual section
    navigate(item.to);
    
    // Ensure we scroll to the top to see the agent's message/greeting clearly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    dispatch(setThinking(false));
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-5 pb-8 pt-3 flex flex-col gap-4 transition-all duration-500 ease-in-out ${isCollapsed ? "translate-y-[calc(100%-70px)]" : "translate-y-0"
        }`}
    >
      {/* Handle / Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex flex-col items-center justify-center -mt-1 py-1 w-full active:opacity-60 transition-opacity"
      >
        <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mb-1" />
        {isCollapsed && (
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider animate-pulse">
            <IconMessageCircle size={18} />
            <span>Preguntar a Fynkro</span>
          </div>
        )}
      </button>

      {/* Content */}
      <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {/* Input */}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            placeholder="Pregúntale a Fynkro..."
            className="w-full bg-surface border border-outline-variant/30 rounded-full py-3.5 pl-5 pr-14 text-[13px] outline-none placeholder:text-outline shadow-sm focus:border-primary/50 transition-colors text-on-surface font-medium disabled:opacity-50"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!inputValue.trim() || isThinking}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#005226] text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
          >
            <IconSend size={18} className="-ml-0.5" />
          </button>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2.5 pb-1">
          {NAV_ITEMS.filter(item => item.mobileLabel).map((item) => (
            <button
              key={item.to}
              onClick={() => handleChipClick(item)}
              className={`whitespace-nowrap px-4 py-2 font-bold text-[11px] rounded-full uppercase tracking-wider active:scale-95 transition-transform 
              ${item.to === "/dashboard/home" ? "bg-[#d1efdc] text-[#005226]" : "bg-surface-variant/60 text-on-surface-variant"}`}
            >
              {item.mobileLabel}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
