import { useTranslation } from "react-i18next";
import Wrapper from "../components/common/Wrapper";

const Privacy = () => {
  const { t } = useTranslation();
  return (
    <Wrapper className="pt-5 min-h-[calc(100vh-100px)] bg-gray-50 m-auto">
      <h1>{t("privacy:title")}</h1>
      <h3>{t("privacy:lastUpdated")}</h3>

      {/* Introducción */}
      <p>
        {t("privacy:introduction.paragraph1.part1")}{" "}
        <a href="https://petclinicmanager.armandojoel2004.workers.dev">
          {t("privacy:introduction.paragraph1.part2")}
        </a>
        {t("privacy:introduction.paragraph1.part3")}
      </p>
      <p>{t("privacy:introduction.paragraph2")}</p>

      {/* Resumen de Puntos Clave */}
      <h2>{t("privacy:summaryOfKeyPoints.title")}</h2>
      <p>{t("privacy:summaryOfKeyPoints.intro")}</p>
      <p>
        <strong>
          {t("privacy:summaryOfKeyPoints.points.whatPersonalInfo.question")}
        </strong>
      </p>
      <p>{t("privacy:summaryOfKeyPoints.points.whatPersonalInfo.answer")}</p>
      <p>
        <strong>
          {t("privacy:summaryOfKeyPoints.points.sensitiveInfo.question")}
        </strong>
      </p>
      <p>{t("privacy:summaryOfKeyPoints.points.sensitiveInfo.answer")}</p>
      <p>
        <strong>
          {t("privacy:summaryOfKeyPoints.points.thirdPartyInfo.question")}
        </strong>
      </p>
      <p>{t("privacy:summaryOfKeyPoints.points.thirdPartyInfo.answer")}</p>
      <p>
        <strong>
          {t("privacy:summaryOfKeyPoints.points.howWeProcess.question")}
        </strong>
      </p>
      <p>{t("privacy:summaryOfKeyPoints.points.howWeProcess.answer")}</p>
      <p>
        <strong>
          {t("privacy:summaryOfKeyPoints.points.sharingInfo.question")}
        </strong>
      </p>
      <p>{t("privacy:summaryOfKeyPoints.points.sharingInfo.answer")}</p>
      <p>
        <strong>
          {t("privacy:summaryOfKeyPoints.points.yourRights.question")}
        </strong>
      </p>
      <p>{t("privacy:summaryOfKeyPoints.points.yourRights.answer")}</p>
      <p>
        <strong>
          {t("privacy:summaryOfKeyPoints.points.howToExercise.question")}
        </strong>
      </p>
      <p>{t("privacy:summaryOfKeyPoints.points.howToExercise.answer")}</p>

      {/* Tabla de Contenido */}
      <h2>{t("privacy:tableOfContent.title")}</h2>
      <ul>
        <li>
          <a href="#1">{t("privacy:tableOfContent.1")}</a>
        </li>
        <li>
          <a href="#2">{t("privacy:tableOfContent.2")}</a>
        </li>
        <li>
          <a href="#3">{t("privacy:tableOfContent.3")}</a>
        </li>
        <li>
          <a href="#4">{t("privacy:tableOfContent.4")}</a>
        </li>
        <li>
          <a href="#5">{t("privacy:tableOfContent.5")}</a>
        </li>
        <li>
          <a href="#6">{t("privacy:tableOfContent.6")}</a>
        </li>
        <li>
          <a href="#7">{t("privacy:tableOfContent.7")}</a>
        </li>
        <li>
          <a href="#8">{t("privacy:tableOfContent.8")}</a>
        </li>
        <li>
          <a href="#9">{t("privacy:tableOfContent.9")}</a>
        </li>
        <li>
          <a href="#10">{t("privacy:tableOfContent.10")}</a>
        </li>
        <li>
          <a href="#11">{t("privacy:tableOfContent.11")}</a>
        </li>
        <li>
          <a href="#12">{t("privacy:tableOfContent.12")}</a>
        </li>
        <li>
          <a href="#13">{t("privacy:tableOfContent.13")}</a>
        </li>
      </ul>

      {/* 1. ¿Qué información recopilamos? */}
      <h2 id="1">{t("privacy:sections.1.title")}</h2>
      <h3>{t("privacy:sections.1.personalInfoDisclosed.title")}</h3>
      <p>
        <em>{t("privacy:sections.1.personalInfoDisclosed.summary")}</em>
      </p>
      <p>{t("privacy:sections.1.personalInfoDisclosed.paragraph1")}</p>
      <p>
        <strong>
          {t("privacy:sections.1.personalInfoDisclosed.sensitiveInfo")}
        </strong>
      </p>
      <p>{t("privacy:sections.1.personalInfoDisclosed.paragraph2")}</p>
      <h3>{t("privacy:sections.1.automaticallyCollected.title")}</h3>
      <p>
        <em>{t("privacy:sections.1.automaticallyCollected.summary")}</em>
      </p>
      <p>{t("privacy:sections.1.automaticallyCollected.paragraph1")}</p>
      <p>{t("privacy:sections.1.automaticallyCollected.paragraph2")}</p>

      {/* 2. ¿Cómo procesamos tu información? */}
      <h2 id="2">{t("privacy:sections.2.title")}</h2>
      <p>
        <em>{t("privacy:sections.2.summary")}</em>
      </p>
      <p>{t("privacy:sections.2.paragraph1")}</p>
      <ul>
        <li>{t("privacy:sections.2.reasons.1")}</li>
        <li>{t("privacy:sections.2.reasons.2")}</li>
        <li>{t("privacy:sections.2.reasons.3")}</li>
        <li>{t("privacy:sections.2.reasons.4")}</li>
        <li>{t("privacy:sections.2.reasons.5")}</li>
        <li>{t("privacy:sections.2.reasons.6")}</li>
        <li>{t("privacy:sections.2.reasons.7")}</li>
        <li>{t("privacy:sections.2.reasons.8")}</li>
        <li>{t("privacy:sections.2.reasons.9")}</li>
      </ul>

      {/* 3. ¿Cuándo y con quién compartimos tu información personal? */}
      <h2 id="3">{t("privacy:sections.3.title")}</h2>
      <p>
        <em>{t("privacy:sections.3.summary")}</em>
      </p>
      <h3>{t("privacy:sections.3.situations.businessTransfers.title")}</h3>
      <p>{t("privacy:sections.3.situations.businessTransfers.paragraph")}</p>
      <h3>{t("privacy:sections.3.situations.businessPartners.title")}</h3>
      <p>{t("privacy:sections.3.situations.businessPartners.paragraph")}</p>

      {/* 4. ¿Usamos cookies y otras tecnologías de seguimiento? */}
      <h2 id="4">{t("privacy:sections.4.title")}</h2>
      <p>
        <em>{t("privacy:sections.4.summary")}</em>
      </p>
      <p>{t("privacy:sections.4.paragraph1")}</p>
      <p>{t("privacy:sections.4.paragraph2")}</p>

      {/* 5. ¿Cómo manejamos tus inicios de sesión en redes sociales? */}
      <h2 id="5">{t("privacy:sections.5.title")}</h2>
      <p>
        <em>{t("privacy:sections.5.summary")}</em>
      </p>
      <p>{t("privacy:sections.5.paragraph1")}</p>
      <p>{t("privacy:sections.5.paragraph2")}</p>

      {/* 6. ¿Se transfiere tu información internacionalmente? */}
      <h2 id="6">{t("privacy:sections.6.title")}</h2>
      <p>
        <em>{t("privacy:sections.6.summary")}</em>
      </p>
      <p>{t("privacy:sections.6.paragraph1")}</p>
      <p>{t("privacy:sections.6.paragraph2")}</p>

      {/* 7. ¿Cuánto tiempo conservamos tu información? */}
      <h2 id="7">{t("privacy:sections.7.title")}</h2>
      <p>
        <em>{t("privacy:sections.7.summary")}</em>
      </p>
      <p>{t("privacy:sections.7.paragraph1")}</p>
      <p>{t("privacy:sections.7.paragraph2")}</p>

      {/* 8. ¿Recopilamos información de menores? */}
      <h2 id="8">{t("privacy:sections.8.title")}</h2>
      <p>
        <em>{t("privacy:sections.8.summary")}</em>
      </p>
      <p>{t("privacy:sections.8.paragraph1")}</p>
      <p>{t("privacy:sections.8.paragraph2")}</p>

      {/* 9. ¿Cuáles son tus derechos de privacidad? */}
      <h2 id="9">{t("privacy:sections.9.title")}</h2>
      <p>
        <em>{t("privacy:sections.9.summary")}</em>
      </p>
      <h3>{t("privacy:sections.9.withdrawConsent.title")}</h3>
      <p>{t("privacy:sections.9.withdrawConsent.paragraph")}</p>
      <h3>{t("privacy:sections.9.accountInformation.title")}</h3>
      <p>{t("privacy:sections.9.accountInformation.paragraph1")}</p>
      <ul>
        <li>{t("privacy:sections.9.accountInformation.options.1")}</li>
        <li>{t("privacy:sections.9.accountInformation.options.2")}</li>
      </ul>
      <p>{t("privacy:sections.9.accountInformation.paragraph2")}</p>

      {/* 10. Controles para Do-Not-Track */}
      <h2 id="10">{t("privacy:sections.10.title")}</h2>
      <p>{t("privacy:sections.10.paragraph1")}</p>
      <p>{t("privacy:sections.10.paragraph2")}</p>

      {/* 11. ¿Actualizamos esta política? */}
      <h2 id="11">{t("privacy:sections.11.title")}</h2>
      <p>
        <em>{t("privacy:sections.11.summary")}</em>
      </p>
      <p>{t("privacy:sections.11.paragraph1")}</p>
      <p>{t("privacy:sections.11.paragraph2")}</p>

      {/* 12. ¿Cómo puedes contactarme sobre esta política? */}
      <h2 id="12">{t("privacy:sections.12.title")}</h2>
      <p>{t("privacy:sections.12.paragraph1")}</p>
      <ul>
        <li>{t("privacy:sections.12.contact.name")}</li>
        <li>{t("privacy:sections.12.contact.address")}</li>
        <li>{t("privacy:sections.12.contact.phone")}</li>
        <li>{t("privacy:sections.12.contact.email")}</li>
      </ul>

      {/* 13. ¿Cómo puedes revisar, actualizar o eliminar tus datos? */}
      <h2 id="13">{t("privacy:sections.13.title")}</h2>
      <p>{t("privacy:sections.13.paragraph1")}</p>
      <p>{t("privacy:sections.13.paragraph2")}</p>

      {/* 14. Idioma */}
      <h2 id="14">{t("privacy:guberningLanguage.title")}</h2>
      <p>{t("privacy:guberningLanguage.paragraph")}</p>
    </Wrapper>
  );
};

export default Privacy;
