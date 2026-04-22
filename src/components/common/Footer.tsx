import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-emerald-900 text-white p-4">
      <div className="flex justify-center gap-10">
        <a href="/terms">{t("common:termsAndConditions")}</a>
        <a href="/privacy">{t("common:privacyPolicy")}</a>
        <a href="/refund">{t("common:refundPolicy")}</a>
      </div>
    </footer>
  );
};

export default Footer;
