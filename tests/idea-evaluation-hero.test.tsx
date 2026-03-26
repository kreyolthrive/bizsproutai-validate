import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdeaEvaluationHero } from "../components/IdeaEvaluationHero";
import { createMockTranslator } from "./helpers/mockTranslator";

vi.mock("next-intl", () => ({
  useTranslations: () =>
    createMockTranslator(
      {
        "form.ideaLabel": "Describe your business idea",
        "form.emailLabel": "Email to receive your validation report",
        "form.submit": "Validate My Idea",
        "form.moreDetails": "Add more details (optional)",
        "intro.eyebrow": "AI business validation",
        "intro.kicker": "Category-aware scoring and next-step guidance",
        "intro.title": "Validate your business idea with AI before you build",
        "intro.body": "Refined copy",
        "result.awaiting": "Awaiting input",
        "result.summaryDefault": "Share your idea to get a category-aware validation score, key risks, and the clearest next step.",
        "result.nextStepEmpty": "Your next best step will appear here after validation.",
        "status.emailSent": "Your validation report is on its way to your inbox.",
        "status.emailOptional": "Report is ready on this page. Add email next time if you want inbox delivery.",
        "status.leadSaved": "Your details have been saved successfully.",
        "status.runSaved": "Your validation is ready.",
        "status.waitlist": "Thank you — you’re on the waitlist. We’ll notify you when this business is ready to launch.",
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
    await user.click(screen.getByRole("button", { name: "Validate My Idea" }));

    expect(screen.getByText("errors.minIdea")).toBeInTheDocument();
  });

  it("requires an email and shows error when submitted without one", async () => {
    const user = userEvent.setup();

    render(<IdeaEvaluationHero locale="en" />);

    await user.type(
      screen.getByLabelText("Describe your business idea"),
      "A strong business concept with enough detail"
    );
    await user.click(screen.getByRole("button", { name: "Validate My Idea" }));

    // Component now requires email before submitting — shows the emailRequired error key
    expect(screen.getByText("errors.emailRequired")).toBeInTheDocument();
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

    await user.type(screen.getByLabelText("Email to receive your validation report"), "founder@example.com");
    await user.click(screen.getByRole("button", { name: "Validate My Idea" }));

    await waitFor(() => {
      expect(screen.getByText("Interview 10 buyers")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/validate",
      expect.objectContaining({
        method: "POST",
      })
    );
    expect(screen.getByText("Your validation report is on its way to your inbox.")).toBeInTheDocument();
    expect(screen.getByText("Your details have been saved successfully.")).toBeInTheDocument();
    expect(screen.getByText("Local Service")).toBeInTheDocument();
    expect(screen.getByText("74")).toBeInTheDocument();
  });

  it("renders API errors returned from validation", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Validation failed." }), {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      })
    );

    vi.stubGlobal(
      "fetch",
      fetchMock
    );

    render(<IdeaEvaluationHero locale="en" />);

    await user.type(
      screen.getByLabelText("Describe your business idea"),
      "A strong business concept with enough detail"
    );
    await user.type(screen.getByLabelText("Email to receive your validation report"), "founder@example.com");
    await user.click(screen.getByRole("button", { name: "Validate My Idea" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(screen.getByRole("alert")).toHaveTextContent("Validation failed.");
    });
  });

  it("clears stale validation results when the form is edited again", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
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
    );

    vi.stubGlobal(
      "fetch",
      fetchMock
    );

    render(<IdeaEvaluationHero locale="en" />);

    await user.type(
      screen.getByLabelText("Describe your business idea"),
      "A strong business concept with enough detail"
    );
    await user.type(screen.getByLabelText("Email to receive your validation report"), "founder@example.com");
    await user.click(screen.getByRole("button", { name: "Validate My Idea" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(screen.getByText("Interview five buyers")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Describe your business idea"), " updated");

    await waitFor(() => {
      expect(screen.queryByText("Interview five buyers")).not.toBeInTheDocument();
    });
    expect(screen.queryByText("Your validation report is on its way to your inbox.")).not.toBeInTheDocument();
    expect(screen.getByText("Your next best step will appear here after validation.")).toBeInTheDocument();
  });

  it("does not show waitlist success when only the validation run is saved", async () => {
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
            leadCapture: {
              saved: false,
              eventId: null,
              error: "Failed to save lead to SQL database.",
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
      )
    );

    render(<IdeaEvaluationHero locale="en" />);

    await user.type(
      screen.getByLabelText("Describe your business idea"),
      "A strong business concept with enough detail"
    );
    await user.type(screen.getByLabelText("Email to receive your validation report"), "founder@example.com");
    await user.click(screen.getByRole("button", { name: "Validate My Idea" }));

    await waitFor(() => {
      expect(screen.getByText("Interview five buyers")).toBeInTheDocument();
    });

    expect(screen.getByText("Your validation is ready.")).toBeInTheDocument();
    expect(
      screen.queryByText("Thank you — you’re on the waitlist. We’ll notify you when this business is ready to launch.")
    ).not.toBeInTheDocument();
  });
});
