import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RoadmapDisplay from "../components/RoadmapDisplay";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

describe("RoadmapDisplay", () => {
  it("renders phase descriptions as text instead of injecting HTML", () => {
    const { container } = render(
      <RoadmapDisplay
        roadmap={{
          phase_1_legal: {
            step_name: "Set up entity",
            description: "<img src=x onerror=alert(1)>Line two",
          },
          phase_2_infrastructure: {
            step_name: "Build ops",
            description: "Infrastructure setup",
          },
          phase_3_launch: {
            step_name: "Launch",
            description: "Launch checklist",
          },
          warnings: [],
        }}
      />
    );

    expect(screen.getByText("<img src=x onerror=alert(1)>Line two")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });
});
