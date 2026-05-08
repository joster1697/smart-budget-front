import { IconSend, IconMicrophone } from "@tabler/icons-react";

export default function DesktopChatInput() {
  return (
    <div className="hidden lg:flex fixed bottom-8 left-[calc(50%+140px)] -translate-x-1/2 w-full max-w-3xl z-50">
      <div className="w-full bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-outline-variant/10 p-1.5 flex items-center gap-3 relative transition-all hover:shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
        <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary shadow-sm hover:brightness-110 transition-all active:scale-95">
          <IconMicrophone size={24} />
        </button>
        <input 
          type="text" 
          placeholder="Pregúntale a Fynkro sobre tu portafolio..." 
          className="flex-1 bg-transparent outline-none text-on-surface font-medium placeholder:text-on-surface-variant/60 text-[15px]"
        />
        <button className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center shrink-0 text-on-surface-variant hover:bg-surface-variant/50 transition-all active:scale-95 mr-1">
          <IconSend size={24} className="opacity-70" />
        </button>
      </div>
    </div>
  );
}
