import { expect, test } from "@playwright/test";
import { locales } from "../i18n/config";
import { getLandingCopy } from "../i18n/landingCopy";

for (const locale of locales) {
  for (const width of [320, 768, 1440]) {
    test(`landing ${locale} at ${width}px: content, destinations and overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`/${locale}`);
      const copy = getLandingCopy(locale);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        `${copy.title} ${copy.accent}`,
      );
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.locator(".vl-step-grid > li")).toHaveCount(4);
      await expect(page.locator(".vl-feedback figcaption")).toHaveText([
        `— ${copy.founderLabel}`,
        `— ${copy.founderLabel}`,
      ]);
      await expect(page.locator(".vl-hero .vl-button")).toHaveAttribute(
        "href",
        `/${locale}/validate`,
      );
      await expect(page.locator("#booking a")).toHaveAttribute(
        "href",
        "https://cal.com/bizsproutai/30-min-founder-clarity-session",
      );
      await expect(
        page.getByRole("link", { name: "LinkedIn", exact: true }),
      ).toHaveAttribute("href", "https://www.linkedin.com/in/wagner-desir/");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://validate.bizsproutai.com/${locale}`,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const brokenAnchors = await page
        .locator('a[href*="#"]')
        .evaluateAll((links) =>
          links
            .map((link) => new URL((link as HTMLAnchorElement).href))
            .filter(
              (url) =>
                url.pathname === location.pathname &&
                url.hash &&
                !document.getElementById(url.hash.slice(1)),
            )
            .map((url) => url.href),
        );
      expect(brokenAnchors).toEqual([]);
      expect(errors).toEqual([]);
      await page.screenshot({
        path: test.info().outputPath("landing.png"),
        fullPage: true,
      });
    });
  }
}

test("mobile navigation, FAQ and language switching are usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const open = page.getByRole("button", { name: "Open navigation menu" });
  await open.click();
  await expect(
    page.getByRole("button", { name: "Close navigation menu" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await open.click();
  await page.locator('nav[id] a[href="/en#how"]').click();
  await expect(page.locator("#how")).toBeInViewport();
  await expect(open).toHaveAttribute("aria-expanded", "false");
  const faq = page.locator("details").first();
  await faq.locator("summary").click();
  await expect(faq).toHaveAttribute("open", "");
  await expect(faq.locator("p")).toBeVisible();
  await page
    .getByRole("button", { name: "Français", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.locator("h1")).toContainText(getLandingCopy("fr").title);
});

test("primary CTA reaches the existing validation flow", async ({ page }) => {
  await page.goto("/en");
  await page.locator(".vl-hero .vl-button").click();
  await expect(page).toHaveURL(/\/en\/validate$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.locator('section[aria-label="Business validation form"]'),
  ).toBeVisible();
});
