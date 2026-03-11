"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getWeekFromTemplate } from "@/src/sprint/config";
import { loadContacts } from "@/src/microapps/storage";
import type { ContactRecord } from "@/src/microapps/types";

type TabKey = "today" | "leads" | "tasks" | "profile";
const TASKS_STORAGE_KEY = "bizspr.mobile.tasks.completed.v1";

function readCompletedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCompletedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(ids));
}

export default function MobileCompanion() {
  const t = useTranslations();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [online, setOnline] = useState(true);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const weekOne = getWeekFromTemplate(1);
  const taskList = useMemo(() => (weekOne?.tasks || []).slice(0, 7), [weekOne]);

  useEffect(() => {
    const handleOnline = () => setOnline(window.navigator.onLine);
    handleOnline();
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOnline);

    setContacts(loadContacts());
    setCompletedIds(readCompletedIds());

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOnline);
    };
  }, []);

  const toggleTask = (taskId: string) => {
    const next = completedIds.includes(taskId)
      ? completedIds.filter((id) => id !== taskId)
      : [...completedIds, taskId];
    setCompletedIds(next);
    writeCompletedIds(next);
  };

  const topThreeTasks = taskList.slice(0, 3);
  const latestLeads = contacts.slice(0, 8);
  const leadCount = contacts.length;
  const doneCount = taskList.filter((task) => completedIds.includes(task.taskId)).length;

  const shareLink = async (path: string) => {
    const fullUrl = `${window.location.origin}/${locale}${path}`;
    if (navigator.share) {
      await navigator.share({ title: "BizSproutAI", url: fullUrl });
      return;
    }
    await navigator.clipboard.writeText(fullUrl);
    alert(t("pages.mobile.copied"));
  };

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{t("pages.mobile.kicker")}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{t("pages.mobile.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("pages.mobile.subtitle")}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <MiniMetric label={t("pages.mobile.metrics.leads")} value={String(leadCount)} />
          <MiniMetric label={t("pages.mobile.metrics.done")} value={`${doneCount}/${taskList.length || 1}`} />
        </div>

        {!online ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            {t("pages.mobile.offline")}
          </p>
        ) : null}
      </section>

      <section className="mt-4 min-h-[420px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        {activeTab === "today" ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t("pages.mobile.tabs.today")}</h2>
            <ul className="mt-3 space-y-3">
              {topThreeTasks.map((task) => (
                <li key={task.taskId} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{task.why}</p>
                  <button
                    type="button"
                    onClick={() => toggleTask(task.taskId)}
                    className={`mt-3 rounded-md px-3 py-1.5 text-xs font-semibold ${
                      completedIds.includes(task.taskId)
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {completedIds.includes(task.taskId)
                      ? t("pages.mobile.actions.completed")
                      : t("pages.mobile.actions.markDone")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {activeTab === "leads" ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t("pages.mobile.tabs.leads")}</h2>
            <ul className="mt-3 space-y-2">
              {latestLeads.length ? (
                latestLeads.map((lead) => (
                  <li key={lead.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">{lead.name || t("pages.mobile.noName")}</p>
                    <p className="text-xs text-slate-500">{lead.channel}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {t("pages.mobile.actions.call")}
                        </a>
                      ) : null}
                      {lead.phone ? (
                        <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                          WhatsApp
                        </a>
                      ) : null}
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          Email
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))
              ) : (
                <li className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  {t("pages.mobile.noLeads")}
                </li>
              )}
            </ul>
          </div>
        ) : null}

        {activeTab === "tasks" ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t("pages.mobile.tabs.tasks")}</h2>
            <ul className="mt-3 space-y-2">
              {taskList.map((task) => (
                <li key={task.taskId} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <p className="pr-3 text-sm text-slate-800">{task.title}</p>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={completedIds.includes(task.taskId)}
                    onChange={() => toggleTask(task.taskId)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {activeTab === "profile" ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t("pages.mobile.tabs.profile")}</h2>
            <p className="mt-3 text-sm text-slate-600">{t("pages.mobile.profile.blurb")}</p>
            <div className="mt-4 space-y-2">
              <button type="button" onClick={() => shareLink('/book')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                {t("pages.mobile.actions.shareBooking")}
              </button>
              <button type="button" onClick={() => shareLink('/request')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                {t("pages.mobile.actions.shareRequest")}
              </button>
              <button type="button" onClick={() => shareLink('/waitlist')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                {t("pages.mobile.actions.shareWaitlist")}
              </button>
            </div>
            <Link href={`/${locale}/dashboard`} className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              {t("pages.mobile.actions.openWeb")}
            </Link>
          </div>
        ) : null}
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-md border-t border-slate-200 bg-white px-2 py-2">
        <TabButton label={t("pages.mobile.tabs.today")} active={activeTab === "today"} onClick={() => setActiveTab("today")} />
        <TabButton label={t("pages.mobile.tabs.leads")} active={activeTab === "leads"} onClick={() => setActiveTab("leads")} />
        <TabButton label={t("pages.mobile.tabs.tasks")} active={activeTab === "tasks"} onClick={() => setActiveTab("tasks")} />
        <TabButton label={t("pages.mobile.tabs.profile")} active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
      </nav>
      <div className="h-16" />
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold ${active ? "bg-blue-600 text-white" : "text-slate-600"}`}
    >
      {label}
    </button>
  );
}
