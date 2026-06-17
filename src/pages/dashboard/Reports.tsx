import { useTranslation } from "react-i18next";

export default function Reports() {
  const { t } = useTranslation();

  return (
    <section className="flex-col mt-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3 px-1">
        {t("reports.title")}
      </h2>
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 text-center text-on-surface-variant">
        <p className="text-sm">{t("reports.noReports")}</p>
      </div>
    </section>
  );
}
