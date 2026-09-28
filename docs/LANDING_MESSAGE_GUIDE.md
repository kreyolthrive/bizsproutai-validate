# Validation landing page: message and review guide

Updated September 28, 2026. Source: `i18n/landingCopy.ts`.

## Shared identity

**BizSproutAI — Business validation & guided execution.**

BizSproutAI helps first-time founders clarify ideas, test assumptions, create
business assets, and take practical steps toward their first customer.

The validation site is an entry point into that journey. An AI assessment
organizes decisions; customer conversations and real-world experiments provide
evidence. Neither a score nor a 30-day schedule guarantees revenue.

## Page structure and destinations

1. Clear next-step proposition, free validation CTA, and the outputs to expect.
2. Three starting situations: idea, ready to build, launched but stuck.
3. Method: clarify → choose what to test → create a first asset → act and learn.
4. Continue in the main platform, or discuss optional coaching.
5. Existing founder feedback, attributed anonymously by request.
6. FAQs and final free-validation CTA.

| Action | Destination |
| --- | --- |
| Start free validation | `/{locale}/validate` |
| How it works | `/{locale}#how` |
| Next steps | `/{locale}#bridge` |
| Explore the platform | https://bizsproutai.com/ |
| Meet the founder | https://bizsproutai.com/founder-story |
| Book a free fit call | https://cal.com/bizsproutai/30-min-founder-clarity-session |
| LinkedIn | https://www.linkedin.com/in/wagner-desir/ |

The site's `/book` route generates a booking micro-app; it is not the founder's
calendar and must not be used for the fit-call CTA.

## Copy rules

- Keep English, French, Haitian Kreyòl, Spanish, and Portuguese aligned.
- Do not claim guaranteed customers, revenue, instant business success, or
  unmeasured conversion/performance improvements.
- Describe the public method in plain language without claiming ownership of
  third-party frameworks.
- Keep founder testimonials anonymous unless attribution permission is obtained.
- Localized metadata and social previews use the same copy source.
- Coaching is optional; scope and fees are discussed before commitment.

## Verification

`e2e/landing-refresh.spec.ts` covers all five locales at 320, 768, and 1440px,
horizontal overflow, headings, anonymous attribution, CTA destinations,
canonical URLs, anchor targets, mobile navigation/Escape, FAQs, language
switching, and navigation into the existing validation form.

Run:

```sh
pnpm typecheck
pnpm build
pnpm exec playwright test e2e/landing-refresh.spec.ts
```

These checks do not establish live AI response quality, email delivery,
calendar availability, or readiness for a marketing launch.
