import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function AppShell() {
  return <h1>BizSproutAI</h1>;
}

describe("AppShell", () => {
  it("renders the app heading", () => {
    render(<AppShell />);

    expect(screen.getByRole("heading", { name: "BizSproutAI" })).toBeInTheDocument();
  });
});
