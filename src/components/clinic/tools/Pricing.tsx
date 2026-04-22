// src/pages/Pricing.tsx

import { useState } from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import BASEURL from "../../../hooks/BaseUrl";
import useFetch from "../../../hooks/useFetch";
import PageWrapper from "../../layout/PageWrapper";
import LanguageSwitcher from "../../common/LanguageSwitcher";
import InfoNote from "../../ui/InfoNote";
import type { CurrentWorkspaceResponse } from "../../../interfaces/Workspace";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PlanName = "basic" | "pro" | "enterprise";
type Period = "monthly" | "annual";

interface PlanCheckoutState {
  status: "idle" | "loading" | "error";
  message?: string;
}

// ─── Datos de precios (hardcoded en USD) ──────────────────────────────────────

const PLAN_PRICES: Record<PlanName, { monthly: number; annual: number }> = {
  basic: { monthly: 22, annual: 220 },
  pro: { monthly: 45, annual: 450 },
  enterprise: { monthly: 89, annual: 890 },
};

const ANNUAL_SAVINGS: Record<PlanName, number> = {
  basic: Math.round(100 - (220 / (22 * 12)) * 100),
  pro: Math.round(100 - (450 / (45 * 12)) * 100),
  enterprise: Math.round(100 - (890 / (89 * 12)) * 100),
};

// ─── Toggle mensual/anual ─────────────────────────────────────────────────────

interface PeriodToggleProps {
  t: ReturnType<typeof useLanguage>["t"];
  period: Period;
  onChange: (p: Period) => void;
}

const PeriodToggle = ({ t, period, onChange }: PeriodToggleProps) => (
  <div className="inline-flex items-center gap-1 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-full p-1">
    <button
      onClick={() => onChange("monthly")}
      className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
        period === "monthly"
          ? "bg-[rgb(var(--primary))] text-white shadow-sm"
          : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--background-secondary))]"
      }`}
    >
      {t("pricing:toggle.monthly")}
    </button>
    <button
      onClick={() => onChange("annual")}
      className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
        period === "annual"
          ? "bg-[rgb(var(--primary))] text-white shadow-sm"
          : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--background-secondary))]"
      }`}
    >
      {t("pricing:toggle.annual")}
      <span
        className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
          period === "annual"
            ? "bg-white text-[rgb(var(--primary))]"
            : "bg-[rgb(var(--background-secondary))] text-[rgb(var(--text-secondary))]"
        }`}
      >
        -17%
      </span>
    </button>
  </div>
);

// ─── Tarjeta de plan pago ─────────────────────────────────────────────────────

interface PricingCardProps {
  t: ReturnType<typeof useLanguage>["t"];
  planKey: PlanName;
  period: Period;
  title: string;
  description: string;
  features: string[];
  badge: string;
  isCurrentPlan: boolean;
  checkoutState: PlanCheckoutState;
  onSubscribe: (plan: PlanName) => void;
}

const PricingCard = ({
  t,
  planKey,
  period,
  title,
  description,
  features,
  badge,
  isCurrentPlan,
  checkoutState,
  onSubscribe,
}: PricingCardProps) => {
  const price = PLAN_PRICES[planKey][period];
  const monthlyEquiv = period === "annual" ? (price / 12).toFixed(2) : null;
  const savings = ANNUAL_SAVINGS[planKey];

  const isPro = planKey === "pro";

  return (
    <div
      className={`relative rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 p-8 border flex flex-col 
      ${
        isPro
          ? "bg-[rgb(var(--primary))] border-[rgb(var(--primary))]"
          : "bg-[rgb(var(--surface))] border-[rgb(var(--border))]"
      }`}
    >
      {isPro && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
            {t("pricing:badges.mostPopular")}
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3.5 right-5">
          <span className="bg-[rgb(var(--text))] text-[rgb(var(--background))] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {t("pricing:badges.currentPlan")}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3
          className={`text-2xl font-bold mb-2 ${isPro ? "text-white" : "text-[rgb(var(--primary))]"}`}
        >
          {title}
        </h3>
        <p
          className={`text-sm ${isPro ? "text-white/80" : "text-[rgb(var(--text-secondary))]"}`}
        >
          {description}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span
            className={`text-sm font-medium mb-1 ${isPro ? "text-white/70" : "text-[rgb(var(--text-secondary))]"}`}
          >
            USD
          </span>
          <span
            className={`text-5xl font-extrabold leading-none ${isPro ? "text-white" : "text-[rgb(var(--text))]"}`}
          >
            ${price}
          </span>
          <span
            className={`text-sm mb-1 ${isPro ? "text-white/70" : "text-[rgb(var(--text-secondary))]"}`}
          >
            /
            {period === "monthly"
              ? t("pricing:price.perMonth")
              : t("pricing:price.perYear")}
          </span>
        </div>

        {period === "annual" && monthlyEquiv && (
          <p
            className={`text-xs mt-1.5 ${isPro ? "text-white/60" : "text-[rgb(var(--text-secondary))]"}`}
          >
            {t("pricing:price.annualEquiv")}${monthlyEquiv}
            {t("pricing:price.perMonth")} - {savings}%{" "}
            {t("pricing:price.annualEquivSuffix")}
          </p>
        )}
        {period === "monthly" && (
          <p
            className={`text-xs mt-1.5 ${isPro ? "text-white/60" : "text-[rgb(var(--text-secondary))]"}`}
          >
            {t("pricing:price.monthlyBilling")}
          </p>
        )}
      </div>

      <ul className="space-y-2.5 flex-grow mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 flex-shrink-0 ${isPro ? "text-white/80" : "text-[rgb(var(--primary))]"}`}
            >
              ✓
            </span>
            <span
              className={isPro ? "text-white/90" : "text-[rgb(var(--text))]"}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium
          ${
            isPro
              ? "bg-white/20 text-white"
              : "bg-[rgb(var(--background-secondary))] text-[rgb(var(--primary))]"
          }`}
        >
          {badge}
        </span>
      </div>

      {isCurrentPlan ? (
        <div
          className={`w-full text-center py-2.5 rounded-xl text-sm font-medium border-2
          ${
            isPro
              ? "border-white/30 text-white/60"
              : "border-[rgb(var(--border))] text-[rgb(var(--text-secondary))]"
          }`}
        >
          {t("pricing:buttons.activePlan")}
        </div>
      ) : (
        <div className="space-y-1.5">
          <button
            onClick={() => onSubscribe(planKey)}
            disabled={checkoutState.status === "loading"}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60
              hover:cursor-not-allowed
              ${
                isPro
                  ? "bg-white text-[rgb(var(--primary))] hover:bg-white/90 shadow-md"
                  : "bg-[rgb(var(--primary))] text-white hover:opacity-90 shadow-sm"
              }`}
          >
            {checkoutState.status === "loading"
              ? t("pricing:buttons.processing")
              : period === "monthly"
                ? t("pricing:buttons.subscribeMontly")
                : t("pricing:buttons.subscribeAnnual")}
          </button>

          {checkoutState.status === "error" && checkoutState.message && (
            <p className="text-xs text-red-600 text-center">
              {checkoutState.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Tarjeta plan Free ────────────────────────────────────────────────────────

interface FreePlanCardProps {
  t: ReturnType<typeof useLanguage>["t"];
  title: string;
  description: string;
  features: string[];
  badge: string;
  isCurrentPlan: boolean;
}

const FreePlanCard = ({
  t,
  title,
  description,
  features,
  badge,
  isCurrentPlan,
}: FreePlanCardProps) => (
  <div className="relative rounded-2xl shadow-lg p-8 border border-[rgb(var(--border))] bg-[rgb(var(--surface))] flex flex-col">
    <div className="mb-6">
      <h3 className="text-2xl font-bold text-[rgb(var(--text-secondary))] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[rgb(var(--text-secondary))]">{description}</p>
    </div>
    <div className="mb-6">
      <span className="text-5xl font-extrabold text-[rgb(var(--text-secondary))] leading-none">
        {t("pricing:price.free")}
      </span>
      <p className="text-xs text-[rgb(var(--text-secondary))] mt-1.5">
        {t("pricing:price.freeSub")}
      </p>
    </div>
    <ul className="space-y-2.5 flex-grow mb-8">
      {features.map((feature, i) => (
        <li
          key={i}
          className="flex items-start gap-2 text-sm text-[rgb(var(--text-secondary))]"
        >
          <span className="mt-0.5 flex-shrink-0 text-[rgb(var(--text-secondary))] opacity-50">
            ✓
          </span>
          {feature}
        </li>
      ))}
    </ul>
    <div className="mb-4">
      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[rgb(var(--border))] text-[rgb(var(--text-secondary))]">
        {badge}
      </span>
    </div>
    <div className="w-full text-center py-2.5 rounded-xl text-sm font-medium border-2 border-[rgb(var(--border))] text-[rgb(var(--text-secondary))]">
      {isCurrentPlan
        ? t("pricing:buttons.activePlan")
        : t("pricing:buttons.includedByDefault")}
    </div>
  </div>
);

// ─── Página principal ─────────────────────────────────────────────────────────

const Pricing = () => {
  const { t } = useLanguage();

  const [period, setPeriod] = useState<Period>("monthly");
  const [checkoutStates, setCheckoutStates] = useState<
    Record<PlanName, PlanCheckoutState>
  >({
    basic: { status: "idle" },
    pro: { status: "idle" },
    enterprise: { status: "idle" },
  });

  const { data: currentWorkspaceData } = useFetch<CurrentWorkspaceResponse>(
    `${BASEURL}/api/workspaces/current`,
  );
  const workspace = currentWorkspaceData?.workspace;
  const workspaceId = workspace?._id;
  const currentPlan = (workspace?.plan ?? "free") as string;

  const handleSubscribe = async (plan: PlanName) => {
    if (!workspaceId) return;

    setCheckoutStates((prev) => ({
      ...prev,
      [plan]: { status: "loading" },
    }));

    try {
      const res = await fetch(
        `${BASEURL}/api/workspaces/${workspaceId}/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, period }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setCheckoutStates((prev) => ({
          ...prev,
          [plan]: {
            status: "error",
            message: data.error ?? t("pricing:errors.processing"),
          },
        }));
        return;
      }

      if (data.initPoint) {
        window.location.href = data.initPoint;
      }
    } catch (err: unknown) {
      setCheckoutStates((prev) => ({
        ...prev,
        [plan]: {
          status: "error",
          message:
            err instanceof Error ? err.message : t("pricing:errors.connection"),
        },
      }));
    }
  };

  // ── Planes (usando claves de servicesLanding para consistencia) ─────────────
  const paidPlans: Array<{
    key: PlanName;
    title: string;
    description: string;
    features: string[];
    badge: string;
  }> = [
    {
      key: "basic",
      title: t("servicesLanding:plan_basic_title"),
      description: t("servicesLanding:plan_basic_description"),
      features: [
        t("servicesLanding:plan_basic_feature1"),
        t("servicesLanding:plan_basic_feature2"),
        t("servicesLanding:plan_basic_feature3"),
        t("servicesLanding:plan_basic_feature4"),
      ],
      badge: t("servicesLanding:plan_basic_badge"),
    },
    {
      key: "pro",
      title: t("servicesLanding:plan_pro_title"),
      description: t("servicesLanding:plan_pro_description"),
      features: [
        t("servicesLanding:plan_pro_feature1"),
        t("servicesLanding:plan_pro_feature2"),
        t("servicesLanding:plan_pro_feature3"),
        t("servicesLanding:plan_pro_feature4"),
      ],
      badge: t("servicesLanding:plan_pro_badge"),
    },
    {
      key: "enterprise",
      title: t("servicesLanding:plan_enterprise_title"),
      description: t("servicesLanding:plan_enterprise_description"),
      features: [
        t("servicesLanding:plan_enterprise_feature1"),
        t("servicesLanding:plan_enterprise_feature2"),
        t("servicesLanding:plan_enterprise_feature3"),
        t("servicesLanding:plan_enterprise_feature4"),
      ],
      badge: t("servicesLanding:plan_enterprise_badge"),
    },
  ];

  const freePlan = {
    title: t("servicesLanding:plan_free_title"),
    description: t("servicesLanding:plan_free_description"),
    features: [
      t("servicesLanding:plan_free_feature1"),
      t("servicesLanding:plan_free_feature2"),
      t("servicesLanding:plan_free_feature3"),
      t("servicesLanding:plan_free_feature4"),
    ],
    badge: t("servicesLanding:plan_free_badge"),
  };

  return (
    <PageWrapper className="pb-16 py-8">
      <div className="absolute top-23 right-13 lg:top-14">
        <LanguageSwitcher variant="dynamic" />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-[rgb(var(--primary))] mb-4">
          {t("servicesLanding:hero_title")}
        </h1>
        <p className="text-xl text-[rgb(var(--text-secondary))] max-w-2xl mx-auto">
          {t("servicesLanding:hero_subtitle")}
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <PeriodToggle period={period} onChange={setPeriod} t={t} />
      </div>

      {!workspaceId && (
        <div className="max-w-2xl mx-auto mb-8">
          <InfoNote variant="warning">
            {t("pricing:notes.noWorkspace")}
          </InfoNote>
        </div>
      )}

      {workspace && (
        <div className="max-w-sm mx-auto mb-8">
          <InfoNote variant="info">
            {t("pricing:notes.currentPlanPrefix")}{" "}
            <strong>{workspace.name}</strong>{" "}
            {t("pricing:notes.currentPlanMid")}{" "}
            <strong className="capitalize">{currentPlan}</strong>.
          </InfoNote>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-8 max-w-7xl mx-auto">
        <FreePlanCard
          {...freePlan}
          t={t}
          isCurrentPlan={currentPlan === "free"}
        />

        {paidPlans.map((plan) => (
          <PricingCard
            t={t}
            key={plan.key}
            planKey={plan.key}
            period={period}
            title={plan.title}
            description={plan.description}
            features={plan.features}
            badge={plan.badge}
            isCurrentPlan={currentPlan === plan.key}
            checkoutState={checkoutStates[plan.key]}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      <div className="max-w-2xl mx-auto mt-12 text-center space-y-3">
        <p className="text-sm text-[rgb(var(--text-secondary))] flex items-center justify-center gap-2">
          {t("pricing:notes.mercadopago")}{" "}
          <span className="font-semibold text-sky-500">
            {t("pricing:notes.mercadopagoName")}
          </span>
        </p>
        <p className="text-sm text-[rgb(var(--text-secondary))] max-w-lg mx-auto">
          {t("servicesLanding:closing_message")}
        </p>
      </div>
    </PageWrapper>
  );
};

export default Pricing;
