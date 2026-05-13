import { IconSend, IconPlus } from "@tabler/icons-react";

export default function AccountChatInput() {
  return (
    <div className="mt-8 mb-4">
      <div className="w-full bg-[#fcfcfc] rounded-xl border border-outline-variant/30 p-2 flex items-center gap-3 relative shadow-sm">
        <button className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[#1B252D] hover:bg-surface-container transition-all">
          <IconPlus size={22} className="opacity-80" />
        </button>
        <input 
          type="text" 
          placeholder="Ask Vault AI to analyze trends or adjust settings..." 
          className="flex-1 bg-transparent outline-none text-[#1B252D] font-medium placeholder:text-[#a0a5a1] text-[15px]"
        />
        <button className="w-11 h-11 rounded-lg bg-[#2ae574] flex items-center justify-center shrink-0 text-[#1B252D] shadow-sm hover:brightness-110 transition-all">
          <IconSend size={22} />
        </button>
      </div>
    </div>
  );
}
