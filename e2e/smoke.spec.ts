import { expect, test } from "@playwright/test";

test("landing page validates an idea and shows the result", async ({ page }) => {
  await page.route("**/api/validate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "GO",
        summary: {
          oneLiner: "Strong go-to-market signal",
        },
        nextActions: ["Interview five buyers", "Price the first offer"],
        frameworkReport: {
          decision: "GO",
          problemDemand: { total: 16 },
          solutionValidation: { differentiation: 4 },
          businessModelValidation: { margin: 62 },
        },
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
      }),
    });
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Validate your business idea with AI before you build" })
  ).toBeVisible();

  await page
    .getByLabel("Describe your business idea")
    .fill("Mobile car wash subscription service for busy professionals in Miami");
  await page.getByLabel("Email to receive your validation report").fill("founder@example.com");
  const submitButton = page.getByRole("button", { name: "Validate My Idea" });
  await expect(submitButton).toBeEnabled();
  const validationRequest = page.waitForRequest("**/api/validate");
  await submitButton.click();
  await validationRequest;

  await expect(page.getByText("Strong go-to-market signal")).toBeVisible();
  await expect(page.getByText("Your validation report is on its way to your inbox.")).toBeVisible();
  await expect(page.getByText("Your details have been saved successfully.")).toBeVisible();
});
