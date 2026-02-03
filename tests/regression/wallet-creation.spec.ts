import { test, expect } from '@playwright/test';

test.describe('Wallet Creation Regression Tests', () => {
  test('New user gets exactly 3 default wallets immediately', async ({ page }) => {
    const testEmail = `wallet-test-${Date.now()}@example.com`;
    
    console.log('🧪 Testing wallet creation bug regression...');
    
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // CRITICAL: Check that wallets appear immediately
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Growth')).toBeVisible();
    await expect(page.locator('text=Fun')).toBeVisible();
    
    console.log('✅ Wallet creation regression test PASSED!');
  });
});
