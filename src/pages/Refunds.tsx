import { useTranslation } from "react-i18next";
import Wrapper from "../components/common/Wrapper";

const Refunds = () => {
  const { t } = useTranslation();
  return (
    <Wrapper className="pt-5 min-h-[calc(100vh-100px)] bg-gray-50 m-auto">
      <h1>{t("refunds:title")}</h1>
      <h3>{t("refunds:lastUpdated")}</h3>

      {/* Reembolsos */}
      <h2>{t("refunds:refunds.title")}</h2>
      <p>{t("refunds:refunds.paragraph1")}</p>
      <h3>{t("refunds:refunds.noRecurringBilling.title")}</h3>
      <p>{t("refunds:refunds.noRecurringBilling.paragraph")}</p>
      <h3>{t("refunds:refunds.serviceDuration.title")}</h3>
      <p>{t("refunds:refunds.serviceDuration.paragraph")}</p>
      <h3>{t("refunds:refunds.refundExceptions.title")}</h3>
      <p>{t("refunds:refunds.refundExceptions.paragraph")}</p>

      {/* Preguntas */}
      <h2>{t("refunds:questions.title")}</h2>
      <p>{t("refunds:questions.paragraph")}</p>
      <ul>
        <li>{t("refunds:questions.contact.phone")}</li>
        <li>{t("refunds:questions.contact.email")}</li>
      </ul>
      {/* 29. Idioma */}
      <h2 id="29">{t("refunds:guberningLanguage.title")}</h2>
      <p>{t("refunds:guberningLanguage.paragraph")}</p>
    </Wrapper>
  );
};

export default Refunds;
