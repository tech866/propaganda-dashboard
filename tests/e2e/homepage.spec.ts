import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle('Propaganda Dashboard');
    
    // Check for main heading
    await expect(page.getByRole('heading', { name: /propaganda dashboard/i })).toBeVisible();
    
    // Check for navigation elements (use first() to handle multiple sign-in links)
    await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/');
    
    // Click sign in link (use first() to handle multiple sign-in links)
    await page.getByRole('link', { name: /sign in/i }).first().click();
    
    // Should be on sign in page
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();
  });

  test('should show development mode sign in form', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Check for development mode indicators (use first() to handle multiple elements)
    await expect(page.getByText('Development Mode').first()).toBeVisible();
    await expect(page.getByText('This is a mock sign-in form for development')).toBeVisible();
    
    // Check for form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should allow mock authentication', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill in mock credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
