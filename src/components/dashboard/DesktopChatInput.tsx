import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconSend, IconMicrophone } from "@tabler/icons-react";
import { useAgentChat } from "../../hooks/useAgentChat";
import { useAppSelector } from "../../store/hooks";

export default function DesktopChatInput() {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const { sendMessage } = useAgentChat();
  const isThinking = useAppSelector((state) => state.chat.isThinking);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    // Send the message
    sendMessage(inputValue);
    setInputValue("");
    
    // Redirect seamlessly to the chat page
    navigate("/dashboard/chat");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="hidden lg:flex fixed bottom-8 left-[calc(50%+140px)] -translate-x-1/2 w-full max-w-3xl z-50">
      <div className={`w-full bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-outline-variant/10 p-1.5 flex items-center gap-3 relative transition-all hover:shadow-[0_10px_40px_rgba(0,0,0,0.12)] ${isThinking ? 'opacity-70 pointer-events-none' : ''}`}>
        <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary shadow-sm hover:brightness-110 transition-all active:scale-95">
          <IconMicrophone size={24} />
        </button>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregúntale a Fynkro sobre tu portafolio..." 
          className="flex-1 bg-transparent outline-none text-on-surface font-medium placeholder:text-on-surface-variant/60 text-[15px]"
          disabled={isThinking}
        />
        <button 
          onClick={() => handleSubmit()}
          disabled={!inputValue.trim() || isThinking}
          className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center shrink-0 text-on-surface-variant hover:bg-surface-variant/50 transition-all active:scale-95 mr-1 disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <IconSend size={24} className={inputValue.trim() ? "text-primary" : "opacity-70"} />
        </button>
      </div>
    </div>
  );
}
