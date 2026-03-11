"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getWeekFromTemplate } from "@/src/sprint/config";
import { loadContacts, loadSubmissions } from "@/src/microapps/storage";

const TASKS_STORAGE_KEY = "bizspr.mobile.tasks.completed.v1";

function loadCompletedTasks(): string[] {
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

export default function LaunchOverview() {
  const t = useTranslations();
  const locale = useLocale();
  const [leads, setLeads] = useState(0);
  const [submissions, setSubmissions] = useState(0);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  const weekOne = getWeekFromTemplate(1);
  const weekTasks = useMemo(() => (weekOne?.tasks || []).slice(0, 5), [weekOne]);

  useEffect(() => {
    setLeads(loadContacts().length);
    setSubmissions(loadSubmissions().length);
    setCompletedTaskIds(loadCompletedTasks());
  }, []);

  const completedCount = weekTasks.filter((task) => completedTaskIds.includes(task.taskId)).length;
  const totalCount = weekTasks.length || 1;
  const sprintPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">{t("pages.dashboard.kicker")}</p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">{t("pages.dashboard.title")}</h1>
        <p className="mt-3 max-w-3xl text-blue-100">{t("pages.dashboard.subtitle")}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <StatCard label={t("pages.dashboard.stats.sprint")} value={`${sprintPercent}%`} />
          <StatCard label={t("pages.dashboard.stats.tasks")} value={`${completedCount}/${totalCount}`} />
          <StatCard label={t("pages.dashboard.stats.leads")} value={`${leads}`} />
          <StatCard label={t("pages.dashboard.stats.submissions")} value={`${submissions}`} />
        </div>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{t("pages.dashboard.webPanel.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t("pages.dashboard.webPanel.body")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionLink href={`/${locale}/website-builder`} label={t("pages.dashboard.actions.builder")} />
            <ActionLink href={`/${locale}/launch-kit`} label={t("pages.dashboard.actions.launchKit")} />
            <ActionLink href={`/${locale}/micro-apps`} label={t("pages.dashboard.actions.microApps")} />
            <ActionLink href={`/${locale}/social-agent`} label={t("pages.dashboard.actions.social")} />
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{t("pages.dashboard.mobilePanel.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t("pages.dashboard.mobilePanel.body")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionLink href={`/${locale}/mobile`} label={t("pages.dashboard.actions.mobileCompanion")} />
            <ActionLink href={`/${locale}/book`} label={t("pages.dashboard.actions.booking")} />
            <ActionLink href={`/${locale}/request`} label={t("pages.dashboard.actions.request")} />
            <ActionLink href={`/${locale}/waitlist`} label={t("pages.dashboard.actions.waitlist")} />
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{t("pages.dashboard.today.title")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("pages.dashboard.today.subtitle")}</p>
        <ul className="mt-4 space-y-3">
          {weekTasks.slice(0, 3).map((task) => {
            const done = completedTaskIds.includes(task.taskId);
            return (
              <li key={task.taskId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                <p className="mt-1 text-sm text-slate-600">{task.why}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {done ? t("pages.dashboard.today.done") : t("pages.dashboard.today.pending")}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-wide text-blue-200">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
      {label}
    </Link>
  );
}
