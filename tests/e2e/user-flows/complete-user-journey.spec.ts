import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('New user: Signup → Wallets → Add Transaction → Dashboard', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    
    console.log('🧪 Testing complete user journey...');
    
    // 1. NAVIGATE TO APP
    await page.goto('/');
    
    // 2. SIGNUP PROCESS
    console.log('📝 Testing signup...');
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    
    // Wait for dashboard (auto-redirect after signup)
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 3. VERIFY WALLETS AUTO-CREATED
    console.log('💰 Verifying wallets were auto-created...');
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Growth')).toBeVisible();
    await expect(page.locator('text=Fun')).toBeVisible();
    
    // 4. ADD A TRANSACTION
    console.log('💸 Adding transaction...');
    const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();
    
    // Fill transaction form
    await page.selectOption('select', { label: 'Groceries' });
    await page.fill('input[type="number"]', '15.75');
    await page.fill('input[placeholder*="description"]', 'Coffee & pastry');
    await page.click('button:has-text("Add"), button:has-text("Submit")');
    
    // 5. VERIFY DASHBOARD UPDATES
    console.log('📊 Verifying dashboard updates...');
    await expect(page.locator('text=Coffee & pastry')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=15.75')).toBeVisible();
    
    // 6. TEST LOGIN PERSISTENCE
    console.log('🔐 Testing login persistence...');
    await page.reload();
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Complete user journey test PASSED!');
  });
});
