import { createClient } from "@supabase/supabase-js";

export type LeadDecision = "GO" | "CONDITIONAL_GO" | "NEED_WORK" | "NO_GO";

export type ValidationLeadRecord = {
  id: string;
  email: string;
  name: string | null;
  business_idea: string;
  idea_category: string | null;
  score: number | null;
  decision: LeadDecision | null;
  summary: string | null;
  source: string | null;
  language: string | null;
  country: string | null;
  consent_marketing: boolean | null;
  email_sent: boolean | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type LeadListFilters = {
  decision?: LeadDecision;
  ideaCategory?: string;
  source?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type LeadListResult = {
  rows: ValidationLeadRecord[];
  total: number;
  limit: number;
  offset: number;
  countsByDecision: Record<LeadDecision, number>;
};

const DECISIONS: LeadDecision[] = ["GO", "CONDITIONAL_GO", "NEED_WORK", "NO_GO"];

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function clampLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) return 25;
  return Math.max(1, Math.min(200, Math.floor(limit)));
}

function clampOffset(offset?: number): number {
  if (!offset || Number.isNaN(offset)) return 0;
  return Math.max(0, Math.floor(offset));
}

function applyCommonFilters<T extends { eq: (column: string, value: unknown) => T; gte: (column: string, value: string) => T; lte: (column: string, value: string) => T }>(
  query: T,
  filters: LeadListFilters
): T {
  let next = query;
  if (filters.ideaCategory) {
    next = next.eq("idea_category", filters.ideaCategory);
  }
  if (filters.source) {
    next = next.eq("source", filters.source);
  }
  if (filters.from) {
    next = next.gte("created_at", filters.from);
  }
  if (filters.to) {
    next = next.lte("created_at", filters.to);
  }
  return next;
}

export async function listValidationLeads(filters: LeadListFilters): Promise<LeadListResult> {
  const supabase = getSupabaseClient();
  const limit = clampLimit(filters.limit);
  const offset = clampOffset(filters.offset);

  let listQuery = supabase
    .from("validation_leads")
    .select(
      "id,email,name,business_idea,idea_category,score,decision,summary,source,language,country,consent_marketing,email_sent,metadata,created_at,updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  listQuery = applyCommonFilters(listQuery, filters);
  if (filters.decision) {
    listQuery = listQuery.eq("decision", filters.decision);
  }

  const { data, error, count } = await listQuery;
  if (error) {
    throw new Error(`Failed to fetch validation leads: ${error.message}`);
  }

  const counts = await Promise.all(
    DECISIONS.map(async (decision) => {
      let countQuery = supabase
        .from("validation_leads")
        .select("id", { count: "exact", head: true })
        .eq("decision", decision);

      countQuery = applyCommonFilters(countQuery, filters);
      const { error: countError, count: value } = await countQuery;
      if (countError) {
        throw new Error(`Failed to count decision ${decision}: ${countError.message}`);
      }
      return [decision, value ?? 0] as const;
    })
  );

  return {
    rows: (data ?? []) as ValidationLeadRecord[],
    total: count ?? 0,
    limit,
    offset,
    countsByDecision: Object.fromEntries(counts) as Record<LeadDecision, number>,
  };
}
