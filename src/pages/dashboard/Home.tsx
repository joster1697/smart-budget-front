import {
  IconBuildingBank,
  IconPigMoney,
  IconTrendingUp,
  IconLeaf,
  IconHistory,
  IconShoppingCart,
  IconCash,
  IconToolsKitchen2,
  IconDeviceTv,
  IconBulb,
  IconCalendarEvent
} from "@tabler/icons-react";
import AIChatBubble from "../../components/dashboard/AIChatBubble";
import AccountCard from "../../components/dashboard/AccountCard";
import ActivityItem from "../../components/dashboard/ActivityItem";
import PaymentCard from "../../components/dashboard/PaymentCard";

export default function Home() {
  return (
    <section className="flex flex-col gap-6">
      {/* Greeting Card */}
      <AIChatBubble 
        message="¡Hola de nuevo, Jorge! He preparado el resumen de tu arquitectura patrimonial hoy." 
      />

      {/* Cuentas */}
      <div>
        <div className="flex justify-between items-end mb-3 px-1">
          <h2 className="text-[22px] font-black tracking-tight text-on-surface font-manrope">Cuentas</h2>
          <button className="text-xs font-bold text-[#005226] hover:opacity-80">Ver todas</button>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-5">
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
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Actividad Reciente */}
        <div className="flex-1 bg-surface-container-lowest rounded-[28px] p-6 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-black tracking-tight text-[#001f26] font-manrope">Actividad Reciente</h2>
            <IconHistory size={22} className="text-outline" />
          </div>
          <div className="space-y-5">
            <ActivityItem 
              icon={<IconShoppingCart size={20} className="text-on-surface-variant" />}
              title="Supermercado El Sol"
              date="Hoy, 10:45 AM"
              amount="$1,450.00"
            />
            <ActivityItem 
              icon={<IconCash size={20} className="text-[#005226]" />}
              title="Transferencia Recibida"
              date="Ayer"
              amount="$12,000.00"
              isNegative={false}
              iconBgClass="bg-primary-container/40"
            />
            <ActivityItem 
              icon={<IconToolsKitchen2 size={20} className="text-on-surface-variant" />}
              title="Restaurante La Noche"
              date="Ayer"
              amount="$2,890.00"
            />
            <ActivityItem 
              icon={<IconDeviceTv size={20} className="text-on-surface-variant" />}
              title="Suscripción Streaming"
              date="24 Oct"
              amount="$199.00"
            />
            <ActivityItem 
              icon={<IconBulb size={20} className="text-on-surface-variant" />}
              title="Pago de Luz"
              date="22 Oct"
              amount="$840.00"
            />
          </div>
          <div className="mt-6 text-center">
            <button className="text-[13px] font-bold text-[#005226] hover:opacity-80">Ver toda la actividad &gt;</button>
          </div>
        </div>

        {/* Próximos Pagos */}
        <div className="flex-1 bg-surface-container-lowest rounded-[28px] p-6 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-black tracking-tight text-[#001f26] font-manrope">Próximos Pagos</h2>
            <IconCalendarEvent size={22} className="text-[#005226]" />
          </div>
          <div className="space-y-3">
            <PaymentCard day="15" month="OCT" title="Tarjeta de Crédito Oro" amount="$12,400.00" />
            <PaymentCard day="18" month="OCT" title="Seguro de Auto" amount="$3,200.00" />
            <PaymentCard day="22" month="OCT" title="Mantenimiento Depto" amount="$1,500.00" />
            <PaymentCard day="01" month="NOV" title="Hipoteca" amount="$18,000.00" />
            <PaymentCard day="05" month="NOV" title="Colegiatura" amount="$8,500.00" />
          </div>
        </div>
      </div>
    </section>
  );
}
