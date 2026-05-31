# BizSproutAI — Validation Page Testing Backlog

**Goal:** Improve promise fulfillment, trust, and conversion on `/validate`.  
**Audience:** Founders at idea stage through launch-ready.  
**Measurement layer:** Meta Pixel custom events via `trackMeta()` in `lib/analytics/metaEvents.ts`.  
**Last updated:** 2026-05-30

---

## Timing Promise (Canonical)

**"Get your results in about 2 minutes."**

This is the single, consistent timing promise used everywhere in the validate flow. Do not introduce "under a minute" or any other time claim without updating all instances simultaneously.

Current locations where timing appears:
- `trustMeta` → "Free · No account required · Results in about 2 minutes"
- `stepCounter` (step 1 of 4) → "about 2 minutes"
- `pageSubcopy` → "In about 2 minutes, BizSproutAI will show…"
- Test 1 hero-a variant subheadline → "…in about 2 minutes."

---

## Variant Delivery Mechanism

Variants are delivered via `?v=` URL query parameter. No external A/B framework required.

| Value | Meaning |
|-------|---------|
| *(not set)* | control — all defaults |
| `v=hero-a` | Test 1: validation-led hero headline and subheadline |
| `v=cta-b` | Test 4: result-page primary CTA label |
| `v=hero-b` | Variant B: outcome-led ("Find out what to build first") |
| `v=hero-c` | Variant C: app-led ("Turn your idea into a business with AI") |

Route traffic by appending the `?v=` parameter to ad URLs, email links, or organic links.

**Note on hero variant competition:** `hero-a`, `hero-b`, and `hero-c` all modify the same hero section. Run at most two hero variants simultaneously against control to avoid splitting traffic too thin. Recommended pairings: control vs hero-b, control vs hero-c, or winner vs challenger.

**For organic/direct traffic without UTM:** Randomize via sessionStorage assignment (add in a later PR; not needed to launch from ads).

---

## Analytics Payload (All Events)

Every `trackMeta` and `trackMetaStandard` call now includes:

| Field | Values |
|-------|--------|
| `page_variant` | `"control"` / `"hero-a"` / `"cta-b"` |
| `idea_stage` | English stageTag (e.g. `"Idea Stage"`) — result events only |
| `verdict_band` | `"early"` / `"building"` / `"ready"` — result events only |
| `traffic_source` | `utm_source` value or `"referral"` / `"direct"` |
| `locale` | locale string (e.g. `"en"`) |

Events that carry the full payload:
- `ValidationStarted` — stage entry
- `Lead` — form submit
- `CompleteRegistration` — confirmed lead save
- `ValidationCompleted` — result computed
- `ValidationResultView` — result page shown
- `WaitlistJoined` — primary CTA conversion
- `FitCallClick` — secondary CTA click
- `ResultFeedback` — qualitative signal (rating, stage, band, variant, locale)

---

## Qualitative Feedback Signal

A lightweight "Was this result helpful?" widget appears on the result page between the Idea Quality Note and the Locked section. Three buttons: **Yes / Somewhat / No**.

On click: immediately replaces buttons with "Thank you — this helps us improve the analysis." and fires `ResultFeedback` event.

**Segment by:** `verdict_band` (early / building / ready) and `idea_stage` to see whether low-readiness results feel less useful. Use this to prioritize which copy changes matter most.

---

## Rollout Order

### Round 1 — Live Now

Run Test 1 and Test 4 simultaneously. They target different funnel positions and do not interfere.

Run Variant B and Variant C as separate hero challengers against control. Because they compete for the same hero position, run each as a standalone 50/50 split (control vs hero-b, then control vs hero-c) unless traffic volume supports a three-way.

---

#### Test 1 — Hero Promise Clarity

**Hypothesis:** A specific output-named headline ("Validate your business idea before you build") outperforms an aspirational outcome headline ("Get your idea to its first customer") because it reduces uncertainty at first impression.

**Type:** Copy-only  
**Files changed:** `app/[locale]/validate/page.tsx`, `i18n/validateCopy.ts`  
**Delivery:** `?v=hero-a`

| | Headline | Subheadline |
|--|----------|-------------|
| **Control** *(v not set)* | Get your idea to its first customer. | Start with a free validation. In about 2 minutes, BizSproutAI will show your stage, what to build first, what mistake to avoid, and your next 4 execution steps. |
| **Variant A** *(?v=hero-a)* | Validate your business idea before you build. | Get a clear verdict, what to build first, what mistake to avoid, and your next 4 steps — in about 2 minutes. |

**Primary metric:** Form start rate — % of page visitors who select a stage and click Continue (`ValidationStarted` event).  
**Secondary metric:** Completion rate (full form submit → `ValidationCompleted`).  
**Traffic split:** 50 / 50 (route 50% of ad traffic to `?v=hero-a`).  
**Minimum sample:** 200 `ValidationStarted` events per variant.

---

#### Test 4 — Result-Page Primary CTA Label

**Hypothesis:** "See My Full Demand Analysis →" outperforms "Unlock Full Analysis →" because it names a specific deliverable the user cares about (demand signal) rather than a generic unlock action.

**Type:** Copy-only  
**Files changed:** `components/FreeValidationFlow.tsx`, `i18n/validateCopy.ts`  
**Delivery:** `?v=cta-b`

| | Primary CTA Button | Secondary CTA |
|--|-------------------|---------------|
| **Control** *(v not set)* | Unlock Full Analysis → | Book a free fit call *(unchanged)* |
| **Variant B** *(?v=cta-b)* | See My Full Demand Analysis → | Book a free fit call *(unchanged)* |

**Note on "Join the Waitlist →":** This was the original label but has already been replaced with "Unlock Full Analysis →" in production (previous session). The control for this test is the current production state.

**Primary metric:** Waitlist form submit rate — % of result-page viewers who complete the email form (`WaitlistJoined` event).  
**Secondary metric:** Submit rate filtered to `verdict_band = "early"` specifically (highest-volume, most at-risk group).  
**Traffic split:** 50 / 50 (route 50% of result-bound traffic to `?v=cta-b`).  
**Minimum sample:** 150 result-page views per variant.

---

---

#### Variant B — Outcome-Led Hero

**Hypothesis:** "Find out what to build first" outperforms the control because it names a specific, tangible decision the founder needs to make — not a product category or process — which reduces ambiguity and increases perceived relevance.

**Type:** Copy-only + result page label reframes  
**Files changed:** `app/[locale]/validate/page.tsx`, `i18n/validateCopy.ts`, `components/FreeValidationFlow.tsx`  
**Delivery:** `?v=hero-b`

| | Hero Headline | Hero Subheadline | Result Badge | Readiness Label | First Asset Label | Next Steps Label | Waitlist CTA |
|--|--------------|-----------------|-------------|-----------------|------------------|-----------------|-------------|
| **Control** | Get your idea to its first customer. | Start with a free validation… | Your Free Validation Result | Launch readiness | BizSproutAI recommends first | Your next 4 steps | Unlock Full Analysis → |
| **Variant B** | Find out what to build first. | BizSproutAI helps you turn an idea into a clear next move by showing your business starting point, what to focus on first, and the next steps to take. | Your Business Starting Point | Your business starting point | What to focus on first | Your next moves | See My Next Move → |

**Measurement plan:**

| Metric | Formula | Role |
|--------|---------|------|
| Form start rate | `ValidationStarted` / page visitors | **Primary** |
| Primary CTA click rate | `WaitlistJoined` / `ValidationResultView` | Secondary |
| Next-step conversion | `FitCallClick` / `ValidationResultView` | Secondary |
| Funnel reach | `ValidationResultView` / `ValidationStarted` | Supporting |
| Qualitative signal | `ResultFeedback` rating distribution | Supporting |

**Segment by:**
- `verdict_band` — required for all secondary metrics; `early` band is highest-volume and most sensitive to outcome language
- `traffic_source` — paid vs organic may respond differently to "next move" framing
- `locale` — EN only for this variant; exclude non-EN traffic from analysis

**Watch for:** Whether the CTA lift (`WaitlistJoined`) concentrates in `early` / low-clarity outcomes, which would indicate outcome framing is especially effective when the verdict is not yet strong.

**Traffic split:** 50 / 50 (control vs hero-b).  
**Minimum sample:** 200 `ValidationStarted` per variant; 150 `ValidationResultView` per variant for secondary metrics.

---

#### Variant C — App-Led Hero

**Hypothesis:** "Turn your idea into a business with AI" outperforms the control because it positions BizSproutAI as a tool the founder is entering rather than a quiz they are filling out — reducing friction by shifting the mental model from evaluation to action.

**Type:** Copy-only — hero + form entry  
**Files changed:** `app/[locale]/validate/page.tsx`, `i18n/validateCopy.ts`, `components/FreeValidationFlow.tsx`  
**Delivery:** `?v=hero-c`

| | Hero Headline | Hero Subheadline | Step Labels | Step 0 CTA | Submit Button |
|--|--------------|-----------------|-------------|-----------|--------------|
| **Control** | Get your idea to its first customer. | Start with a free validation… | Free Validation — Step N | Continue → | Get My Free Validation → |
| **Variant C** | Turn your idea into a business with AI. | BizSproutAI helps founders move from idea to clarity, execution, and first customer by helping them decide what to build first and what to do next. | Business Builder — Step N | Start Building → | Analyze My Idea → |

**Measurement plan:**

| Metric | Formula | Role |
|--------|---------|------|
| Form start rate | `ValidationStarted` / page visitors | **Primary** |
| Form completion rate | `ValidationCompleted` / `ValidationStarted` | Secondary |
| Step-by-step dropoff | `ValidationStarted` → step 1 → step 2 → `Lead` | Secondary |
| Funnel reach | `ValidationResultView` / `ValidationStarted` | Supporting |
| Qualitative signal | `ResultFeedback` rating distribution | Supporting |

**Segment by:**
- `traffic_source` — paid traffic is primed by an ad; organic traffic has no prior context. The app framing may work differently across these.
- `verdict_band` — check whether app-framing sets expectations that early-stage results fail to meet
- `locale` — EN only; exclude non-EN traffic from analysis

**Watch for:** Higher `ValidationStarted` combined with lower `ValidationCompleted` / `ValidationStarted` ratio — this is the expectation mismatch signal. If C drives more starts but loses people before submit, the framing is over-promising. Also watch `ResultFeedback` ratings: if C produces lower helpfulness scores, the result framing may need to match the app entry promise.

**Traffic split:** 50 / 50 (control vs hero-c).  
**Minimum sample:** 200 `ValidationStarted` per variant.

---

#### Shared Tracking Fields — Variant B and Variant C

All events for both variants carry the following fields automatically via the existing analytics payload. These must be present in every event used for evaluation.

| Field | Values | Use |
|-------|--------|-----|
| `page_variant` | `"hero-b"` / `"hero-c"` / `"control"` | Segment all metrics by variant |
| `verdict_band` | `"early"` / `"building"` / `"ready"` | Segment result-page metrics by outcome quality |
| `idea_stage` | English stage tag | Sub-segment within `early` (Idea Stage vs First Asset) |
| `traffic_source` | `utm_source` or `"referral"` / `"direct"` | Separate paid from organic |
| `locale` | locale string | Exclude non-EN sessions from analysis |

Events to pull for each variant evaluation:

| Event | Variant B | Variant C |
|-------|-----------|-----------|
| `ValidationStarted` | Primary | Primary |
| `ValidationResultView` | Secondary denominator | Supporting |
| `ValidationCompleted` | Supporting | Secondary |
| `WaitlistJoined` | Secondary (CTA rate) | Supporting |
| `FitCallClick` | Secondary (next-step rate) | Supporting |
| `ResultFeedback` | Qualitative signal | Qualitative signal |

---

### Round 2 — After Round 1 Winner Declared

Run Test 2 and Test 3 simultaneously. Both apply to different parts of the flow.

---

#### Test 2 — Submit Button Wording (Tightened to 2-Way)

**Hypothesis:** "See My Verdict →" outperforms "Get My Free Validation →" because naming the specific output (verdict) is more action-motivating than describing the product category (free validation).

**Type:** Copy-only  
**Files to update:** `components/FreeValidationFlow.tsx`  
**Delivery:** `?v=submit-b` *(add to variant allow-list in page.tsx)*

| | Submit Button |
|--|--------------|
| **Control** | Get My Free Validation → |
| **Variant B** | See My Verdict → |

**Traffic split:** 50 / 50.  
**Minimum sample:** 200 step-3 views per variant.

**Note:** Previous plan included 4 variants. Reduced to 2-way to avoid spreading traffic thin. If Variant B wins, run "Find Out What To Build First →" as a 2-way follow-up in Round 3.

---

#### Test 3 — Weak-Result Reassurance Line

**Hypothesis:** Founders who receive a low-readiness result (Idea Stage) are more likely to take the next action when a reassurance line immediately follows the verdict and reframes "too early to build" as an intelligent diagnosis rather than a rejection.

**Type:** Conditional render — already coded, gate by variant  
**Files to update:** `components/FreeValidationFlow.tsx`  
**Delivery:** `?v=reassure-a` *(add to allow-list)*

| | Treatment |
|--|-----------|
| **Control** | No reassurance line (comment out the rIdeaStageReassurance block) |
| **Variant A** | Reassurance line shown: *"This is not a setback — it is the diagnosis that protects you from building the wrong thing. Getting clarity now is exactly the right move."* |

**Primary metric:** `WaitlistJoined` rate for Idea Stage results only (`idea_stage = "Idea Stage"`).  
**Traffic split:** 50 / 50, Idea Stage results only.  
**Minimum sample:** 100 Idea Stage results per variant.

---

### Round 3 — After Round 2

Run in sequence (not simultaneously — these change overlapping sections).

#### Test 5 — Recommendation Logic for Low-Clarity Ideas

**Hypothesis:** When no niche is detected and the idea is at Idea Stage, a named first-asset recommendation (e.g. "Customer problem interview") outperforms the current generic "Customer discovery conversations."

**Type:** Logic change  
**Files to update:** `lib/validation/engineTranslations.ts` (fallback0), `lib/validation/ideaContexts.ts` (improve ecommerce/brand detection)  
**Complexity:** Medium

See backlog entry for implementation details.

---

#### Test 7 — Input Quality Improvements

**Hypothesis:** Adding inline structure to the idea textarea improves average word count and reduces `ideaQualityNote` incidence, which improves result specificity and downstream CTA conversion.

**Type:** UX/copy, no logic  
**Files to update:** `components/FreeValidationFlow.tsx` (step 1 textarea)  
**Delivery:** `?v=input-b` *(add to allow-list)*

**Variants:**
- Control: current textarea with single placeholder  
- Variant B: Word-count indicator below textarea ("Add more detail" below 15 words, "Good" at 15-40, "Great" above 40)

**Metric:** `trackMeta("IdeaSubmitted", { wordCount, hasAudience, variant })` — measure average word count per variant, and `ideaQualityNote` presence rate in results.

---

#### Test 6 — Locked Insights Reframing

Run after Test 7 to avoid touching the same result-page area simultaneously.

**Hypothesis:** Removing the locked section and replacing it with a single tight line above the primary CTA reduces distraction and increases CTA conversion.

**Type:** Layout change  
**Files to update:** `components/FreeValidationFlow.tsx`

**Variants:**
- Control: Three locked cards (current)  
- Variant B: Remove locked section entirely; add one line above CTA: "The full analysis includes demand score, top 3 risks, and your first acquisition channel."

**Metric:** `WaitlistJoined` rate — compare with and without locked section.

---

## Implementation Checklist for Round 1 + Extensions

- [x] Timing normalized to "about 2 minutes" everywhere (trustMeta, stepCounter, pageSubcopy, hero-a subheadline)
- [x] `?v=` param read from searchParams in `validate/page.tsx`
- [x] Variant allow-list: `"hero-a"` and `"cta-b"` (anything else → `"control"`)
- [x] `pageVariant` prop added to `FreeValidationFlow`
- [x] Test 1 hero copy override applied in `validate/page.tsx` for `v=hero-a`
- [x] Test 4 CTA label computed in result view for `v=cta-b`
- [x] `getVerdictBand()` helper added
- [x] All `trackMeta` / `trackMetaStandard` calls enriched with `page_variant`, `idea_stage`, `verdict_band`, `traffic_source`, `locale`
- [x] `ResultFeedback` event added with rating, stage, band, variant, locale
- [x] Qualitative feedback widget added (Yes / Somewhat / No)
- [x] `feedbackState` reset in `handleReset`

- [x] Variant B (`?v=hero-b`) implemented: hero, result labels, waitlist CTA
- [x] Variant C (`?v=hero-c`) implemented: hero, step labels, step 0 CTA, submit button

## Remaining for Round 2+

- [ ] Add `v=submit-b` and `v=reassure-a` to allow-list in `validate/page.tsx`
- [ ] Gate Test 2 submit label by variant in FreeValidationFlow
- [ ] Gate Test 3 reassurance line by variant (currently always shown for Idea Stage)
- [ ] Add sessionStorage random assignment for organic traffic
- [ ] Add `IdeaSubmitted` event with wordCount + hasAudience for Test 7 baseline
