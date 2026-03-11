import Link from "next/link";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { listValidationLeads, type LeadDecision } from "@/src/leads/server/adminLeads";
import { authorizeAdminAccess } from "@/src/security/adminAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const DECISION_OPTIONS: Array<LeadDecision> = [
  "GO",
  "CONDITIONAL_GO",
  "NEED_WORK",
  "NO_GO",
];

function getSingle(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) return param[0];
  return param;
}

function asPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, parsed);
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value.trim()) {
      search.set(key, value);
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function decisionClass(decision: string | null): string {
  if (decision === "GO") return "bg-emerald-100 text-emerald-800";
  if (decision === "CONDITIONAL_GO") return "bg-blue-100 text-blue-800";
  if (decision === "NEED_WORK") return "bg-amber-100 text-amber-800";
  if (decision === "NO_GO") return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

export default async function AdminLeadsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pages.adminLeads" });

  const search = await searchParams;
  const token = getSingle(search.token);
  const headerStore = await headers();
  const access = authorizeAdminAccess({
    authorizationHeader: headerStore.get("authorization"),
    adminTokenHeader: headerStore.get("x-admin-token"),
    queryToken: token ?? null,
  });

  if (!access.ok) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h1 className="text-xl font-semibold text-rose-900">Admin Access Restricted</h1>
          <p className="mt-2 text-sm text-rose-800">{access.reason}</p>
          <p className="mt-2 text-sm text-rose-700">
            Set <code>ADMIN_DASHBOARD_TOKEN</code> in Vercel, then open this page with{" "}
            <code>?token=YOUR_TOKEN</code>.
          </p>
        </div>
      </main>
    );
  }

  const decisionRaw = getSingle(search.decision);
  const decision = DECISION_OPTIONS.includes(decisionRaw as LeadDecision)
    ? (decisionRaw as LeadDecision)
    : undefined;
  const ideaCategory = getSingle(search.ideaCategory);
  const source = getSingle(search.source);
  const from = getSingle(search.from);
  const to = getSingle(search.to);
  const limit = Math.min(100, Math.max(5, asPositiveInt(getSingle(search.limit), 25)));
  const offset = asPositiveInt(getSingle(search.offset), 0);

  const result = await listValidationLeads({
    decision,
    ideaCategory,
    source,
    from,
    to,
    limit,
    offset,
  });

  const nextOffset = result.offset + result.limit;
  const prevOffset = Math.max(0, result.offset - result.limit);
  const hasPrev = result.offset > 0;
  const hasNext = nextOffset < result.total;

  const baseParams = {
    token,
    decision,
    ideaCategory,
    source,
    from,
    to,
    limit: String(result.limit),
  };

  const prevHref = buildQuery({ ...baseParams, offset: String(prevOffset) });
  const nextHref = buildQuery({ ...baseParams, offset: String(nextOffset) });
  const csvHref = `/api/admin/leads${buildQuery({
    ...baseParams,
    offset: String(result.offset),
    format: "csv",
  })}`;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-700">{t("kicker")}</p>
          <h1 className="mt-2 font-[family:var(--font-display)] text-3xl font-semibold text-slate-950">{t("title")}</h1>
          <p className="mt-2 text-slate-600">{t("subtitle")}</p>
        </div>
        <a
          href={csvHref}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {t("exportCsv")}
        </a>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">{t("stats.total")}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{result.total}</p>
        </div>
        {DECISION_OPTIONS.map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{item}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{result.countsByDecision[item]}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
        <form className="grid gap-3 md:grid-cols-3 lg:grid-cols-6" method="get">
          <select
            name="decision"
            defaultValue={decision ?? ""}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{t("filters.allDecisions")}</option>
            {DECISION_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            name="ideaCategory"
            defaultValue={ideaCategory ?? ""}
            placeholder={t("filters.ideaCategory")}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <input
            name="source"
            defaultValue={source ?? ""}
            placeholder={t("filters.source")}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <input
            type="number"
            min={5}
            max={100}
            name="limit"
            defaultValue={String(result.limit)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />

          <input type="hidden" name="offset" value="0" />

          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-600 hover:to-indigo-600"
          >
            {t("filters.apply")}
          </button>

          <Link
            href={`/${locale}/admin/leads${token ? `?token=${encodeURIComponent(token)}` : ""}`}
            className="rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t("filters.reset")}
          </Link>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">{t("table.created")}</th>
                <th className="px-4 py-3">{t("table.email")}</th>
                <th className="px-4 py-3">{t("table.idea")}</th>
                <th className="px-4 py-3">{t("table.decision")}</th>
                <th className="px-4 py-3">{t("table.category")}</th>
                <th className="px-4 py-3">{t("table.score")}</th>
                <th className="px-4 py-3">{t("table.source")}</th>
                <th className="px-4 py-3">{t("table.country")}</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((lead) => (
                <tr key={lead.id} className="border-t border-slate-100 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(lead.created_at).toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{lead.email}</td>
                  <td className="max-w-[360px] px-4 py-3 text-slate-700">{lead.business_idea}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${decisionClass(lead.decision)}`}>
                      {lead.decision ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{lead.idea_category ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{lead.score ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{lead.source ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{lead.country ?? "-"}</td>
                </tr>
              ))}
              {!result.rows.length ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                    {t("table.empty")}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {t("pagination.showing", {
            from: result.total === 0 ? 0 : result.offset + 1,
            to: Math.min(result.offset + result.limit, result.total),
            total: result.total,
          })}
        </p>
        <div className="flex items-center gap-2">
          <a
            href={hasPrev ? prevHref : undefined}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              hasPrev
                ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                : "cursor-not-allowed border-slate-200 text-slate-400"
            }`}
            aria-disabled={!hasPrev}
          >
            {t("pagination.prev")}
          </a>
          <a
            href={hasNext ? nextHref : undefined}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
              hasNext
                ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                : "cursor-not-allowed border-slate-200 text-slate-400"
            }`}
            aria-disabled={!hasNext}
          >
            {t("pagination.next")}
          </a>
        </div>
      </div>
    </main>
  );
}
