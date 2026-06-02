import { test, expect } from "@playwright/test";

test.describe("contact", () => {
  // Stub the submit endpoint so the test never writes a real row.
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/submit", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      })
    );
  });

  test("submitting the form shows the sent state", async ({ page }) => {
    await page.goto("/contact");

    const form = page.locator("form.form");
    await form.getByPlaceholder("Your name").fill("Ada Lovelace");
    await form.getByPlaceholder("you@email.com").fill("ada@example.com");
    await form.locator("select").first().selectOption("Unreal Engine build");
    await form
      .getByPlaceholder(/What are you trying to build/)
      .fill("A real-time configurator.");

    await form.getByRole("button", { name: /Send inquiry/i }).click();

    await expect(page.getByRole("heading", { name: /Message sent/i })).toBeVisible();
  });
});

test.describe("redirects", () => {
  test("old funnel URLs redirect to /contact", async ({ page }) => {
    await page.goto("/start");
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("old agents URL redirects to /join", async ({ page }) => {
    await page.goto("/agents");
    await expect(page).toHaveURL(/\/join$/);
  });
});
