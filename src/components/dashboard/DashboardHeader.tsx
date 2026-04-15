import { IconBellFilled } from "@tabler/icons-react";

export default function DashboardHeader() {
  return (
    <header className="bg-on-primary text-primary fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed shadow-sm">
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq04dS_0SAaG2Yicvf4lUJvRsMMnLpwFFDgAkuF4Ldo1HeoNU1kj-1-LzCAU9O5EDDCRyJRVyVZ5k9Jk4vmi5t2Dv2RExMBsMlHDQ7UmRESbd69MHhE_6ib8GIrAN9w8DFY577K3-axZKsoF7JKKfQrcU6Jn1IyIskmVChMuvUEUKmC_GH5RtF9hex4GRPi8q1kDjfkbj1lbos20RItuvhq1G6ZM0Z0luBu-p_2qlh7rkuHKPz5vZBQloyYtacunEZ_nS7qhoaO3-g"
          />
        </div>
        <h1 className="text-xl font-black tracking-tighter font-manrope">
          Emerald Zenith
        </h1>
      </div>
      <button className="active:scale-95 duration-150 hover:opacity-80 transition-opacity">
        <IconBellFilled size={24} className="text-primary" />
      </button>
    </header>
  );
}
