import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import StartSprintModal from "../components/sprint/StartSprintModal";

describe("StartSprintModal", () => {
  it("closes when the close action is used", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <StartSprintModal
        open
        defaultIntensity="standard"
        onClose={onClose}
        onStart={vi.fn()}
        onSetLater={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("walks through onboarding and starts with the selected intensity", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();

    render(
      <StartSprintModal
        open
        defaultIntensity="standard"
        onClose={vi.fn()}
        onStart={onStart}
        onSetLater={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("radio", { name: /Intensive - 10\+ hours per week/i }));
    await user.click(screen.getByRole("button", { name: "Start my 90-Day Sprint" }));

    expect(onStart).toHaveBeenCalledWith("intensive");
  });
});
