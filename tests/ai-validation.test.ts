import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveValidationContext } from "../src/validation/engine/aiValidation";
import { validateIdeaDynamic } from "../src/validation/engine/orchestrator";

const ORIGINAL_ENV = { ...process.env };

function openAIResponse(content: unknown): Response {
  return new Response(
    JSON.stringify({
      choices: [
        {
          message: {
            content: JSON.stringify(content),
          },
        },
      ],
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    }
  );
}

describe("AI-driven validation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.ENABLE_AI_VALIDATION = "true";
    process.env.OPENAI_API_KEY = "test-openai-key";
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.PERPLEXITY_API_KEY;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("uses the LLM response as the business analysis framework output", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                    category: "tech",
                    frameworkHint: "mobile_web_app_v1",
                    countryCode: "US",
                      region: "north_america",
                      categoryConfidence: 1,
                      countryConfidence: 0.7,
                      categoryEvidence: ["Explicit category is tech."],
                      countryEvidence: ["Defaulting to US context."],
                    }),
                  },
                },
              ],
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json",
              },
            }
          )
        )
        .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    framework: {
                      archetype: "tech",
                      label: "Tech Products & Apps",
                    },
                    summary: {
                      oneLiner: "Strong go-to-market signal from the AI validator",
                      topOpportunities: ["Niche ICP is clear", "Offer is easy to test"],
                      biggestRisks: ["Need proof of willingness to pay"],
                    },
                    assumptions: ["Early adopters feel this problem weekly."],
                    missingInfo: ["Detailed CAC target is still unknown."],
                    criteria: [
                      {
                        key: "problem_validation",
                        score: 4,
                        evidence: ["Specific buyer pain is described."],
                        risks: ["No pre-sales evidence yet."],
                        recommendations: ["Run 10 buyer interviews this week."],
                      },
                      {
                        key: "market_size",
                        score: 4,
                        evidence: ["Large serviceable segment exists."],
                        risks: [],
                        recommendations: ["Quantify TAM/SAM/SOM with real sources."],
                      },
                      {
                        key: "execution_ability",
                        score: 3,
                        evidence: ["Founder can ship a lightweight MVP."],
                        risks: ["Execution bandwidth may be thin."],
                        recommendations: ["Reduce MVP scope to one workflow."],
                      },
                      {
                        key: "distribution",
                        score: 4,
                        evidence: ["ICP can be reached directly on LinkedIn."],
                        risks: [],
                        recommendations: ["Build a weekly outbound cadence."],
                      },
                      {
                        key: "business_model",
                        score: 4,
                        evidence: ["Subscription pricing fits the use case."],
                        risks: [],
                        recommendations: ["Test two price anchors before launch."],
                      },
                    ],
                    problemDemand: {
                      painLevel: 4.2,
                      demandFrequency: 3.9,
                      marketCoverage: 3.8,
                      currentGap: 4.1,
                      total: 16,
                      passGate1: true,
                      keyInsight: "The problem is urgent enough for a paid pilot.",
                      reasoning: "Pain is specific and recurring.",
                    },
                    primarySegment: {
                      name: "Independent real estate agents",
                      who: "Solo and small-team agents",
                      jobToBeDone: "Generate and schedule better social content quickly",
                      currentPain: "Posting is inconsistent and manual",
                      willingnessToPay: "Medium to high",
                      reachChannels: ["LinkedIn", "Instagram", "Referrals"],
                      scores: {
                        reachability: 4.1,
                        painLevel: 4,
                        payingCapability: 3.7,
                        total: 11.8,
                      },
                      reasoning: "The buyer is easy to reach and already spends on lead generation.",
                    },
                    solutionValidation: {
                      painCoverage: 4,
                      differentiation: 3.8,
                      adoptionFriction: 2.1,
                      score: 4.1,
                      passGate3: true,
                      reasoning: "The product is differentiated enough for an MVP test.",
                    },
                    marketValidation: {
                      tam: 250000000,
                      sam: 25000000,
                      som: 2500000,
                      confidence: 0.73,
                      passGate4: true,
                      directCompetitors: ["Generic social tools"],
                      indirectAlternatives: ["Manual posting"],
                      statusQuo: ["Hiring a freelancer"],
                      reasoning: "The obtainable market is large enough for a niche software business.",
                    },
                    businessModelValidation: {
                      model: "Monthly subscription",
                      entryPrice: 49,
                      anchorPrice: 149,
                      margin: 82,
                      score: 4.2,
                      passGate4: true,
                      reasoning: "Gross margin is healthy for software.",
                    },
                    operationalValidation: {
                      score: 3.8,
                      passGate5: true,
                      keyConstraints: ["Need onboarding support scripts"],
                      reasoning: "Operations are feasible with a narrow MVP.",
                    },
                    gates: [
                      {
                        gate: 1,
                        name: "Problem & Demand",
                        score: 16,
                        maxScore: 20,
                        passed: true,
                        status: "PASS",
                        reasoning: "Pain is clear.",
                      },
                      {
                        gate: 2,
                        name: "Customer & Location Fit",
                        score: 11.8,
                        maxScore: 15,
                        passed: true,
                        status: "PASS",
                        reasoning: "ICP is reachable.",
                      },
                      {
                        gate: 3,
                        name: "Competition & Differentiation",
                        score: 4.1,
                        maxScore: 5,
                        passed: true,
                        status: "PASS",
                        reasoning: "Differentiation is good enough.",
                      },
                      {
                        gate: 4,
                        name: "Business Model & Unit Economics",
                        score: 4.2,
                        maxScore: 5,
                        passed: true,
                        status: "PASS",
                        reasoning: "Margin is strong.",
                      },
                      {
                        gate: 5,
                        name: "Operational Feasibility",
                        score: 3.8,
                        maxScore: 5,
                        passed: true,
                        status: "PASS",
                        reasoning: "The team can execute this MVP.",
                      },
                    ],
                    failureRisks: [
                      {
                        criterion: "Problem Validation",
                        score: 3,
                        reason: "Paid demand is not fully proven yet.",
                        severity: "medium",
                      },
                    ],
                    fixes: [
                      {
                        issue: "Demand proof is still light",
                        action: "Run 10 interviews and pre-sell 3 design-partner seats.",
                        expectedImpact: "Improves confidence before build-out.",
                      },
                    ],
                    alternatives: [
                      {
                        model: "Done-with-you consulting offer",
                        reason: "Lets the founder validate demand faster.",
                        viability: 4,
                      },
                    ],
                    nextActions: [
                      "Interview 10 agents",
                      "Pre-sell 3 pilots",
                      "Ship a narrow MVP",
                    ],
                    decision: "GO",
                    weightedScore: 81,
                  }),
                },
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          }
        )
      )
    );

    const result = await validateIdeaDynamic({
      idea: "AI social media manager for real estate agents",
      category: "tech",
      locale: "en",
    });

    expect(result.status).toBe("GO");
    expect(result.framework).toEqual({
      archetype: "tech",
      label: "Tech Products & Apps",
    });
    expect(result.summary.oneLiner).toBe("Strong go-to-market signal from the AI validator");
    expect(result.frameworkReport?.decision).toBe("GO");
    expect(result.frameworkReport?.weightedScore).toBe(81);
    expect(result.criteria[0]?.recommendations[0]).toBe("Run 10 buyer interviews this week.");
    expect(result.frameworkUsed).toBe("mobile_web_app_v1");
    expect(result.inferredBusinessModel?.frameworkId).toBe("mobile_web_app_v1");
  });

  it("overrides an AI saas classification for physical subscription products", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    category: "saas",
                    frameworkHint: "saas_v1",
                    countryCode: "US",
                    region: "north_america",
                    categoryConfidence: 0.96,
                    countryConfidence: 0.8,
                    categoryEvidence: ["Detected subscription revenue."],
                    countryEvidence: ["U.S. market wording."],
                  }),
                },
              },
            ],
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          }
        )
      )
    );

    const result = await resolveValidationContext(
      {
        idea:
          "Monthly subscription box delivering artisanal coffee beans from different regions. Subscribers pay $35/month and receive 2-3 coffee varieties with tasting notes and brewing guides.",
      },
      "en"
    );

    expect(result.category).toBe("ecommerce");
    expect(result.categoryClassification.category).toBe("ecommerce");
    expect(result.categoryClassification.evidence.join(" ")).toMatch(/physical|delivery|subscription/i);
    expect(result.frameworkHint).toBe("ecommerce_v1");
  });

  it("lets the AI infer category and country context before the main analysis", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    category: "consulting",
                    frameworkHint: "coaching_consulting_v1",
                    countryCode: "US",
                    region: "north_america",
                    categoryConfidence: 0.96,
                    countryConfidence: 0.76,
                    categoryEvidence: ["The idea is positioned as a service business for clients."],
                    countryEvidence: ["Miami is mentioned directly in the idea."],
                  }),
                },
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    framework: {
                      archetype: "consulting",
                      label: "Consulting",
                    },
                    summary: {
                      oneLiner: "This service idea is promising with focused outreach.",
                      topOpportunities: ["Direct access to buyers"],
                      biggestRisks: ["Need clearer case studies"],
                    },
                    assumptions: ["The founder can deliver the service consistently."],
                    missingInfo: ["Proof of past results."],
                    criteria: [
                      { key: "expertise_depth", score: 3, evidence: ["Founder experience implied"], risks: ["Need testimonials"], recommendations: ["Get 2 pilot testimonials"] },
                      { key: "problem_value", score: 4, evidence: ["Strong promised outcome"], risks: [], recommendations: ["Clarify ROI"] },
                      { key: "market_access", score: 4, evidence: ["Outbound is viable"], risks: [], recommendations: ["Create a 30-day outreach plan"] },
                      { key: "delivery_model", score: 4, evidence: ["Lean service scope"], risks: [], recommendations: ["Document SOPs"] },
                      { key: "pricing_power", score: 4, evidence: ["Specific audience"], risks: [], recommendations: ["Refine offer"] },
                    ],
                    problemDemand: {
                      painLevel: 4,
                      demandFrequency: 4,
                      marketCoverage: 3.5,
                      currentGap: 4,
                      total: 15.5,
                      passGate1: true,
                      keyInsight: "Clients need better lead generation help.",
                      reasoning: "Pain is explicit and commercial.",
                    },
                    primarySegment: {
                      name: "Busy real estate agents",
                      who: "Independent agents in Miami",
                      jobToBeDone: "Get more leads without handling marketing alone",
                      currentPain: "They lack time and consistent marketing output",
                      willingnessToPay: "High enough for a retainer",
                      reachChannels: ["LinkedIn", "Instagram", "Referrals"],
                      scores: {
                        reachability: 4,
                        painLevel: 4,
                        payingCapability: 4,
                        total: 12,
                      },
                      reasoning: "Buyer access is straightforward.",
                    },
                    solutionValidation: {
                      painCoverage: 4,
                      differentiation: 3.8,
                      adoptionFriction: 2,
                      score: 4,
                      passGate3: true,
                      reasoning: "Service delivery is easy to trial.",
                    },
                    marketValidation: {
                      tam: 100000000,
                      sam: 12000000,
                      som: 850000,
                      confidence: 0.7,
                      passGate4: true,
                      directCompetitors: ["Other local agencies"],
                      indirectAlternatives: ["DIY marketing"],
                      statusQuo: ["Posting inconsistently"],
                      reasoning: "There is a viable serviceable market.",
                    },
                    businessModelValidation: {
                      model: "Monthly retainer",
                      entryPrice: 750,
                      anchorPrice: 2000,
                      margin: 68,
                      score: 3.9,
                      passGate4: true,
                      reasoning: "Retainers create healthy margins.",
                    },
                    operationalValidation: {
                      score: 3.7,
                      passGate5: true,
                      keyConstraints: ["Case studies", "Capacity planning"],
                      reasoning: "Operations are manageable with a small client count.",
                    },
                    nextActions: ["Define the niche offer", "Get 2 pilot clients", "Publish proof content"],
                    decision: "CONDITIONAL_GO",
                    weightedScore: 74,
                  }),
                },
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        )
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await validateIdeaDynamic({
      idea: "Social media management service for real estate agents in Miami",
      locale: "en",
    });

    expect(result.category).toBe("consulting");
    expect(result.country.code).toBe("US");
    expect(result.framework?.label).toBe("Consulting");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fails over from Anthropic to Perplexity to OpenAI when earlier providers fail", async () => {
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
    process.env.PERPLEXITY_API_KEY = "test-perplexity-key";

    const callOrder: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          messages?: Array<{ content?: string }>;
        };
        const prompt = body.messages?.at(-1)?.content ?? "";

        if (url.includes("anthropic.com")) {
          callOrder.push("claude");
          return new Response("provider down", { status: 500 });
        }

        if (url.includes("perplexity.ai")) {
          callOrder.push("perplexity");
          return new Response(
            JSON.stringify({
              choices: [
                {
                  message: {
                    content: "not-json",
                  },
                },
              ],
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json",
              },
            }
          );
        }

        callOrder.push("chatgpt");

        if (prompt.includes("Infer business category and target-country context")) {
          return openAIResponse({
            category: "local_service",
            frameworkHint: "local_service_v1",
            countryCode: "US",
            region: "north_america",
            categoryConfidence: 0.92,
            countryConfidence: 0.86,
            categoryEvidence: ["The idea is a local appointment-based service."],
            countryEvidence: ["Miami indicates a U.S. local market."],
          });
        }

        return openAIResponse({
          framework: {
            archetype: "local_service_business",
            label: "Local Service Business",
          },
          summary: {
            oneLiner: "The idea has credible local demand but still needs acquisition proof.",
            topOpportunities: ["Convenience-first service", "Fast launch potential"],
            biggestRisks: ["Customer acquisition is still unproven"],
          },
          assumptions: ["Busy professionals will pay for convenience."],
          missingInfo: ["Reliable CAC target is unknown."],
          criteria: [],
          problemDemand: {
            painLevel: 4,
            demandFrequency: 4,
            marketCoverage: 3.5,
            currentGap: 4,
            total: 15.5,
            passGate1: true,
            reasoning: "Demand looks credible for a local convenience service.",
          },
          primarySegment: {
            name: "Busy professionals in Miami",
            who: "Time-constrained professionals",
            jobToBeDone: "Keep their cars clean without extra hassle",
            currentPain: "Traditional car washes are inconvenient",
            willingnessToPay: "Moderate to high",
            reachChannels: ["Instagram", "Local partnerships"],
            scores: {
              reachability: 4,
              painLevel: 4,
              payingCapability: 3.5,
              total: 11.5,
            },
            reasoning: "Local reach channels are clear.",
          },
          solutionValidation: {
            painCoverage: 4,
            differentiation: 3.2,
            adoptionFriction: 2,
            score: 3.8,
            passGate3: true,
            reasoning: "The offer is easy to trial.",
          },
          marketValidation: {
            tam: 10000000,
            sam: 1500000,
            som: 180000,
            confidence: 0.68,
            passGate4: true,
            reasoning: "The local market is large enough for an MVP service business.",
          },
          businessModelValidation: {
            model: "Package-based service",
            entryPrice: 79,
            anchorPrice: 199,
            margin: 58,
            score: 3.6,
            passGate4: true,
            reasoning: "Unit economics can work with route density.",
          },
          operationalValidation: {
            score: 3.7,
            passGate5: true,
            keyConstraints: ["Scheduling", "Route density"],
            reasoning: "Operations are manageable with a narrow service area.",
          },
          nextActions: ["Interview 10 prospects", "Test local ad copy", "Pilot one neighborhood"],
          decision: "CONDITIONAL_GO",
          weightedScore: 72,
        });
      })
    );

    const result = await validateIdeaDynamic({
      idea: "Mobile car wash subscription service for busy professionals in Miami",
      category: "local_service",
      locale: "en",
    });

    expect(result.frameworkReport).toBeDefined();
    expect(result.summary.oneLiner).toMatch(/credible local demand/i);
    // weightedScore 72 → deriveDecision returns GO → toStatus returns GO
    expect(result.status).toBe("GO");
    expect(callOrder).toEqual([
      "claude",
      "perplexity",
      "chatgpt",
      "claude",
      "perplexity",
      "chatgpt",
    ]);
  });
});
