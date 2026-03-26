"use client";

import { useMemo, useState } from "react";

type ServiceOption = {
  id: string;
  title: string;
  description: string;
};

type Copy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  servicesTitle: string;
  servicesHint: string;
  formTitle: string;
  formBody: string;
  labels: {
    name: string;
    businessName: string;
    email: string;
    phone: string;
    selectedServices: string;
    website: string;
    stage: string;
    targetCustomer: string;
    challenge: string;
    goal: string;
    extra: string;
    consent: string;
  };
  placeholders: {
    name: string;
    businessName: string;
    email: string;
    phone: string;
    selectedServices: string;
    website: string;
    targetCustomer: string;
    challenge: string;
    goal: string;
    extra: string;
  };
  stages: Array<{ value: string; label: string }>;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  retry: string;
  validation: {
    serviceRequired: string;
    contactRequired: string;
    businessNameRequired: string;
  };
};

type Props = {
  copy: Copy;
  locale: string;
  initialService?: string;
};

type FormState = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  websiteUrl: string;
  stage: string;
  targetCustomer: string;
  biggestChallenge: string;
  goal30Days: string;
  extraContext: string;
  consentFollowUp: boolean;
};

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    id: "idea_validation_sprint",
    title: "Idea Validation Sprint",
    description: "Pressure-test the idea, audience, and offer before you build.",
  },
  {
    id: "website_messaging_refresh",
    title: "Website Build & Messaging Refresh",
    description: "Clarify the message and rebuild the site around conversion.",
  },
  {
    id: "ai_workflow_setup",
    title: "AI Workflow Setup",
    description: "Map time drains and build AI workflows that fit your business.",
  },
  {
    id: "booking_follow_up_system",
    title: "Booking & Follow-Up System",
    description: "Create a booking flow and follow-up system so leads do not go cold.",
  },
  {
    id: "ai_onboarding",
    title: "AI Onboarding for Brand Owners",
    description: "Choose the right AI tools and get templates you can use immediately.",
  },
];

const EMPTY_FORM: FormState = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  websiteUrl: "",
  stage: "",
  targetCustomer: "",
  biggestChallenge: "",
  goal30Days: "",
  extraContext: "",
  consentFollowUp: true,
};

export function ActionPlanIntake({ copy, locale, initialService }: Props) {
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialService && SERVICE_OPTIONS.some((item) => item.id === initialService)
      ? [initialService]
      : []
  );
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedServiceTitles = useMemo(
    () =>
      SERVICE_OPTIONS.filter((item) => selectedServices.includes(item.id)).map(
        (item) => item.title
      ),
    [selectedServices]
  );

  function toggleService(serviceId: string) {
    setSelectedServices((current) =>
      current.includes(serviceId)
        ? current.filter((item) => item !== serviceId)
        : [...current, serviceId]
    );
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (selectedServices.length === 0) {
      setError(copy.validation.serviceRequired);
      return;
    }

    if (!form.businessName.trim()) {
      setError(copy.validation.businessNameRequired);
      return;
    }

    if (!form.email.trim() || !form.phone.trim()) {
      setError(copy.validation.contactRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/action-plan-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          locale,
          selectedServices,
          selectedServiceTitles,
          source: "action_plan_page",
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to submit.");
      }

      setSubmitted(true);
      setForm(EMPTY_FORM);
      setSelectedServices([]);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to submit."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="brand-panel rounded-[2rem] p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4a8c5c]">
          BizSproutAI
        </p>
        <h2 className="mt-3 font-[family:var(--font-serif)] text-4xl leading-tight text-[#1a3a2a]">
          {copy.successTitle}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#6b7c72]">
          {copy.successBody}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="landing-btn landing-btn-secondary mt-8"
        >
          {copy.retry}
        </button>
      </section>
    );
  }

  return (
    <section className="brand-panel rounded-[2rem] p-8 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4a8c5c]">
        {copy.eyebrow}
      </p>
      <h1 className="mt-3 font-[family:var(--font-serif)] text-4xl leading-tight text-[#1a3a2a] sm:text-5xl">
        {copy.title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-[#6b7c72]">{copy.subtitle}</p>

      <div className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-[family:var(--font-serif)] text-2xl text-[#1a3a2a]">
            {copy.servicesTitle}
          </h2>
          <p className="text-sm text-[#6b7c72]">{copy.servicesHint}</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SERVICE_OPTIONS.map((service) => {
            const active = selectedServices.includes(service.id);

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                className={`rounded-[1.5rem] border p-5 text-left transition ${
                  active
                    ? "border-[#2d5a3d] bg-[#1a3a2a] text-white shadow-lg shadow-[#1a3a2a]/15"
                    : "border-[#dbe7df] bg-white text-[#1a3a2a]"
                }`}
              >
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7ec850]">
                  {active ? "Selected" : "Service"}
                </div>
                <h3 className="mt-3 text-xl font-semibold">{service.title}</h3>
                <p className={`mt-3 text-sm leading-6 ${active ? "text-white/78" : "text-[#6b7c72]"}`}>
                  {service.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10">
        <div className="mb-6">
          <h2 className="font-[family:var(--font-serif)] text-2xl text-[#1a3a2a]">
            {copy.formTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7c72]">{copy.formBody}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-[#1a3a2a] md:col-span-2">
            {copy.labels.selectedServices} *
            <textarea
              rows={selectedServiceTitles.length > 1 ? 2 : 1}
              value={selectedServiceTitles.join(", ")}
              readOnly
              placeholder={copy.placeholders.selectedServices}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-[#f8f4ed] px-4 py-3 text-[#1a3a2a] outline-none"
            />
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a]">
            {copy.labels.name}
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder={copy.placeholders.name}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            />
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a]">
            {copy.labels.businessName} *
            <input
              value={form.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
              placeholder={copy.placeholders.businessName}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            />
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a]">
            {copy.labels.email} *
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder={copy.placeholders.email}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a]">
            {copy.labels.phone} *
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder={copy.placeholders.phone}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
              required
            />
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a] md:col-span-2">
            {copy.labels.website}
            <input
              value={form.websiteUrl}
              onChange={(event) => updateField("websiteUrl", event.target.value)}
              placeholder={copy.placeholders.website}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            />
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a] md:col-span-2">
            {copy.labels.stage}
            <select
              value={form.stage}
              onChange={(event) => updateField("stage", event.target.value)}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            >
              <option value="">{copy.labels.stage}</option>
              {copy.stages.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a] md:col-span-2">
            {copy.labels.targetCustomer}
            <textarea
              rows={3}
              value={form.targetCustomer}
              onChange={(event) => updateField("targetCustomer", event.target.value)}
              placeholder={copy.placeholders.targetCustomer}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            />
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a] md:col-span-2">
            {copy.labels.challenge}
            <textarea
              rows={4}
              value={form.biggestChallenge}
              onChange={(event) => updateField("biggestChallenge", event.target.value)}
              placeholder={copy.placeholders.challenge}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            />
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a] md:col-span-2">
            {copy.labels.goal}
            <textarea
              rows={3}
              value={form.goal30Days}
              onChange={(event) => updateField("goal30Days", event.target.value)}
              placeholder={copy.placeholders.goal}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            />
          </label>

          <label className="block text-sm font-medium text-[#1a3a2a] md:col-span-2">
            {copy.labels.extra}
            <textarea
              rows={5}
              value={form.extraContext}
              onChange={(event) => updateField("extraContext", event.target.value)}
              placeholder={copy.placeholders.extra}
              className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            />
          </label>
        </div>

        <label className="mt-5 flex items-start gap-3 text-sm text-[#1a3a2a]">
          <input
            type="checkbox"
            checked={form.consentFollowUp}
            onChange={(event) => updateField("consentFollowUp", event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[#cfdccf]"
          />
          <span>{copy.labels.consent}</span>
        </label>

        {error ? <p className="mt-4 text-sm font-medium text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="landing-btn landing-btn-primary landing-btn-primary--large mt-6"
        >
          {isSubmitting ? copy.submitting : `${copy.submit} →`}
        </button>
      </form>
    </section>
  );
}
