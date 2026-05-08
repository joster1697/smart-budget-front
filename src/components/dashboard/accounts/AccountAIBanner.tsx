import AIChatBubble from "../AIChatBubble";
import { IconRobot } from "@tabler/icons-react";

export default function AccountAIBanner() {
  const message =
    "Selecciona una de tus cuentas para profundizar en su análisis patrimonial y opciones de gestión.";

  return (
    <AIChatBubble
      message={message}
      icon={<IconRobot size={24} className="text-on-primary" />}
    />
  );
}
