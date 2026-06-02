import { test, expect } from "@playwright/test";

test.describe("homepage", () => {
  test("loads and shows the hero copy", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /We build .*worlds.*the people behind them/i, level: 1 })
    ).toBeVisible();
  });

  test("hero CTAs link to the right routes", async ({ page }) => {
    await page.goto("/");

    const seeWork = page.getByRole("link", { name: /See our work/ });
    await expect(seeWork).toHaveAttribute("href", "/work");

    const join = page.getByRole("link", { name: /^Join the network$/ }).first();
    await expect(join).toHaveAttribute("href", "/join");

    // "Start a project" lives in the header.
    const start = page.getByRole("link", { name: /^Start a project$/ }).first();
    await expect(start).toHaveAttribute("href", "/contact");
  });

  test("primary nav links resolve", async ({ page }) => {
    await page.goto("/");
    const navLinks: { name: RegExp; href: string }[] = [
      { name: /^Agency$/, href: "/agency" },
      { name: /^Studio$/, href: "/studio" },
      { name: /^Work$/, href: "/work" },
      { name: /^Join$/, href: "/join" },
      { name: /^Contact$/, href: "/contact" },
    ];
    for (const { name, href } of navLinks) {
      const link = page.getByRole("link", { name }).first();
      await expect(link).toHaveAttribute("href", href);
    }
  });
});
