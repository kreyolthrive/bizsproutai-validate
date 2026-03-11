"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  loadContacts,
  loadMicroAppConfigs,
  loadSubmissions,
} from "@/src/microapps/storage";
import type { ContactChannel, MicroAppType } from "@/src/microapps/types";

type Tab = "bookings" | "requests" | "waitlist" | "contacts";

const TAB_TO_TYPE: Record<Exclude<Tab, "contacts">, MicroAppType> = {
  bookings: "consultation_booking",
  requests: "service_request",
  waitlist: "waitlist",
};

const TAB_TO_CHANNEL: Record<Exclude<Tab, "contacts">, ContactChannel> = {
  bookings: "micro_app_booking",
  requests: "micro_app_service_request",
  waitlist: "micro_app_waitlist",
};

export default function MicroAppsAdmin() {
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>("bookings");

  const submissions = useMemo(() => loadSubmissions(), []);
  const contacts = useMemo(() => loadContacts(), []);
  const configs = useMemo(() => loadMicroAppConfigs(), []);
  const configTitleByType: Record<MicroAppType, string> = {
    consultation_booking: t("microApps.types.consultation_booking.title"),
    service_request: t("microApps.types.service_request.title"),
    waitlist: t("microApps.types.waitlist.title"),
  };

  const filteredSubmissions =
    tab === "contacts"
      ? []
      : submissions.filter((item) => item.microAppType === TAB_TO_TYPE[tab]);

  const filteredContacts =
    tab === "contacts"
      ? contacts
      : contacts.filter((item) => item.channel === TAB_TO_CHANNEL[tab]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900">{t("microApps.admin.title")}</h1>
      <p className="mt-2 text-slate-600">
        {t("microApps.admin.subtitle")}
      </p>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("microApps.admin.publishedUrls")}
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {configs.map((config) => (
            <div key={config.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">{configTitleByType[config.type]}</p>
              <p className="mt-1 text-sm text-slate-600">{config.urlPath}</p>
              <p className="mt-1 text-xs text-slate-500">
                {t("microApps.admin.statusLabel")}: {config.enabled ? t("microApps.admin.statusLive") : t("microApps.admin.statusDisabled")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          ["bookings", t("microApps.admin.tabs.bookings")],
          ["requests", t("microApps.admin.tabs.requests")],
          ["waitlist", t("microApps.admin.tabs.waitlist")],
          ["contacts", t("microApps.admin.tabs.contacts")],
        ] as Array<[Tab, string]>).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              tab === key ? "bg-blue-600 text-white" : "bg-white text-slate-700 ring-1 ring-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab !== "contacts" ? (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            {t("microApps.admin.submissions")} ({filteredSubmissions.length})
          </h3>
          <div className="mt-3 space-y-3">
            {filteredSubmissions.length === 0 ? (
              <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">{t("microApps.admin.noSubmissions")}</p>
            ) : (
              filteredSubmissions.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">
                    {item.email || t("microApps.admin.noEmail")} {item.phone ? `• ${item.phone}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(item.submittedAt).toLocaleString()}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {[
                      item.helpRequest,
                      item.requestDescription,
                      item.serviceType ? `Service type: ${item.serviceType}` : "",
                      item.preferredDateTime ? `Preferred time: ${item.preferredDateTime}` : "",
                      item.profile ? `Profile: ${item.profile}` : "",
                    ]
                      .filter(Boolean)
                      .join("\n") || t("microApps.admin.noExtraNotes")
                    }
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {tab === "contacts" ? t("microApps.admin.globalContacts") : t("microApps.admin.filteredContacts")} ({filteredContacts.length})
        </h3>
        <div className="mt-3 space-y-3">
          {filteredContacts.length === 0 ? (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">{t("microApps.admin.noContacts")}</p>
          ) : (
            filteredContacts.map((contact) => (
              <article key={contact.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{contact.name}</p>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    {contact.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{contact.channel}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {contact.email || t("microApps.admin.noEmail")} {contact.phone ? `• ${contact.phone}` : ""}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{contact.notes}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
