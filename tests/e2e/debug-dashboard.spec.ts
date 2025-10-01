import { test, expect } from '@playwright/test';

test.describe('Debug Dashboard', () => {
  test('debug dashboard content', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    // Navigate to sign in and authenticate
    await page.goto('/auth/signin');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    
    // Wait a bit for the page to fully load
    await page.waitForTimeout(3000);
    
    // Get all headings on the page
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log('Found headings:', headings.length);
    
    for (let i = 0; i < headings.length; i++) {
      const text = await headings[i].textContent();
      console.log(`Heading ${i + 1}: "${text}"`);
    }
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Get all text content
    const bodyText = await page.textContent('body');
    console.log('Body text contains "Dashboard":', bodyText?.includes('Dashboard'));
    console.log('Body text contains "Development":', bodyText?.includes('Development'));
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-dashboard.png', fullPage: true });
  });
});
