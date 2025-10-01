import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to sign in and authenticate
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for redirect to dashboard with longer timeout
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should load dashboard successfully', async ({ page }) => {
    // Check dashboard title (look for "Dashboard" in the heading)
    await expect(page.getByRole('heading', { name: /.*dashboard/i })).toBeVisible();
    
    // Check for main dashboard elements
    await expect(page.getByText(/comprehensive overview/i)).toBeVisible();
    
    // Check for navigation sidebar
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Test navigation to different pages
    const navItems = [
      { name: /clients/i, url: /.*\/clients/ },
      { name: /campaigns/i, url: /.*\/campaigns/ },
      { name: /calls/i, url: /.*\/calls/ },
      { name: /performance/i, url: /.*\/performance/ },
      { name: /financial/i, url: /.*\/financial/ },
      { name: /settings/i, url: /.*\/settings/ },
    ];

    for (const item of navItems) {
      // Click navigation item
      await page.getByRole('link', { name: item.name }).click();
      
      // Should navigate to correct page
      await expect(page).toHaveURL(item.url);
      
      // Go back to dashboard for next test
      await page.goto('/dashboard');
    }
  });

  test('should display user information', async ({ page }) => {
    // Check for user avatar or name in header
    await expect(page.locator('[data-testid="user-avatar"], [data-testid="user-name"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile navigation works
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    
    // Click mobile menu
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Check that navigation is visible
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});
