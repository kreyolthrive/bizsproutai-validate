const baseUrl = process.env.VALIDATE_URL || "http://localhost:3000";

const locales = ["en", "fr", "ht", "es", "pt"];

const payloadBase = {
  idea: "A SaaS platform that helps small cleaning businesses automate quotes, invoices, and appointment reminders.",
  email: "YOUR_REAL_TEST_EMAIL@example.com",
  targetCustomer: "small cleaning business owners",
  targetMarket: "local service businesses",
  location: "Miami, Florida",
  offer: "software subscription",
  problem: "manual quoting, invoicing, and missed follow-ups",
  pricingIdea: "$29-$99/month",
  budgetUsd: 500,
  skillSummary: "sales, operations, customer service",
  timelineDays: 30,
  website: "",
};

function hasEnglishLeak(text) {
  if (!text || typeof text !== "string") return false;
  const suspicious = [
    "Validation completed.",
    "Business Validation Report",
    "Submitted Idea",
    "Next Steps",
    "Promising — Ready to Execute",
    "Early Stage — Validate Before Building",
    "High Risk — Improve or Pivot",
  ];
  return suspicious.some((phrase) => text.includes(phrase));
}

async function testLocale(locale) {
  const payload = { ...payloadBase, locale };

  const response = await fetch(`${baseUrl}/api/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-locale": locale,
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Non-JSON response for ${locale}: ${text.slice(0, 200)}`);
  }

  const reportText = data?.report?.text || "";
  const emailErrors = Array.isArray(data?.emailDelivery?.errors)
    ? data.emailDelivery.errors
    : [];

  return {
    locale,
    status: response.status,
    ok: response.ok,
    requestId: data?.requestId || null,
    returnedLocale:
      data?.submittedContext?.locale ||
      data?.locale ||
      payload.locale,
    hasReport: Boolean(data?.report?.text),
    hasPdf: Boolean(data?.report?.pdf?.contentBase64),
    pdfError: data?.report?.pdfError || null,
    leadSaved: Boolean(data?.leadCapture?.saved),
    validationRunSaved: Boolean(data?.validationRun?.saved),
    emailSentToUser: Boolean(data?.emailDelivery?.sentToUser),
    emailSentToOwner: Boolean(data?.emailDelivery?.sentToOwner),
    emailErrors,
    summary: data?.summary?.oneLiner || null,
    framework: data?.frameworkUsed || data?.framework_used || null,
    category: data?.businessCategory || data?.business_category || null,
    constructiveVerdictLabel: data?.constructiveVerdictLabel || null,
    nextStepsCount: Array.isArray(data?.recommendedNextSteps)
      ? data.recommendedNextSteps.length
      : Array.isArray(data?.recommended_next_steps)
        ? data.recommended_next_steps.length
        : 0,
    pillarCount: Array.isArray(data?.pillarValidation?.pillars)
      ? data.pillarValidation.pillars.length
      : 0,
    englishLeakInReport: locale !== "en" ? hasEnglishLeak(reportText) : false,
    error: data?.error || null,
  };
}

async function main() {
  const results = [];

  for (const locale of locales) {
    try {
      const result = await testLocale(locale);
      results.push(result);
    } catch (error) {
      results.push({
        locale,
        ok: false,
        status: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log(JSON.stringify(results, null, 2));

  const failures = results.filter(
    (r) =>
      !r.ok ||
      !r.hasReport ||
      r.pillarCount < 3 ||
      (r.locale !== "en" && r.englishLeakInReport)
  );

  console.log("");
  console.log("Verification summary:");
  console.log(`Passed: ${results.length - failures.length}`);
  console.log(`Failed: ${failures.length}`);

  if (failures.length > 0) {
    console.log("");
    console.log("Failures:");
    for (const failure of failures) {
      console.log(`- ${failure.locale}: ${failure.error || "check output fields"}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
