import { test, expect } from '@playwright/test';

test.describe('protected routes', () => {
  test('/dashboard redirects to /unauthorized when not signed in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/unauthorized$/);
    await expect(page.getByRole('heading', { name: /Sign in required/i })).toBeVisible();
  });

  test('/workstation redirects to /unauthorized when not signed in', async ({ page }) => {
    await page.goto('/workstation');
    await expect(page).toHaveURL(/\/unauthorized$/);
    await expect(page.getByRole('heading', { name: /Sign in required/i })).toBeVisible();
  });

  test('/unauthorized renders sign-in options', async ({ page }) => {
    await page.goto('/unauthorized');
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible();
  });
});
