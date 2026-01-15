import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('should allow user to sign up with valid credentials', async ({ page }) => {
    // Navigate to signup page
    await page.goto('http://localhost:5173/signup');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Create your account');

    // Fill in the form
    const timestamp = Date.now();
    await page.getByRole('textbox', { name: 'Username' }).fill(`testuser${timestamp}`);
    await page.getByRole('textbox', { name: 'Email address' }).fill(`testuser${timestamp}@example.com`);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm password' }).fill('password123');

    // Verify button becomes enabled
    const signupButton = page.getByRole('button', { name: 'Sign up' });
    await expect(signupButton).toBeEnabled();

    // Click signup button
    await signupButton.click();

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login\?verified=pending/);
    await expect(page.locator('h1')).toContainText('Log in to Tweeter');
    await expect(page.getByText('Please check your email')).toBeVisible();
  });

  test('should keep button disabled when passwords do not match', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');

    // Fill in form with mismatched passwords
    await page.getByRole('textbox', { name: 'Username' }).fill('testuser');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
    await page.getByRole('textbox', { name: 'Confirm password' }).fill('password456');

    // Button should remain disabled
    const signupButton = page.getByRole('button', { name: 'Sign up' });
    await expect(signupButton).toBeDisabled();

    // Should show error message
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should keep button disabled when password is too short', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');

    // Fill in form with short password
    await page.getByRole('textbox', { name: 'Username' }).fill('testuser');
    await page.getByRole('textbox', { name: 'Email address' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('pass');
    await page.getByRole('textbox', { name: 'Confirm password' }).fill('pass');

    // Button should remain disabled
    const signupButton = page.getByRole('button', { name: 'Sign up' });
    await expect(signupButton).toBeDisabled();
  });
});
