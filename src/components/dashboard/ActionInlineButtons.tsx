import { IconCheck, IconX, IconListDetails } from "@tabler/icons-react";
import { ResolvedAction } from "../../types/chat";
import { useAgentChat } from "../../hooks/useAgentChat";

interface ActionInlineButtonsProps {
  action: ResolvedAction;
  actionIndex: number;
}

export default function ActionInlineButtons({ action, actionIndex }: ActionInlineButtonsProps) {
  const { confirmAction, selectAction, cancelActions } = useAgentChat();

  const handleConfirm = () => {
    confirmAction(actionIndex);
  };

  const handleCancel = () => {
    cancelActions();
  };

  const hasCandidates = action.candidates && action.candidates.length > 0;
  const isAmbiguous = action.status === "AMBIGUOUS";
  const shouldShowCandidates = isAmbiguous && hasCandidates;

  return (
    <div className="mt-3 flex flex-col gap-2 bg-surface-variant/30 rounded-xl p-3 border border-outline-variant/50">
      {action.description && (
        <p className="text-sm text-on-surface-variant font-medium">{action.description}</p>
      )}
      {action.question && (
        <p className="text-sm font-bold text-on-surface mb-1">{action.question}</p>
      )}

      {shouldShowCandidates ? (
        <div className="flex flex-col gap-2">
          {action.candidates?.map((candidate: any, candidateIdx) => {
            const candidateName = candidate.name || candidate.title || candidate.description || `Opción ${candidateIdx + 1}`;
            return (
              <button
                key={candidateIdx}
                onClick={() => selectAction(actionIndex, candidateIdx, candidateName)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-on-surface rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors border border-outline-variant/30 text-left"
              >
                <IconListDetails size={16} className="text-primary opacity-70 shrink-0" />
                <span className="flex-1 truncate">
                  {candidateName}
                </span>
              </button>
            );
          })}
          <button
            onClick={handleCancel}
            className="flex items-center justify-center gap-2 px-4 py-2 mt-1 text-error hover:bg-error/10 rounded-lg text-sm font-medium transition-colors"
          >
            <IconX size={16} />
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:brightness-110 transition-all active:scale-95 shadow-sm"
          >
            <IconCheck size={18} />
            Confirmar
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-surface-variant text-on-surface-variant rounded-lg text-sm font-bold hover:bg-surface-variant/80 transition-all active:scale-95"
          >
            <IconX size={18} />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
