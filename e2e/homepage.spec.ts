import { test, expect } from '@playwright/test';

test.describe('homepage', () => {
  test('loads and shows the hero copy', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', {
        name: /Game development.*QA, engineered end-to-end/i,
        level: 1,
      })
    ).toBeVisible();
  });

  test('hero CTAs link to the right routes', async ({ page }) => {
    await page.goto('/');

    // "Start a project" appears in both hero and pricing band; pick the first (hero).
    const primary = page.getByRole('link', { name: /^Start a project$/ }).first();
    await expect(primary).toBeVisible();
    await expect(primary).toHaveAttribute('href', '/start');

    const secondary = page.getByRole('link', { name: /^View our work$/ });
    await expect(secondary).toHaveAttribute('href', '/#work');

    const experienceLink = page.getByRole('link', { name: /Enter the experience/i });
    await expect(experienceLink).toHaveAttribute('href', '/experience');
  });

  test('pricing section is visible', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: /Engagements start at \$5,000/i })
    ).toBeVisible();
  });

  test('navbar nav links resolve', async ({ page }) => {
    await page.goto('/');

    const navLinks: { name: RegExp; href: string }[] = [
      { name: /^Services$/, href: '/#services' },
      { name: /^Work$/, href: '/#work' },
      { name: /^Agents$/, href: '/agents' },
      { name: /^Contact$/, href: '/#contact' },
    ];

    for (const { name, href } of navLinks) {
      const link = page.getByRole('link', { name }).first();
      await expect(link).toHaveAttribute('href', href);
    }
  });
});
