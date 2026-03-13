import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdeaEvaluationHero } from "../components/IdeaEvaluationHero";
import { createMockTranslator } from "./helpers/mockTranslator";

vi.mock("next-intl", () => ({
  useTranslations: () =>
    createMockTranslator(
      {
        "form.ideaLabel": "Describe your business idea",
        "form.emailLabel": "Email for the report (optional)",
        "result.awaiting": "Awaiting input",
      },
      {
        sampleIdeas: [
          "Sample business idea one",
          "Sample business idea two",
        ],
      }
    ),
}));

describe("IdeaEvaluationHero", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a minimum-idea validation error before submitting", async () => {
    const user = userEvent.setup();
    render(<IdeaEvaluationHero locale="en" />);

    await user.type(screen.getByLabelText("Describe your business idea"), "Too short");
    fireEvent.submit(screen.getByRole("button", { name: "form.submit" }).closest("form")!);

    expect(screen.getByText("errors.minIdea")).toBeInTheDocument();
  });

  it("fills the form from sample ideas and renders a successful validation result", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "GO",
          businessCategory: "local_service",
          frameworkUsed: "local_service_v1",
          overall_score: 74,
          confidenceScore: 82,
          summary: {
            oneLiner: "Strong go-to-market signal",
            topOpportunities: ["High convenience value"],
            biggestRisks: ["Differentiation still needs proof"],
          },
          strengths: ["Clear value proposition", "Fast launch path"],
          weaknesses: ["Acquisition path is not fully proven"],
          keyRisks: ["Competition is crowded"],
          assumptionsToTest: ["Busy professionals will pay more for convenience"],
          recommendedNextSteps: ["Interview 10 buyers", "Test three packages"],
          scores: {
            market_demand: 78,
            monetization: 80,
            competition: 58,
            acquisition: 62,
            execution_feasibility: 85,
            differentiation: 55,
            risk: 48,
          },
          researchSummary: {
            demandSignals: ["Market signal: local demand exists."],
            competitionNotes: [],
            marketTrends: [],
            monetizationNotes: [],
            acquisitionChallenges: [],
            differentiationOpportunities: [],
            riskFactors: [],
            sources: [],
          },
          nextActionCtas: [{ key: "build", label: "Build landing page", href: "/en/website-builder" }],
          emailDelivery: {
            attempted: true,
            enabled: true,
            sentToUser: true,
            sentToOwner: false,
            errors: [],
          },
          leadCapture: {
            saved: true,
            eventId: "lead-1",
            error: null,
          },
          validationRun: {
            saved: true,
            runId: "run-1",
            error: null,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    render(<IdeaEvaluationHero locale="en" />);

    await user.click(screen.getByRole("button", { name: "Sample business idea one" }));
    expect(screen.getByLabelText("Describe your business idea")).toHaveValue("Sample business idea one");

    await user.type(screen.getByLabelText("Email for the report (optional)"), "founder@example.com");
    await user.click(screen.getByRole("button", { name: "form.submit" }));

    await waitFor(() => {
      expect(screen.getByText("Strong go-to-market signal")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/validate",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(screen.getByText("status.emailSent")).toBeInTheDocument();
    expect(screen.getByText("status.leadSaved")).toBeInTheDocument();
    expect(screen.getByText("status.runSaved")).toBeInTheDocument();
    expect(screen.getByText(/result.category: Local Service/i)).toBeInTheDocument();
    expect(screen.getByText("74/100")).toBeInTheDocument();
    expect(screen.getByText("82/100")).toBeInTheDocument();
    expect(screen.getByText("Build landing page")).toBeInTheDocument();
  });

  it("renders API errors returned from validation", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Validation failed." }), {
          status: 500,
          headers: {
            "content-type": "application/json",
          },
        })
      )
    );

    render(<IdeaEvaluationHero locale="en" />);

    await user.type(
      screen.getByLabelText("Describe your business idea"),
      "A strong business concept with enough detail"
    );
    await user.click(screen.getByRole("button", { name: "form.submit" }));

    await waitFor(() => {
      expect(screen.getByText("Validation failed.")).toBeInTheDocument();
    });
  });

  it("clears stale validation results when the form is edited again", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: "GO",
            overall_score: 71,
            confidenceScore: 76,
            businessCategory: "saas",
            frameworkUsed: "saas_v1",
            summary: {
              oneLiner: "Strong go-to-market signal",
              topOpportunities: ["Clear SaaS pain"],
              biggestRisks: ["Needs buyer proof"],
            },
            strengths: ["Clear SaaS pain"],
            weaknesses: ["Needs buyer proof"],
            keyRisks: ["Needs buyer proof"],
            assumptionsToTest: ["Buyers will pay for this workflow"],
            recommendedNextSteps: ["Interview five buyers"],
            scores: {
              market_demand: 70,
              monetization: 72,
              competition: 60,
              acquisition: 58,
              execution_feasibility: 80,
              differentiation: 54,
              risk: 52,
            },
            researchSummary: {
              demandSignals: [],
              competitionNotes: [],
              marketTrends: [],
              monetizationNotes: [],
              acquisitionChallenges: [],
              differentiationOpportunities: [],
              riskFactors: [],
              sources: [],
            },
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

    render(<IdeaEvaluationHero locale="en" />);

    await user.type(
      screen.getByLabelText("Describe your business idea"),
      "A strong business concept with enough detail"
    );
    await user.click(screen.getByRole("button", { name: "form.submit" }));

    await waitFor(() => {
      expect(screen.getByText("Strong go-to-market signal")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Describe your business idea"), " updated");

    await waitFor(() => {
      expect(screen.queryByText("Strong go-to-market signal")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("status.emailSent")).not.toBeInTheDocument();
    expect(screen.getByText("result.summaryDefault")).toBeInTheDocument();
  });
});
