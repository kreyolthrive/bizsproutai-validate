import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MicroAppForm from "../components/micro-apps/MicroAppForm";
import { createMockTranslator } from "./helpers/mockTranslator";

vi.mock("next-intl", () => ({
  useTranslations: () =>
    createMockTranslator({
      "microApps.types.waitlist.title": "Waitlist",
      "microApps.types.waitlist.description": "Waitlist description",
      "microApps.types.waitlist.buttonLabel": "Join the waitlist",
      "microApps.types.waitlist.thankYouMessage": "We will reach out soon",
      "microApps.types.waitlist.nextStepNote": "Watch your inbox",
      "microApps.form.thankYouTitle": "Thanks {name}",
    }),
}));

describe("MicroAppForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows a validation error when a waitlist email is missing", async () => {
    const user = userEvent.setup();
    render(<MicroAppForm locale="en" microAppType="waitlist" />);

    await user.type(screen.getByLabelText(/microApps.form.fields.name/), "Jordan Lee");
    fireEvent.submit(screen.getByRole("button", { name: "Join the waitlist" }).closest("form")!);

    expect(screen.getByText("microApps.form.errors.emailRequired")).toBeInTheDocument();
  });

  it("submits successfully and shows the thank-you state", async () => {
    const user = userEvent.setup();
    render(<MicroAppForm locale="en" microAppType="waitlist" />);

    await user.type(screen.getByLabelText(/microApps.form.fields.name/), "Jordan Lee");
    await user.type(screen.getByLabelText(/microApps.form.fields.email/), "jordan@example.com");
    await user.type(screen.getByLabelText(/microApps.form.fields.profile/), "Founder");
    await user.click(screen.getByRole("button", { name: "Join the waitlist" }));

    expect(screen.getByText("Thanks Jordan Lee")).toBeInTheDocument();
    expect(screen.getByText("We will reach out soon")).toBeInTheDocument();
    expect(localStorage.getItem("bizspr.microapps.submissions.v1")).toContain("jordan@example.com");
  });
});
