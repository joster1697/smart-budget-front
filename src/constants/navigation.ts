import { 
  IconLayoutDashboard, 
  IconWallet, 
  IconReceipt, 
  IconBrain, 
  IconMessageChatbot 
} from "@tabler/icons-react";

export const NAV_ITEMS = [
  { 
    to: "/dashboard/home", 
    icon: IconLayoutDashboard, 
    sidebarLabel: "Mastery", 
    mobileLabel: "Resumen de mi cuenta" 
  },
  { 
    to: "/dashboard/accounts", 
    icon: IconWallet, 
    sidebarLabel: "Accounts", 
    mobileLabel: "Ver mis cuentas" 
  },
  { 
    to: "/dashboard/activity", 
    icon: IconReceipt, 
    sidebarLabel: "Payments", 
    mobileLabel: "Pagos y facturas" 
  },
  { 
    to: "/dashboard/reports", 
    icon: IconBrain, 
    sidebarLabel: "Intelligence", 
    mobileLabel: "Análisis inteligente" 
  },
  { 
    to: "/dashboard/chat", 
    icon: IconMessageChatbot, 
    sidebarLabel: "Chat", 
    mobileLabel: "Ver mi conversación" 
  },
];
