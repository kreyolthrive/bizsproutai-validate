"use client";

import { useState } from "react";

type Copy = {
  nameLabel: string;
  emailFieldLabel: string;
  subjectLabel: string;
  messageLabel: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  subjectPlaceholder: string;
  messagePlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  successTitle: string;
  successBody: string;
  retryLabel: string;
  validation: {
    emailRequired: string;
    subjectRequired: string;
    messageRequired: string;
  };
};

type Props = {
  copy: Copy;
  locale: string;
};

function getErrorFallback(locale: string) {
  const lang = locale.toLowerCase().split("-")[0];
  if (lang === "fr") return "Échec de l\u2019envoi.";
  if (lang === "es") return "Error al enviar.";
  if (lang === "ht") return "Echèk soumèt.";
  if (lang === "pt") return "Falha ao enviar.";
  return "Failed to submit.";
}

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactForm({ copy, locale }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError(copy.validation.emailRequired);
      return;
    }

    if (!form.subject.trim()) {
      setError(copy.validation.subjectRequired);
      return;
    }

    if (!form.message.trim()) {
      setError(copy.validation.messageRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          locale,
          source: "contact_page",
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || getErrorFallback(locale));
      }

      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : getErrorFallback(locale)
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="mt-10 rounded-[1.75rem] border border-[#dbe7df] bg-[#f8f4ed] p-6 sm:p-8">
        <h2 className="font-[family:var(--font-serif)] text-2xl text-[#1a3a2a]">
          {copy.successTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6b7c72]">
          {copy.successBody}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="landing-btn landing-btn-secondary mt-6"
        >
          {copy.retryLabel}
        </button>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-[1.75rem] border border-[#dbe7df] bg-[#f8f4ed] p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-[#1a3a2a]">
          {copy.nameLabel}
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder={copy.namePlaceholder}
            className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-[#1a3a2a]">
          {copy.emailFieldLabel} *
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder={copy.emailPlaceholder}
            className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            required
          />
        </label>

        <label className="block text-sm font-medium text-[#1a3a2a] sm:col-span-2">
          {copy.subjectLabel} *
          <input
            type="text"
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            placeholder={copy.subjectPlaceholder}
            className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            required
          />
        </label>

        <label className="block text-sm font-medium text-[#1a3a2a] sm:col-span-2">
          {copy.messageLabel} *
          <textarea
            rows={6}
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            placeholder={copy.messagePlaceholder}
            className="mt-2 w-full rounded-[1rem] border border-[#cfdccf] bg-white px-4 py-3 text-[#1a3a2a] outline-none"
            required
          />
        </label>

        {error ? (
          <p className="sm:col-span-2 text-sm font-medium text-rose-700">{error}</p>
        ) : null}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="landing-btn landing-btn-primary landing-btn-primary--large"
          >
            {isSubmitting ? copy.submittingLabel : `${copy.submitLabel} →`}
          </button>
        </div>
      </form>
    </section>
  );
}
