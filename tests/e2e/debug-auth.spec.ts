import { test, expect } from '@playwright/test';

test.describe('Debug Authentication', () => {
  test('debug sign-in form submission', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('/auth/signin');
    
    // Wait for the form to load (use first() to handle multiple elements)
    await expect(page.getByText('Development Mode').first()).toBeVisible();
    
    // Fill in the form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    
    // Click the sign in button
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait a bit and check what happens
    await page.waitForTimeout(2000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL after form submission:', currentUrl);
    
    // Check if there are any error messages
    const errorMessages = await page.locator('[role="alert"]').allTextContents();
    console.log('Error messages:', errorMessages);
    
    // Check if the form is still visible (indicating it didn't submit)
    const formVisible = await page.getByText('Development Mode').isVisible();
    console.log('Form still visible:', formVisible);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-auth.png' });
  });
});
