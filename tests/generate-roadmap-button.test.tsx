import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GenerateRoadmapButton from "../components/GenerateRoadmapButton";
import { DEFAULT_SPRINT_SETTINGS } from "../src/sprint/config";

describe("GenerateRoadmapButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("stays disabled until required inputs are present", () => {
    render(
      <GenerateRoadmapButton
        idea=""
        country="USA"
        businessType="saas"
        sprintSettings={DEFAULT_SPRINT_SETTINGS}
      />
    );

    expect(screen.getByRole("button", { name: /Generate Build Plan/ })).toBeDisabled();
  });

  it("generates a roadmap successfully", async () => {
    const user = userEvent.setup();
    const onRoadmapGenerated = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: true,
            roadmap: { title: "Launch roadmap" },
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

    render(
      <GenerateRoadmapButton
        idea="Launch a local cleaning service"
        country="USA"
        businessType="local_service"
        sprintSettings={DEFAULT_SPRINT_SETTINGS}
        onRoadmapGenerated={onRoadmapGenerated}
      />
    );

    await user.click(screen.getByRole("button", { name: /Generate Build Plan/ }));

    await waitFor(() => {
      expect(onRoadmapGenerated).toHaveBeenCalledWith({ title: "Launch roadmap" });
    });
  });

  it("shows roadmap generation errors", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Failed to generate roadmap" }), {
          status: 500,
          headers: {
            "content-type": "application/json",
          },
        })
      )
    );

    render(
      <GenerateRoadmapButton
        idea="Launch a local cleaning service"
        country="USA"
        businessType="local_service"
        sprintSettings={DEFAULT_SPRINT_SETTINGS}
      />
    );

    await user.click(screen.getByRole("button", { name: /Generate Build Plan/ }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to generate roadmap/)).toBeInTheDocument();
    });
  });
});
