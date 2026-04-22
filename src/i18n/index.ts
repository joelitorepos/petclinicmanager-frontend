// rsc/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Importa directamente los JSON
// paginas iniciales -- START --
import homeEs from "../../src/locales/es/home.json";
import aboutEs from "../../src/locales/es/about.json";
import servicesLandingEs from "../../src/locales/es/servicesLanding.json";
import contactEs from "../../src/locales/es/contact.json";
import CurrentClinicsEs from "../../src/locales/es/currentClinics.json";
// paginas iniciales -- END --
import commonEn from "../../src/locales/en/common.json";
import authEn from "../../src/locales/en/auth.json";
import toolsEn from "../../src/locales/en/tools.json";
import themesEn from "../../src/locales/en/themes.json";
import uiEn from "../../src/locales/en/ui.json";
// vistas del espacio de trabajo -- START --
import homePageEs from "../../src/locales/es/homePage.json";
import pricingEs from "../../src/locales/es/pricing.json";
import ownersEs from "../../src/locales/es/owners.json";
import patientsEs from "../../src/locales/es/patients.json";
import workspaceMembersEs from "../../src/locales/es/workspaceMembers.json";
import appointmentsEs from "../../src/locales/es/appointments.json";
import clinicalRecordsEs from "../../src/locales/es/clinicalRecords.json";
import inventoryEs from "../../src/locales/es/inventory.json";
import inventoryBatchEs from "../../src/locales/es/inventoryBatch.json";
import servicesEs from "../../src/locales/es/services.json";
import billingEs from "../../src/locales/es/billing.json";
import reportsEs from "../../src/locales/es/reports.json";
import auditLogEs from "../../src/locales/es/auditLog.json";
import settingsEs from "../../src/locales/es/settings.json";
// vistas del espacio de trabajo -- END --

// paginas iniciales -- START --
import homeEn from "../../src/locales/en/home.json";
import aboutEn from "../../src/locales/en/about.json";
import servicesLandingEn from "../../src/locales/en/servicesLanding.json";
import contactEn from "../../src/locales/en/contact.json";
import currentClinicsEn from "../../src/locales/en/currentClinics.json";
// paginas iniciales -- END --
import commonEs from "../../src/locales/es/common.json";
import authEs from "../../src/locales/es/auth.json";
import toolsEs from "../../src/locales/es/tools.json";
import themesEs from "../../src/locales/es/themes.json";
import uiEs from "../../src/locales/es/ui.json";
// vistas del espacio de trabajo -- START --
import homePageEn from "../../src/locales/en/homePage.json";
import pricingEn from "../../src/locales/en/pricing.json";
import ownersEn from "../../src/locales/en/owners.json";
import patientsEn from "../../src/locales/en/patients.json";
import workspaceMembersEn from "../../src/locales/en/workspaceMembers.json";
import appointmentsEn from "../../src/locales/en/appointments.json";
import clinicalRecordsEn from "../../src/locales/en/clinicalRecords.json";
import inventoryEn from "../../src/locales/en/inventory.json";
import inventoryBatchEn from "../../src/locales/en/inventoryBatch.json";
import servicesEn from "../../src/locales/en/services.json";
import billingEn from "../../src/locales/en/billing.json";
import reportsEn from "../../src/locales/en/reports.json";
import auditLogEn from "../../src/locales/en/auditLog.json";
import settingsEn from "../../src/locales/en/settings.json";
// vistas del espacio de trabajo -- END --

// legal pages
import termsEn from "../../src/locales/en/terms.json";
import privacyEn from "../../src/locales/en/privacy.json";
import refundsEn from "../../src/locales/en/refunds.json";

import termsEs from "../../src/locales/es/terms.json";
import privacyEs from "../../src/locales/es/privacy.json";
import refundsEs from "../../src/locales/es/refunds.json";

const resources = {
  en: {
    common: commonEn,
    auth: authEn,
    tools: toolsEn,
    themes: themesEn,
    ui: uiEn,
    home: homeEn,
    about: aboutEn,
    servicesLanding: servicesLandingEn,
    contact: contactEn,
    currentClinics: currentClinicsEn,
    homePage: homePageEn,
    pricing: pricingEn,
    owners: ownersEn,
    patients: patientsEn,
    workspaceMembers: workspaceMembersEn,
    appointments: appointmentsEn,
    clinicalRecords: clinicalRecordsEn,
    inventory: inventoryEn,
    inventoryBatch: inventoryBatchEn,
    services: servicesEn,
    billing: billingEn,
    reports: reportsEn,
    auditLog: auditLogEn,
    settings: settingsEn,
    terms: termsEn,
    privacy: privacyEn,
    refunds: refundsEn,
  },
  es: {
    common: commonEs,
    auth: authEs,
    tools: toolsEs,
    themes: themesEs,
    ui: uiEs,
    home: homeEs,
    about: aboutEs,
    servicesLanding: servicesLandingEs,
    contact: contactEs,
    currentClinics: CurrentClinicsEs,
    homePage: homePageEs,
    pricing: pricingEs,
    owners: ownersEs,
    patients: patientsEs,
    workspaceMembers: workspaceMembersEs,
    appointments: appointmentsEs,
    clinicalRecords: clinicalRecordsEs,
    inventory: inventoryEs,
    inventoryBatch: inventoryBatchEs,
    services: servicesEs,
    billing: billingEs,
    reports: reportsEs,
    auditLog: auditLogEs,
    settings: settingsEs,
    terms: termsEs,
    privacy: privacyEs,
    refunds: refundsEs,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    ns: [
      "common",
      "dashboard",
      "auth",
      "tools",
      "themes",
      "owners",
      "ui",
      "home",
      "about",
      "services",
      "contact",
      "currentClinics",
      "settings",
      "homePage",
    ],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
