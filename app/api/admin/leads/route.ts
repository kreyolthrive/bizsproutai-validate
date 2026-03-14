import { NextRequest, NextResponse } from "next/server";
import { listValidationLeads, type LeadDecision } from "@/src/leads/server/adminLeads";
import { AdminUnauthorizedError, requireAdminRequest } from "@/src/security/adminAccess";
import { buildCorsHeaders } from "@/src/security/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_DECISIONS: LeadDecision[] = ["GO", "CONDITIONAL_GO", "NEED_WORK", "NO_GO"];

function parseDecision(value: string | null): LeadDecision | undefined {
  if (!value) return undefined;
  return VALID_DECISIONS.includes(value as LeadDecision) ? (value as LeadDecision) : undefined;
}

function parseNumber(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toCsvCell(value: unknown): string {
  const raw = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return `"${raw.replace(/"/g, '""')}"`;
}

function rowsToCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "id,email,business_idea,decision,score,source,language,country,created_at\n";

  const headers = [
    "id",
    "email",
    "name",
    "business_idea",
    "idea_category",
    "score",
    "decision",
    "summary",
    "source",
    "language",
    "country",
    "consent_marketing",
    "email_sent",
    "created_at",
    "updated_at",
  ];

  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => toCsvCell(row[header])).join(","));
  }
  return `${lines.join("\n")}\n`;
}

export async function GET(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  try {
    requireAdminRequest(request);

    const search = request.nextUrl.searchParams;
    const decision = parseDecision(search.get("decision"));
    const ideaCategory = search.get("ideaCategory")?.trim() || undefined;
    const source = search.get("source")?.trim() || undefined;
    const from = search.get("from")?.trim() || undefined;
    const to = search.get("to")?.trim() || undefined;
    const limit = parseNumber(search.get("limit"), 25);
    const offset = parseNumber(search.get("offset"), 0);
    const format = search.get("format")?.toLowerCase() || "json";

    const result = await listValidationLeads({
      decision,
      ideaCategory,
      source,
      from,
      to,
      limit,
      offset,
    });

    if (format === "csv") {
      const csv = rowsToCsv(result.rows as Array<Record<string, unknown>>);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="validation-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
    }

    console.error("Admin leads load error:", error);
    return NextResponse.json(
      { error: "Failed to load admin leads" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
