import { test, expect } from "@playwright/test";

test.describe("work", () => {
  test("lists projects and filters them", async ({ page }) => {
    await page.goto("/work");

    const grid = page.locator("#workGrid");
    await expect(grid.getByRole("heading", { name: "Shadow of Beginnings" })).toBeVisible();
    await expect(grid.getByRole("heading", { name: "SynX" })).toBeVisible();

    // Filtering to "Agency" hides studio-only Shadow of Beginnings, keeps SynX.
    await page.getByRole("button", { name: "Agency" }).click();
    await expect(grid.getByRole("heading", { name: "Shadow of Beginnings" })).toBeHidden();
    await expect(grid.getByRole("heading", { name: "SynX" })).toBeVisible();
  });

  test("clicking a project opens the detail modal", async ({ page }) => {
    await page.goto("/work");
    await page.locator('.js-proj[data-proj="vengeance"]').click();
    const modal = page.locator(".pm-overlay");
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole("heading", { name: "Vengeance: Beyond the Night" })
    ).toBeVisible();
    await expect(modal.getByRole("link", { name: /Read case study/i })).toHaveAttribute(
      "href",
      "/work/vengeance"
    );
  });

  test("case study page renders", async ({ page }) => {
    await page.goto("/work/vengeance");
    await expect(
      page.getByRole("heading", { name: "Vengeance: Beyond the Night", level: 1 })
    ).toBeVisible();
  });
});
