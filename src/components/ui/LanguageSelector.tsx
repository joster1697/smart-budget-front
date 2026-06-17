import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const isEs = i18n.language.startsWith("es");

  return (
    <div className="relative flex gap-2 bg-[#00210c] border border-white/5 p-[6px] rounded-xl w-[180px] shrink-0 h-[42px] select-none">
      {/* Indicador deslizante (Píldora activa) */}
      <div
        className={`absolute top-[6px] bottom-[6px] w-[calc(50%-10px)] bg-[#38e07b] rounded-lg shadow-md transition-all duration-300 ease-out ${
          isEs ? "left-[6px]" : "left-[calc(50%+4px)]"
        }`}
      />
      {/* Botón Español */}
      <button
        onClick={() => changeLanguage("es")}
        className={`relative z-10 flex-1 text-center text-xs font-bold tracking-wider transition-colors duration-200 cursor-pointer ${
          isEs ? "text-[#0a1f12]" : "text-white/40 hover:text-white"
        }`}
      >
        ESP
      </button>
      {/* Botón Inglés */}
      <button
        onClick={() => changeLanguage("en")}
        className={`relative z-10 flex-1 text-center text-xs font-bold tracking-wider transition-colors duration-200 cursor-pointer ${
          !isEs ? "text-[#0a1f12]" : "text-white/40 hover:text-white"
        }`}
      >
        ENG
      </button>
    </div>
  );
};

export default LanguageSelector;

