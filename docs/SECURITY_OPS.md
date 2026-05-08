# BizSproutAI Security Operations Guide

## D. Vercel WAF / Firewall Configuration

Vercel's Firewall sits in front of your application code. Configure it via the Vercel Dashboard:

### Required Setup (Vercel Dashboard > Project > Firewall)

1. **Enable Managed Rulesets:**
   - OWASP Core Ruleset — blocks common injection patterns (SQLi, XSS, path traversal)
   - Bot Protection — challenges suspicious non-browser traffic before it hits your Functions
   - AI Bots — blocks known AI scrapers and crawlers

2. **Custom Rules (Firewall > Rules):**
   ```
   Rule: Block oversized POST bodies
   Condition: request.method == "POST" AND request.body.size > 32768
   Action: Block (403)

   Rule: Rate limit /api/validate by IP
   Condition: request.path == "/api/validate"
   Action: Rate Limit (10 requests/hour per IP)

   Rule: Geo-block if needed
   Condition: request.geo.country NOT IN ["US","CA","FR","HT","ES","PT","BR"]
   Action: Challenge
   ```

3. **IP Allowlisting for Admin:**
   - Restrict `/api/admin/*` to known admin IPs via Firewall rules
   - This is a defense-in-depth layer on top of the ADMIN_TOKEN auth

4. **DDoS Protection:**
   - Vercel provides automatic DDoS protection on all plans
   - No configuration needed, but monitor alerts

### Monitoring (Dashboard > Firewall > Logs)
- Review blocked/challenged requests weekly
- Look for patterns: repeated 429s from same IPs, bot-flagged requests
- Adjust thresholds based on real traffic patterns

---

## E. Secrets and Privileged DB Access Lockdown

### Environment Variable Security

| Variable | Where It Must Live | Browser-Safe? |
|----------|-------------------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (server only) | **NEVER** |
| `ADMIN_TOKEN` | Vercel env (server only) | **NEVER** |
| `ADMIN_SESSION_SECRET` | Vercel env (server only) | **NEVER** |
| `OPENAI_API_KEY` | Vercel env (server only) | **NEVER** |
| `ANTHROPIC_API_KEY` | Vercel env (server only) | **NEVER** |
| `PERPLEXITY_API_KEY` | Vercel env (server only) | **NEVER** |
| `IONOS_SMTP_PASS` | Vercel env (server only) | **NEVER** |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel env (public) | Yes (RLS protects data) |
| `NEXT_PUBLIC_POSTHOG_KEY` | Vercel env (public) | Yes |

### Vercel Environment Variables Checklist
1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Ensure all `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_*`, API keys, and SMTP credentials are set as **server-only** (NOT prefixed with `NEXT_PUBLIC_`)
3. Enable "Sensitive" flag for all secrets so they are hidden in logs
4. Rotate `ADMIN_TOKEN` and `ADMIN_SESSION_SECRET` quarterly

### Supabase Security Advisor
1. Go to Supabase Dashboard > Project > Security Advisor
2. Address all findings marked "Critical" or "High"
3. Key checks:
   - RLS is enabled on all tables (see `supabase/rls-policies.sql`)
   - No public access to `service_role` key
   - Database password is strong and rotated
   - Leaked keys check (run `supabase inspect db leaked-keys`)

### Code-Level Guards (already implemented)
- `SUPABASE_SERVICE_ROLE_KEY` is only imported in `src/leads/server/` and `src/validation/server/` — server-only modules
- No Supabase client is created in components or client-side code
- Admin endpoints require session cookie signed with `ADMIN_SESSION_SECRET`

---

## F. Observability Setup (Before Load Testing)

### Sentry (Already Integrated)
- Error tracking via `@sentry/nextjs` — already in `package.json`
- Ensure `SENTRY_DSN` is set in Vercel environment variables
- Configure alerts for: error rate > 5%, new error types

### PostHog (Already Integrated)
- User analytics via `posthog-js` — already in `package.json`
- Track custom events for validation flow:
  - `validation_started` — form submitted
  - `validation_completed` — result returned
  - `validation_error` — any error response
  - `email_sent` / `email_failed`

### Custom Metrics to Add (via Sentry or a logging service)

Create these as structured log entries or Sentry breadcrumbs:

```typescript
// In your API route, after each major step:
console.log(JSON.stringify({
  event: "validation_completed",
  requestId,
  locale: input.locale,
  provider: result.provider,
  score: result.overallScore,
  decision: result.decision,
  durationMs: Date.now() - startTime,
  reportGenerated: !!artifacts.pdfDocument,
  emailSent: emailDelivery.sentToUser,
  leadSaved: leadCapture.saved,
  runSaved: validationRun.saved,
}));
```

### Key Dashboards to Create

| Dashboard | Metrics | Alert Threshold |
|-----------|---------|-----------------|
| Validation Success Rate | 200s / total requests | < 90% over 5 min |
| Provider Health | Success/failure per provider, circuit-open events | Any circuit open |
| Report Generation | Text/PDF success rates, PDF size distribution | PDF failure > 10% |
| Email Delivery | Sent/failed per locale | Failure > 20% |
| Supabase Writes | Lead save / run save success rates | Failure > 5% |
| Rate Limiting | 429 response rate, per-IP distribution | Spike > 3x normal |
| Latency | p50, p95, p99 for /api/validate | p95 > 30s |
| Per-Locale Errors | Error rate broken down by locale | Any locale > 2x others |

### Load Testing with k6

Install: `brew install k6` (or `npm install -g k6`)

```javascript
// k6/validate-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 5 },   // Ramp to 5 users
    { duration: '3m', target: 10 },  // Hold at 10
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<30000'], // 95% under 30s
    http_req_failed: ['rate<0.1'],      // <10% failure
  },
};

export default function () {
  const payload = JSON.stringify({
    email: `loadtest+${__VU}@example.com`,
    idea: 'A mobile app for local farmers to sell produce directly to consumers',
    locale: ['en', 'fr', 'es', 'pt', 'ht'][Math.floor(Math.random() * 5)],
  });

  const res = http.post('https://validate.bizsproutai.com/api/validate', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
    'has requestId': (r) => JSON.parse(r.body).requestId !== undefined,
  });

  sleep(Math.random() * 5 + 2); // 2-7s between requests
}
```

Run: `k6 run k6/validate-load-test.js`

---

## G. RLS Index Tuning for Scale

Apply these indexes **before** soak/load testing. They ensure RLS policies
don't cause sequential scans on growing tables.

```sql
-- Indexes for validation_leads
CREATE INDEX IF NOT EXISTS idx_validation_leads_email
  ON validation_leads (email);

CREATE INDEX IF NOT EXISTS idx_validation_leads_created_at
  ON validation_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_validation_leads_decision
  ON validation_leads (decision);

CREATE INDEX IF NOT EXISTS idx_validation_leads_language
  ON validation_leads (language);

CREATE INDEX IF NOT EXISTS idx_validation_leads_source
  ON validation_leads (source);

-- Composite index for admin filtering (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_validation_leads_admin_filter
  ON validation_leads (decision, created_at DESC);

-- Indexes for business_validation_runs
CREATE INDEX IF NOT EXISTS idx_validation_runs_email
  ON business_validation_runs (email);

CREATE INDEX IF NOT EXISTS idx_validation_runs_created_at
  ON business_validation_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_validation_runs_locale
  ON business_validation_runs (locale);

CREATE INDEX IF NOT EXISTS idx_validation_runs_request_id
  ON business_validation_runs (request_id);

-- If user_id column exists (for future user portal)
-- CREATE INDEX IF NOT EXISTS idx_validation_leads_user_id
--   ON validation_leads (user_id);
-- CREATE INDEX IF NOT EXISTS idx_validation_runs_user_id
--   ON business_validation_runs (user_id);
```

Run against your Supabase project:
```bash
psql $DATABASE_URL -f docs/SECURITY_OPS.md  # Extract SQL above, or:
# Copy the SQL block into Supabase Dashboard > SQL Editor > Run
```

### Performance Verification

After applying indexes, verify with:
```sql
EXPLAIN ANALYZE
SELECT * FROM validation_leads
WHERE decision = 'GO'
ORDER BY created_at DESC
LIMIT 25;
```

Should show `Index Scan` or `Index Only Scan`, NOT `Seq Scan`.
