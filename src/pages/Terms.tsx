import { useTranslation } from "react-i18next";
import Wrapper from "../components/common/Wrapper";

const Terms = () => {
  const { t } = useTranslation();
  return (
    <Wrapper className="pt-5 min-h-[calc(100vh-100px)] bg-gray-50 m-auto">
      <h1>{t("terms:title")}</h1>
      <h3>{t("terms:lastUpdated")}</h3>
      <p>{t("terms:agreementToYourLegalTerms.title")}</p>
      <p>{t("terms:agreementToYourLegalTerms.paragraph1.part1")}</p>
      <p>
        <a href="https://petclinicmanager.armandojoel2004.workers.dev">
          {t("terms:agreementToYourLegalTerms.paragraph1.part2")}
        </a>
        {t("terms:agreementToYourLegalTerms.paragraph1.part3")}
      </p>
      <p>{t("terms:agreementToYourLegalTerms.paragraph2")}</p>
      <p>{t("terms:agreementToYourLegalTerms.contact.title")}</p>
      <ul>
        <li>{t("terms:agreementToYourLegalTerms.contact.email")}</li>
        <li>{t("terms:agreementToYourLegalTerms.contact.emailAdress")}</li>
        <li>{t("terms:agreementToYourLegalTerms.contact.phone")}</li>
        <li>{t("terms:agreementToYourLegalTerms.contact.address")}</li>
      </ul>
      <p>{t("terms:agreementToYourLegalTerms.paragraph3")}</p>
      <p>{t("terms:agreementToYourLegalTerms.paragraph4")}</p>
      <p>{t("terms:agreementToYourLegalTerms.paragraph5")}</p>
      <p>{t("terms:agreementToYourLegalTerms.paragraph6")}</p>
      <p>{t("terms:agreementToYourLegalTerms.paragraph7")}</p>

      <h2>{t("terms:tableOfContent.title")}</h2>
      <ul>
        <li>
          <a href="#1">{t("terms:tableOfContent.1")}</a>
        </li>
        <li>
          <a href="#2">{t("terms:tableOfContent.2")}</a>
        </li>
        <li>
          <a href="#3">{t("terms:tableOfContent.3")}</a>
        </li>
        <li>
          <a href="#4">{t("terms:tableOfContent.4")}</a>
        </li>
        <li>
          <a href="#5">{t("terms:tableOfContent.5")}</a>
        </li>
        <li>
          <a href="#6">{t("terms:tableOfContent.6")}</a>
        </li>
        <li>
          <a href="#7">{t("terms:tableOfContent.7")}</a>
        </li>
        <li>
          <a href="#8">{t("terms:tableOfContent.8")}</a>
        </li>
        <li>
          <a href="#9">{t("terms:tableOfContent.9")}</a>
        </li>
        <li>
          <a href="#10">{t("terms:tableOfContent.10")}</a>
        </li>
        <li>
          <a href="#11">{t("terms:tableOfContent.11")}</a>
        </li>
        <li>
          <a href="#12">{t("terms:tableOfContent.12")}</a>
        </li>
        <li>
          <a href="#13">{t("terms:tableOfContent.13")}</a>
        </li>
        <li>
          <a href="#14">{t("terms:tableOfContent.14")}</a>
        </li>
        <li>
          <a href="#15">{t("terms:tableOfContent.15")}</a>
        </li>
        <li>
          <a href="#16">{t("terms:tableOfContent.16")}</a>
        </li>
        <li>
          <a href="#17">{t("terms:tableOfContent.17")}</a>
        </li>
        <li>
          <a href="#18">{t("terms:tableOfContent.18")}</a>
        </li>
        <li>
          <a href="#19">{t("terms:tableOfContent.19")}</a>
        </li>
        <li>
          <a href="#20">{t("terms:tableOfContent.20")}</a>
        </li>
        <li>
          <a href="#21">{t("terms:tableOfContent.21")}</a>
        </li>
        <li>
          <a href="#22">{t("terms:tableOfContent.22")}</a>
        </li>
        <li>
          <a href="#23">{t("terms:tableOfContent.23")}</a>
        </li>
        <li>
          <a href="#24">{t("terms:tableOfContent.24")}</a>
        </li>
        <li>
          <a href="#25">{t("terms:tableOfContent.25")}</a>
        </li>
        <li>
          <a href="#26">{t("terms:tableOfContent.26")}</a>
        </li>
        <li>
          <a href="#27">{t("terms:tableOfContent.27")}</a>
        </li>
        <li>
          <a href="#28">{t("terms:tableOfContent.28")}</a>
        </li>
      </ul>

      {/* 1. Nuestros Servicios */}
      <h2 id="1">{t("terms:sections.1.title")}</h2>
      <p>{t("terms:sections.1.paragraph1")}</p>
      <p>{t("terms:sections.1.paragraph2")}</p>

      {/* 2. Derechos de Propiedad Intelectual */}
      <h2 id="2">{t("terms:sections.2.title")}</h2>
      <h3>{t("terms:sections.2.ourIntellectualProperty.title")}</h3>
      <p>{t("terms:sections.2.ourIntellectualProperty.paragraph1")}</p>
      <p>{t("terms:sections.2.ourIntellectualProperty.paragraph2")}</p>
      <h3>{t("terms:sections.2.yourUseOfOurServices.title")}</h3>
      <p>{t("terms:sections.2.yourUseOfOurServices.paragraph1")}</p>
      <ul>
        <li>{t("terms:sections.2.yourUseOfOurServices.license.item1")}</li>
        <li>{t("terms:sections.2.yourUseOfOurServices.license.item2")}</li>
      </ul>
      <p>{t("terms:sections.2.yourUseOfOurServices.paragraph2")}</p>
      <p>{t("terms:sections.2.yourUseOfOurServices.paragraph3")}</p>
      <p>{t("terms:sections.2.yourUseOfOurServices.paragraph4")}</p>
      <p>{t("terms:sections.2.yourUseOfOurServices.paragraph5")}</p>
      <h3>{t("terms:sections.2.yourSubmissionsAndContributions.title")}</h3>
      <p>{t("terms:sections.2.yourSubmissionsAndContributions.paragraph1")}</p>
      <p>
        <strong>
          {t(
            "terms:sections.2.yourSubmissionsAndContributions.submissions.title",
          )}
        </strong>
      </p>
      <p>
        {t(
          "terms:sections.2.yourSubmissionsAndContributions.submissions.paragraph",
        )}
      </p>
      <p>
        <strong>
          {t(
            "terms:sections.2.yourSubmissionsAndContributions.contributions.title",
          )}
        </strong>
      </p>
      <p>
        {t(
          "terms:sections.2.yourSubmissionsAndContributions.contributions.paragraph1",
        )}
      </p>
      <p>
        {t(
          "terms:sections.2.yourSubmissionsAndContributions.contributions.paragraph2",
        )}
      </p>
      <p>
        {t(
          "terms:sections.2.yourSubmissionsAndContributions.contributions.licenseTitle",
        )}
      </p>
      <p>
        {t(
          "terms:sections.2.yourSubmissionsAndContributions.contributions.paragraph3",
        )}
      </p>
      <p>
        {t(
          "terms:sections.2.yourSubmissionsAndContributions.contributions.paragraph4",
        )}
      </p>

      {/* 3. Representaciones de los Usuarios */}
      <h2 id="3">{t("terms:sections.3.title")}</h2>
      <p>{t("terms:sections.3.paragraph1")}</p>
      <ul>
        <li>{t("terms:sections.3.items.1")}</li>
        <li>{t("terms:sections.3.items.2")}</li>
        <li>{t("terms:sections.3.items.3")}</li>
        <li>{t("terms:sections.3.items.4")}</li>
        <li>{t("terms:sections.3.items.5")}</li>
      </ul>
      <p>{t("terms:sections.3.paragraph2")}</p>

      {/* 4. Registro de Usuarios */}
      <h2 id="4">{t("terms:sections.4.title")}</h2>
      <p>{t("terms:sections.4.paragraph1")}</p>

      {/* 5. Compras y Pagos */}
      <h2 id="5">{t("terms:sections.5.title")}</h2>
      <p>{t("terms:sections.5.paragraph1")}</p>
      <ul>
        <li>{t("terms:sections.5.paymentMethods.item1")}</li>
        <li>{t("terms:sections.5.paymentMethods.item2")}</li>
      </ul>
      <p>{t("terms:sections.5.paragraph2")}</p>
      <p>{t("terms:sections.5.paragraph3")}</p>

      {/* 6. Suscripciones */}
      <h2 id="6">{t("terms:sections.6.title")}</h2>
      <h3>{t("terms:sections.6.billing.title")}</h3>
      <p>{t("terms:sections.6.billing.paragraph")}</p>
      <h3>{t("terms:sections.6.freeTrial.title")}</h3>
      <p>{t("terms:sections.6.freeTrial.paragraph")}</p>
      <h3>{t("terms:sections.6.cancellation.title")}</h3>
      <p>{t("terms:sections.6.cancellation.paragraph")}</p>
      <h3>{t("terms:sections.6.feeChanges.title")}</h3>
      <p>{t("terms:sections.6.feeChanges.paragraph")}</p>

      {/* 7. Actividades Prohibidas */}
      <h2 id="7">{t("terms:sections.7.title")}</h2>
      <p>{t("terms:sections.7.paragraph1")}</p>
      <p>{t("terms:sections.7.paragraph2")}</p>
      <ul>
        <li>{t("terms:sections.7.items.1")}</li>
        <li>{t("terms:sections.7.items.2")}</li>
        <li>{t("terms:sections.7.items.3")}</li>
        <li>{t("terms:sections.7.items.4")}</li>
        <li>{t("terms:sections.7.items.5")}</li>
        <li>{t("terms:sections.7.items.6")}</li>
        <li>{t("terms:sections.7.items.7")}</li>
        <li>{t("terms:sections.7.items.8")}</li>
        <li>{t("terms:sections.7.items.9")}</li>
        <li>{t("terms:sections.7.items.10")}</li>
        <li>{t("terms:sections.7.items.11")}</li>
        <li>{t("terms:sections.7.items.12")}</li>
        <li>{t("terms:sections.7.items.13")}</li>
        <li>{t("terms:sections.7.items.14")}</li>
        <li>{t("terms:sections.7.items.15")}</li>
        <li>{t("terms:sections.7.items.16")}</li>
        <li>{t("terms:sections.7.items.17")}</li>
        <li>{t("terms:sections.7.items.18")}</li>
      </ul>

      {/* 8. Contribuciones de Usuarios */}
      <h2 id="8">{t("terms:sections.8.title")}</h2>
      <p>{t("terms:sections.8.paragraph1")}</p>
      <p>{t("terms:sections.8.paragraph2")}</p>
      <ul>
        <li>{t("terms:sections.8.items.1")}</li>
        <li>{t("terms:sections.8.items.2")}</li>
        <li>{t("terms:sections.8.items.3")}</li>
        <li>{t("terms:sections.8.items.4")}</li>
        <li>{t("terms:sections.8.items.5")}</li>
        <li>{t("terms:sections.8.items.6")}</li>
        <li>{t("terms:sections.8.items.7")}</li>
        <li>{t("terms:sections.8.items.8")}</li>
      </ul>

      {/* 9. Licencia de Contribuciones */}
      <h2 id="9">{t("terms:sections.9.title")}</h2>
      <p>{t("terms:sections.9.paragraph1")}</p>
      <p>{t("terms:sections.9.paragraph2")}</p>
      <p>{t("terms:sections.9.paragraph3")}</p>

      {/* 10. Gestión de los Servicios */}
      <h2 id="10">{t("terms:sections.10.title")}</h2>
      <p>{t("terms:sections.10.paragraph1")}</p>
      <ul>
        <li>{t("terms:sections.10.items.1")}</li>
        <li>{t("terms:sections.10.items.2")}</li>
        <li>{t("terms:sections.10.items.3")}</li>
        <li>{t("terms:sections.10.items.4")}</li>
        <li>{t("terms:sections.10.items.5")}</li>
      </ul>

      {/* 11. Política de Privacidad */}
      <h2 id="11">{t("terms:sections.11.title")}</h2>
      <p>{t("terms:sections.11.paragraph1")}</p>
      <p>{t("terms:sections.11.paragraph2")}</p>

      {/* 12. Infracciones de Derechos de Autor */}
      <h2 id="12">{t("terms:sections.12.title")}</h2>
      <p>{t("terms:sections.12.paragraph1")}</p>
      <p>{t("terms:sections.12.paragraph2")}</p>

      {/* 13. Vigencia y Terminación */}
      <h2 id="13">{t("terms:sections.13.title")}</h2>
      <p>{t("terms:sections.13.paragraph1")}</p>
      <p>{t("terms:sections.13.paragraph2")}</p>
      <p>{t("terms:sections.13.paragraph3")}</p>

      {/* 14. Modificaciones e Interrupciones */}
      <h2 id="14">{t("terms:sections.14.title")}</h2>
      <p>{t("terms:sections.14.paragraph1")}</p>
      <p>{t("terms:sections.14.paragraph2")}</p>
      <p>{t("terms:sections.14.paragraph3")}</p>

      {/* 15. Ley Aplicable */}
      <h2 id="15">{t("terms:sections.15.title")}</h2>
      <p>{t("terms:sections.15.paragraph1")}</p>

      {/* 16. Resolución de Disputas */}
      <h2 id="16">{t("terms:sections.16.title")}</h2>
      <h3>{t("terms:sections.16.informalNegotiations.title")}</h3>
      <p>{t("terms:sections.16.informalNegotiations.paragraph")}</p>
      <h3>{t("terms:sections.16.bindingArbitration.title")}</h3>
      <p>{t("terms:sections.16.bindingArbitration.paragraph")}</p>
      <h3>{t("terms:sections.16.restrictions.title")}</h3>
      <p>{t("terms:sections.16.restrictions.paragraph")}</p>
      <h3>{t("terms:sections.16.exceptions.title")}</h3>
      <p>{t("terms:sections.16.exceptions.paragraph")}</p>

      {/* 17. Correcciones */}
      <h2 id="17">{t("terms:sections.17.title")}</h2>
      <p>{t("terms:sections.17.paragraph1")}</p>

      {/* 18. Descargo de Responsabilidad */}
      <h2 id="18">{t("terms:sections.18.title")}</h2>
      <p>{t("terms:sections.18.paragraph1")}</p>

      {/* 19. Limitación de Responsabilidad */}
      <h2 id="19">{t("terms:sections.19.title")}</h2>
      <p>{t("terms:sections.19.paragraph1")}</p>
      <p>{t("terms:sections.19.paragraph2")}</p>
      <p>{t("terms:sections.19.paragraph3")}</p>

      {/* 20. Indemnización */}
      <h2 id="20">{t("terms:sections.20.title")}</h2>
      <p>{t("terms:sections.20.paragraph1")}</p>
      <p>{t("terms:sections.20.paragraph2")}</p>

      {/* 21. Datos del Usuario */}
      <h2 id="21">{t("terms:sections.21.title")}</h2>
      <p>{t("terms:sections.21.paragraph1")}</p>
      <p>{t("terms:sections.21.paragraph2")}</p>

      {/* 22. Comunicaciones, Transacciones y Firmas Electrónicas */}
      <h2 id="22">{t("terms:sections.22.title")}</h2>
      <p>{t("terms:sections.22.paragraph1")}</p>
      <p>{t("terms:sections.22.paragraph2")}</p>

      {/* 23. Mensajes de Texto SMS / WhatsApp */}
      <h2 id="23">{t("terms:sections.23.title")}</h2>
      <h3>{t("terms:sections.23.programDescription.title")}</h3>
      <p>{t("terms:sections.23.programDescription.paragraph")}</p>
      <h3>{t("terms:sections.23.optingOut.title")}</h3>
      <p>{t("terms:sections.23.optingOut.paragraph")}</p>
      <h3>{t("terms:sections.23.messageRates.title")}</h3>
      <p>{t("terms:sections.23.messageRates.paragraph")}</p>
      <h3>{t("terms:sections.23.support.title")}</h3>
      <p>{t("terms:sections.23.support.paragraph")}</p>

      {/* 24. Usuarios y Residentes de California */}
      <h2 id="24">{t("terms:sections.24.title")}</h2>
      <p>{t("terms:sections.24.paragraph1")}</p>

      {/* 25. Misceláneos */}
      <h2 id="25">{t("terms:sections.25.title")}</h2>
      <p>{t("terms:sections.25.paragraph1")}</p>
      <p>{t("terms:sections.25.paragraph2")}</p>
      <p>{t("terms:sections.25.paragraph3")}</p>
      <p>{t("terms:sections.25.paragraph4")}</p>

      {/* 26. Responsabilidad Profesional */}
      <h2 id="26">{t("terms:sections.26.title")}</h2>
      <p>{t("terms:sections.26.paragraph1")}</p>

      {/* 27. Servicios de Terceros */}
      <h2 id="27">{t("terms:sections.27.title")}</h2>
      <p>{t("terms:sections.27.paragraph1")}</p>

      {/* 28. Contáctanos */}
      <h2 id="28">{t("terms:sections.28.title")}</h2>
      <p>{t("terms:sections.28.paragraph1")}</p>
      <ul>
        <li>{t("terms:sections.28.contact.name")}</li>
        <li>{t("terms:sections.28.contact.address")}</li>
        <li>{t("terms:sections.28.contact.phone")}</li>
        <li>{t("terms:sections.28.contact.email")}</li>
      </ul>

      {/* 29. Idioma */}
      <h2 id="29">{t("terms:guberningLanguage.title")}</h2>
      <p>{t("terms:guberningLanguage.paragraph")}</p>
    </Wrapper>
  );
};

export default Terms;
