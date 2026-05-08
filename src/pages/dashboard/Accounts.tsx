import AccountHeader from "../../components/dashboard/accounts/AccountHeader";
import AccountAIBanner from "../../components/dashboard/accounts/AccountAIBanner";
import AccountCard from "../../components/dashboard/AccountCard";
import AccountDetails from "../../components/dashboard/accounts/AccountDetails";
import PrimaryCheckingAnalysis from "../../components/dashboard/accounts/PrimaryCheckingAnalysis";
import LinkedCreditCards from "../../components/dashboard/accounts/LinkedCreditCards";
import SmartTools from "../../components/dashboard/accounts/SmartTools";
import DangerZone from "../../components/dashboard/accounts/DangerZone";

import {
  IconBuildingBank,
  IconPigMoney,
  IconTrendingUp,
  IconLeaf,
} from "@tabler/icons-react";

export default function Accounts() {
  return (
    <div className="flex flex-col gap-6 pb-20 pt-4 px-4 sm:px-6 w-full">
      <AccountAIBanner />
      <AccountHeader />

      {/* Grid de tarjetas igual al de Home.tsx */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5 mt-4 mb-4">
        <AccountCard
          title="Primary Checking"
          icon={<IconBuildingBank size={18} />}
          balance="$124,500.00"
          virtualBalance="$127,488.00"
        />
        <AccountCard
          title="Virtual Savings"
          icon={<IconPigMoney size={18} />}
          balance="$45,200.00"
          virtualBalance="$66,500.00"
        />
        <AccountCard
          title="Investment"
          icon={<IconTrendingUp size={18} />}
          balance="$312,850.00"
          virtualBalance="$338,200.00"
          isDark
        />
        <AccountCard
          title="Retirement Fund"
          icon={<IconLeaf size={18} />}
          balance="$89,400.00"
          virtualBalance="$92,100.00"
        />
      </div>

      <PrimaryCheckingAnalysis />
      <AccountDetails />
      <LinkedCreditCards />
      <SmartTools />
      <DangerZone />
    </div>
  );
}
