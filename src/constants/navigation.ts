import {
  IconLayoutDashboard,
  IconWallet,
  IconReceipt,
  IconBrain,
  IconMessageChatbot,
  IconChartPie,
} from "@tabler/icons-react";

export const NAV_ITEMS = [
  {
    to: "/dashboard/home",
    icon: IconLayoutDashboard,
    translationKey: "home",
    sidebarLabel: "Home",
    mobileLabel: "Resumen de mi cuenta",
    greeting:
      "¡Hola de nuevo, Jorge! He preparado el resumen de tu arquitectura patrimonial hoy.",
  },
  {
    to: "/dashboard/accounts",
    icon: IconWallet,
    translationKey: "accounts",
    sidebarLabel: "Accounts",
    mobileLabel: "Ver mis cuentas",
    greeting:
      "Claro, aquí tienes el detalle de tus cuentas activas y saldos actuales.",
  },
  {
    to: "/dashboard/transactions",
    icon: IconReceipt,
    translationKey: "transactions",
    sidebarLabel: "Transactions",
    mobileLabel: "Transactions",
    greeting:
      "He revisado tus últimos movimientos y próximos compromisos de pago.",
  },
  {
    to: "/dashboard/reports",
    icon: IconBrain,
    translationKey: "intelligence",
    sidebarLabel: "Intelligence",
    mobileLabel: "Análisis inteligente",
    greeting:
      "Analizando tus patrones de gasto... Aquí tienes mis hallazgos de este mes.",
  },
  {
    to: "/dashboard/chat",
    icon: IconMessageChatbot,
    translationKey: "chat",
    sidebarLabel: "Chat",
    mobileLabel: "Ver mi conversación",
    greeting: "¿En qué más puedo ayudarte hoy?",
  },
  {
    to: "/dashboard/budget",
    icon: IconChartPie,
    translationKey: "budget",
    sidebarLabel: "Budget",
    mobileLabel: "Ver mi presupuesto",
    greeting:
      "Hola, aquí tienes el resumen de tu presupuesto. ¿En qué más te puedo ayudar?",
  },
];
