import { test, expect } from '@playwright/test';

test.describe('/start lead funnel', () => {
  test('multi-step form advances through all three steps', async ({ page }) => {
    await page.goto('/start');

    // Step 1: identity
    await expect(page.getByRole('heading', { name: /Start a project/i })).toBeVisible();
    await page.getByLabel(/Your name/i).fill('Test Lead');
    await page.getByLabel(/^Email$/i).fill('test@example.com');
    await page.getByLabel(/Company \(optional\)/i).fill('Acme Inc');
    await page.getByRole('button', { name: /^Next$/ }).click();

    // Step 2: spec
    await expect(page.getByText(/Step 2 of 3/i)).toBeVisible();
    await page.getByLabel(/What can we help with\?/i).selectOption('game-dev');
    await page.getByLabel(/Budget range/i).selectOption('5k-15k');
    await page.getByRole('button', { name: /^Next$/ }).click();

    // Step 3: scope
    await expect(page.getByText(/Step 3 of 3/i)).toBeVisible();
    await page.getByLabel(/Tell us about your project/i).fill('A short description of the project.');

    // The submit button is enabled now; we don't actually submit to avoid
    // hitting production Sanity + Resend in CI.
    await expect(page.getByRole('button', { name: /^Send brief$/ })).toBeEnabled();
  });

  test('back button returns to previous step', async ({ page }) => {
    await page.goto('/start');

    await page.getByLabel(/Your name/i).fill('Test');
    await page.getByLabel(/^Email$/i).fill('test@example.com');
    await page.getByRole('button', { name: /^Next$/ }).click();

    await expect(page.getByText(/Step 2 of 3/i)).toBeVisible();
    await page.getByRole('button', { name: /^← Back$/ }).click();
    await expect(page.getByText(/Step 1 of 3/i)).toBeVisible();
  });
});

test.describe('retired route redirects', () => {
  test('/discovery permanently redirects to /start', async ({ page }) => {
    const response = await page.goto('/discovery');
    expect(page.url()).toMatch(/\/start$/);
    expect(response?.status()).toBe(200);
  });

  test('/brief permanently redirects to /start', async ({ page }) => {
    const response = await page.goto('/brief');
    expect(page.url()).toMatch(/\/start$/);
    expect(response?.status()).toBe(200);
  });
});
