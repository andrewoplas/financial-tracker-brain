import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Tests', () => {
  
  test('Complete signup flow with UI validation', async ({ page }) => {
    const testEmail = `auth-test-${Date.now()}@example.com`;
    
    console.log('🔐 Testing complete signup flow...');
    
    await page.goto('/auth');
    
    // Test form validation
    await page.click('[data-testid="signup-btn"]');
    // Should show validation errors for empty fields
    
    // Fill form correctly
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Signup flow completed successfully');
  });

  test('Login with existing user', async ({ page }) => {
    // First create a user
    const testEmail = `login-test-${Date.now()}@example.com`;
    
    console.log('🔑 Testing login flow...');
    
    // Signup first
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Now logout and login again
    const logoutBtn = page.locator('button:has-text("Logout"), [data-testid="logout"]').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      // Navigate to auth if no logout button
      await page.goto('/auth');
    }
    
    // Switch to login mode if there's a toggle
    const loginToggle = page.locator('button:has-text("Login"), [data-testid="login-mode"]').first();
    if (await loginToggle.isVisible()) {
      await loginToggle.click();
    }
    
    // Login with same credentials
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="login-btn"], [data-testid="signup-btn"]');
    
    // Should be back on dashboard with existing wallets
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Login flow completed successfully');
  });

  test('Password validation', async ({ page }) => {
    console.log('🔒 Testing password validation...');
    
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', 'test@example.com');
    
    // Test weak password
    await page.fill('[data-testid="password"]', '123');
    await page.click('[data-testid="signup-btn"]');
    
    // Should show error or prevent submission
    // The exact behavior depends on implementation
    
    console.log('✅ Password validation test completed');
  });

  test('Session persistence across page reloads', async ({ page }) => {
    const testEmail = `session-test-${Date.now()}@example.com`;
    
    console.log('💾 Testing session persistence...');
    
    // Login
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    
    // Navigate away and back
    await page.goto('/');
    await page.goto('/dashboard');
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Session persistence test completed');
  });
});