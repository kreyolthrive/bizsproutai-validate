"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  appendSubmission,
  getMicroAppConfigByType,
} from "@/src/microapps/storage";
import type { MicroAppType } from "@/src/microapps/types";

type Props = {
  locale: string;
  microAppType: MicroAppType;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  preferredDateTime: string;
  helpRequest: string;
  addressOrNeighborhood: string;
  serviceType: string;
  requestDescription: string;
  profile: string;
  answer1: string;
  answer2: string;
};

const EMPTY_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  preferredDateTime: "",
  helpRequest: "",
  addressOrNeighborhood: "",
  serviceType: "",
  requestDescription: "",
  profile: "",
  answer1: "",
  answer2: "",
};

export default function MicroAppForm({ locale, microAppType }: Props) {
  const t = useTranslations();
  const [form, setForm] = useState<FormState>(EMPTY_STATE);
  const [submittedName, setSubmittedName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = useMemo(() => getMicroAppConfigByType(microAppType), [microAppType]);
  const localizedMeta = useMemo(() => {
    if (microAppType === "consultation_booking") {
      return {
        title: t("microApps.types.consultation_booking.title"),
        description: t("microApps.types.consultation_booking.description"),
        buttonLabel: t("microApps.types.consultation_booking.buttonLabel"),
        thankYouMessage: t("microApps.types.consultation_booking.thankYouMessage"),
        nextStepNote: t("microApps.types.consultation_booking.nextStepNote"),
        serviceOptions: [] as string[],
      };
    }
    if (microAppType === "service_request") {
      return {
        title: t("microApps.types.service_request.title"),
        description: t("microApps.types.service_request.description"),
        buttonLabel: t("microApps.types.service_request.buttonLabel"),
        thankYouMessage: t("microApps.types.service_request.thankYouMessage"),
        nextStepNote: t("microApps.types.service_request.nextStepNote"),
        serviceOptions: [
          t("microApps.types.service_request.serviceOptions.0"),
          t("microApps.types.service_request.serviceOptions.1"),
          t("microApps.types.service_request.serviceOptions.2"),
        ],
      };
    }
    return {
      title: t("microApps.types.waitlist.title"),
      description: t("microApps.types.waitlist.description"),
      buttonLabel: t("microApps.types.waitlist.buttonLabel"),
      thankYouMessage: t("microApps.types.waitlist.thankYouMessage"),
      nextStepNote: t("microApps.types.waitlist.nextStepNote"),
      serviceOptions: [] as string[],
    };
  }, [microAppType, t]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string {
    if (!form.name.trim()) return t("microApps.form.errors.nameRequired");

    if (microAppType === "consultation_booking") {
      if (!form.email.trim()) return t("microApps.form.errors.emailRequired");
    }

    if (microAppType === "service_request") {
      if (!form.phone.trim()) return t("microApps.form.errors.phoneRequired");
    }

    if (microAppType === "waitlist") {
      if (!form.email.trim()) return t("microApps.form.errors.emailRequired");
    }

    return "";
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    appendSubmission({
      microAppType,
      microAppTitle: localizedMeta.title,
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      preferredDateTime: form.preferredDateTime.trim() || undefined,
      helpRequest: form.helpRequest.trim() || undefined,
      addressOrNeighborhood: form.addressOrNeighborhood.trim() || undefined,
      serviceType: form.serviceType.trim() || undefined,
      requestDescription: form.requestDescription.trim() || undefined,
      profile: form.profile.trim() || undefined,
      qualificationAnswers: [form.answer1.trim(), form.answer2.trim()].filter(Boolean),
    });

    setSubmittedName(form.name.trim());
    setForm(EMPTY_STATE);
    setIsSubmitting(false);
  }

  if (submittedName) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
          <h1 className="text-2xl font-bold text-emerald-900">
            {t("microApps.form.thankYouTitle", { name: submittedName })}
          </h1>
          <p className="mt-3 text-emerald-800">{localizedMeta.thankYouMessage}</p>
          {localizedMeta.nextStepNote ? <p className="mt-2 text-sm text-emerald-700">{localizedMeta.nextStepNote}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSubmittedName("")}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
            >
              {t("microApps.form.submitAnother")}
            </button>
            <Link
              href={`/${locale}/micro-apps`}
              className="rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800"
            >
              {t("microApps.form.viewSubmissions")}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{localizedMeta.title}</h1>
        <p className="mt-2 text-slate-600">{localizedMeta.description}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-800">
          {t("microApps.form.fields.name")} *
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder={t("microApps.form.placeholders.fullName")}
          />
        </label>

        {(microAppType === "consultation_booking" || microAppType === "waitlist") && (
          <label className="block text-sm font-medium text-slate-800">
            {t("microApps.form.fields.email")} *
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder={t("microApps.form.placeholders.email")}
            />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-800">
          {t("microApps.form.fields.phone")}{" "}
          {microAppType === "service_request" ? "*" : `(${t("microApps.form.optional")})`}
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder={t("microApps.form.placeholders.phone")}
          />
        </label>

        {(microAppType === "consultation_booking" || microAppType === "service_request") && (
          <label className="block text-sm font-medium text-slate-800">
            {t("microApps.form.fields.preferredDateTime")}
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={form.preferredDateTime}
              onChange={(e) => updateField("preferredDateTime", e.target.value)}
              placeholder={t("microApps.form.placeholders.preferredDateTime")}
            />
          </label>
        )}

        {microAppType === "consultation_booking" && (
          <label className="block text-sm font-medium text-slate-800">
            {t("microApps.form.fields.helpRequest")}
            <textarea
              rows={4}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              value={form.helpRequest}
              onChange={(e) => updateField("helpRequest", e.target.value)}
              placeholder={t("microApps.form.placeholders.helpRequest")}
            />
          </label>
        )}

        {microAppType === "service_request" && (
          <>
            <label className="block text-sm font-medium text-slate-800">
              {t("microApps.form.fields.addressOrNeighborhood")}
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                value={form.addressOrNeighborhood}
                onChange={(e) => updateField("addressOrNeighborhood", e.target.value)}
                placeholder={t("microApps.form.placeholders.addressOrNeighborhood")}
              />
            </label>

            <label className="block text-sm font-medium text-slate-800">
              {t("microApps.form.fields.serviceType")}
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                value={form.serviceType}
                onChange={(e) => updateField("serviceType", e.target.value)}
              >
                <option value="">{t("microApps.form.selectService")}</option>
                {localizedMeta.serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-800">
              {t("microApps.form.fields.requestDescription")}
              <textarea
                rows={4}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                value={form.requestDescription}
                onChange={(e) => updateField("requestDescription", e.target.value)}
                placeholder={t("microApps.form.placeholders.requestDescription")}
              />
            </label>
          </>
        )}

        {microAppType === "waitlist" && (
          <>
            <label className="block text-sm font-medium text-slate-800">
              {t("microApps.form.fields.profile")}
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                value={form.profile}
                onChange={(e) => updateField("profile", e.target.value)}
                placeholder={t("microApps.form.placeholders.profile")}
              />
            </label>

            <label className="block text-sm font-medium text-slate-800">
              {t("microApps.form.fields.answer1")}
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                value={form.answer1}
                onChange={(e) => updateField("answer1", e.target.value)}
                placeholder={t("microApps.form.optional")}
              />
            </label>

            <label className="block text-sm font-medium text-slate-800">
              {t("microApps.form.fields.answer2")}
              <textarea
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                value={form.answer2}
                onChange={(e) => updateField("answer2", e.target.value)}
                placeholder={t("microApps.form.optional")}
              />
            </label>
          </>
        )}

        {error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {isSubmitting ? t("microApps.form.submitting") : localizedMeta.buttonLabel}
        </button>
      </form>
    </main>
  );
}
