import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MicroAppsAdmin from "../components/micro-apps/MicroAppsAdmin";
import { appendSubmission } from "../src/microapps/storage";
import { createMockTranslator } from "./helpers/mockTranslator";

vi.mock("next-intl", () => ({
  useTranslations: () =>
    createMockTranslator({
      "microApps.types.consultation_booking.title": "Consultation",
      "microApps.types.service_request.title": "Service request",
      "microApps.types.waitlist.title": "Waitlist",
    }),
}));

describe("MicroAppsAdmin", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows empty states by default", () => {
    render(<MicroAppsAdmin />);

    expect(screen.getByText(/microApps.admin.noSubmissions/)).toBeInTheDocument();
    expect(screen.getByText(/microApps.admin.noContacts/)).toBeInTheDocument();
  });

  it("switches tabs and shows stored submissions and contacts", async () => {
    const user = userEvent.setup();

    appendSubmission({
      microAppType: "service_request",
      microAppTitle: "Request a service",
      name: "Casey Hart",
      phone: "555-0110",
      requestDescription: "Need an installation quote",
      serviceType: "Installation",
    });

    render(<MicroAppsAdmin />);

    await user.click(screen.getByRole("button", { name: "microApps.admin.tabs.requests" }));

    expect(screen.getAllByText("Casey Hart")).toHaveLength(2);
    expect(screen.getAllByText(/Need an installation quote/)).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "microApps.admin.tabs.contacts" }));

    expect(screen.getByText(/micro_app_service_request/)).toBeInTheDocument();
    expect(screen.getByText(/Installation/)).toBeInTheDocument();
  });
});
