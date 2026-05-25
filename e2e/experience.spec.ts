import { test, expect } from '@playwright/test';

test.describe('/experience', () => {
  test('renders the cinematic landing (or reduced-motion fallback)', async ({ page }) => {
    await page.goto('/experience');
    // Either the cinematic or the reduced-motion fallback should render.
    // We just check the page mounts without error and has some content.
    await page.waitForLoadState('networkidle');
    const hasContent = await page.locator('body').first().isVisible();
    expect(hasContent).toBe(true);
  });

  test('reduced-motion users get the static fallback', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/experience');

    await expect(
      page.getByRole('heading', { name: /^The experience\.$/i })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to home/i })).toBeVisible();
    await context.close();
  });
});
