import { describe, expect, it } from "vitest";
import {
  finalVerdictFromOverallScore,
  frameworkDecisionFromOverallScore,
  resolveFrameworkDecision,
  resolveOverallScore100,
  statusFromFrameworkDecision,
  verdictFromOverallScore,
} from "../src/validation/decision";
import type { DynamicValidationResult } from "../src/validation/types";

function buildResult(overallScore: number): DynamicValidationResult {
  return {
    status: "FIX",
    category: "saas",
    country: {
      code: "US",
      region: "north_america",
      confidence: 0.8,
      evidence: [],
    },
    language: "en",
    overallScore: 3,
    verdict: "caution",
    summary: {
      oneLiner: "Test result",
      topOpportunities: [],
      biggestRisks: [],
    },
    failureRisks: [],
    fixes: [],
    alternatives: [],
    nextActions: [],
    criteria: [],
    assumptions: [],
    missingInfo: [],
    buildTriggered: true,
    buildJobs: [{ type: "website", status: "queued" }],
    overall_score: overallScore,
    frameworkReport: {
      oneLineSummary: "Test",
      missingInfo: [],
      assumptions: [],
      problemDemand: {
        painLevel: 0,
        demandFrequency: 0,
        marketCoverage: 0,
        currentGap: 0,
        total: 0,
        passGate1: false,
        keyInsight: "",
      },
      primarySegment: {
        name: "Test",
        who: "Test",
        jobToBeDone: "Test",
        currentPain: "Test",
        willingnessToPay: "Test",
        reachChannels: [],
        scores: {
          reachability: 0,
          painLevel: 0,
          payingCapability: 0,
          total: 0,
        },
      },
      solutionValidation: {
        painCoverage: 0,
        differentiation: 0,
        adoptionFriction: 0,
        score: 0,
        passGate3: false,
      },
      marketValidation: {
        tam: 0,
        sam: 0,
        som: 0,
        confidence: 0,
        passGate4: false,
      },
      businessModelValidation: {
        model: "Test",
        entryPrice: 0,
        anchorPrice: 0,
        margin: 0,
        passGate4: false,
      },
      operationalValidation: {
        score: 0,
        passGate5: false,
        keyConstraints: [],
      },
      weightedScore: 82,
      decision: "CONDITIONAL_GO",
      gates: [],
    },
    meta: {
      version: "test",
      iterationCount: 1,
      generatedAt: new Date().toISOString(),
    },
  };
}

describe("validation decision mapping", () => {
  it("maps stabilized scores consistently across decision, verdict, and status", () => {
    expect(frameworkDecisionFromOverallScore(84)).toBe("GO");
    expect(frameworkDecisionFromOverallScore(68)).toBe("CONDITIONAL_GO");
    expect(frameworkDecisionFromOverallScore(54)).toBe("NEED_WORK");
    expect(frameworkDecisionFromOverallScore(31)).toBe("PIVOT_RECOMMENDED");

    expect(verdictFromOverallScore(84)).toBe("go");
    expect(verdictFromOverallScore(54)).toBe("caution");
    expect(verdictFromOverallScore(31)).toBe("pivot");

    expect(finalVerdictFromOverallScore(84)).toBe("strong_validation");
    expect(finalVerdictFromOverallScore(68)).toBe("promising_but_needs_proof");
    expect(finalVerdictFromOverallScore(54)).toBe("risky_requires_refinement");
    expect(finalVerdictFromOverallScore(31)).toBe("pivot_or_reposition_recommended");

    expect(statusFromFrameworkDecision("GO")).toBe("GO");
    expect(statusFromFrameworkDecision("CONDITIONAL_GO")).toBe("FIX");
    expect(statusFromFrameworkDecision("NEED_WORK")).toBe("FIX");
    expect(statusFromFrameworkDecision("PIVOT_RECOMMENDED")).toBe("REFINE");
  });

  it("prefers the stabilized 0-100 score over a stale framework decision", () => {
    const result = buildResult(31);

    expect(resolveOverallScore100(result)).toBe(31);
    expect(resolveFrameworkDecision(result)).toBe("PIVOT_RECOMMENDED");
  });
});
