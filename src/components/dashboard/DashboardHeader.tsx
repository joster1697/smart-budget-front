
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 transition-all duration-500 bg-transparent`}>
      <div className={`flex items-center gap-2 transition-all duration-500 ${isScrolled ? "opacity-0 translate-x-24 pointer-events-none" : "opacity-100 translate-x-0"
        }`}>
        <div className="w-8 h-8 rounded border-2 border-primary bg-primary flex items-center justify-center">
          <span className="text-on-primary font-black text-lg leading-none">F</span>
        </div>
        <h1 className="text-2xl font-black tracking-tighter text-[#005226] font-manrope">
          Fynkro
        </h1>
      </div>

      <div className={`w-10 h-10 rounded-full overflow-hidden transition-all duration-500 border-2 ${isScrolled ? "scale-90 border-primary shadow-lg" : "scale-100 border-transparent shadow-sm"
        }`}>
        <img
          alt="User Profile"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq04dS_0SAaG2Yicvf4lUJvRsMMnLpwFFDgAkuF4Ldo1HeoNU1kj-1-LzCAU9O5EDDCRyJRVyVZ5k9Jk4vmi5t2Dv2RExMBsMlHDQ7UmRESbd69MHhE_6ib8GIrAN9w8DFY577K3-axZKsoF7JKKfQrcU6Jn1IyIskmVChMuvUEUKmC_GH5RtF9hex4GRPi8q1kDjfkbj1lbos20RItuvhq1G6ZM0Z0luBu-p_2qlh7rkuHKPz5vZBQloyYtacunEZ_nS7qhoaO3-g"
        />
      </div>
    </header>
  );
}
