import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  
  test('Dashboard loads within 2 seconds', async ({ page }) => {
    console.log('⚡ Testing dashboard load time...');
    
    // First create a user and login
    const testEmail = `perf-test-${Date.now()}@example.com`;
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Now test dashboard load time
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 Dashboard loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
    
    console.log('✅ Dashboard performance test passed');
  });

  test('Transaction submission is fast', async ({ page }) => {
    console.log('💨 Testing transaction submission speed...');
    
    // Setup: create user and login
    const testEmail = `trans-perf-${Date.now()}@example.com`;
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Click add transaction
    const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
    await addBtn.click();
    
    // Fill form
    await page.selectOption('select', { label: 'Groceries' });
    await page.fill('input[type="number"]', '25.99');
    await page.fill('input[placeholder*="description"]', 'Performance test transaction');
    
    // Measure submission time
    const startTime = Date.now();
    await page.click('button:has-text("Add"), button:has-text("Submit")');
    
    // Wait for transaction to appear in the list
    await expect(page.locator('text=Performance test transaction')).toBeVisible({ timeout: 5000 });
    const submissionTime = Date.now() - startTime;
    
    console.log(`📝 Transaction submitted in ${submissionTime}ms`);
    expect(submissionTime).toBeLessThan(3000);
    
    console.log('✅ Transaction submission performance test passed');
  });

  test('Page is responsive on mobile', async ({ page }) => {
    console.log('📱 Testing mobile responsiveness...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const testEmail = `mobile-perf-${Date.now()}@example.com`;
    await page.goto('/auth');
    
    // Test auth page on mobile
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    
    // Login
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Test dashboard on mobile
    await expect(page.locator('text=Life')).toBeVisible();
    await expect(page.locator('text=Growth')).toBeVisible();
    await expect(page.locator('text=Fun')).toBeVisible();
    
    // Test that elements are properly sized for mobile
    const walletElements = page.locator('.wallet-card, [data-testid="wallet"]');
    const firstWallet = walletElements.first();
    
    if (await firstWallet.isVisible()) {
      const boundingBox = await firstWallet.boundingBox();
      if (boundingBox) {
        // Wallet should not overflow mobile screen
        expect(boundingBox.width).toBeLessThanOrEqual(375);
      }
    }
    
    console.log('✅ Mobile responsiveness test passed');
  });

  test('Multiple transactions load efficiently', async ({ page }) => {
    console.log('📈 Testing transaction list performance...');
    
    // Setup user
    const testEmail = `list-perf-${Date.now()}@example.com`;
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Add multiple transactions quickly
    const transactions = [
      { amount: '10.50', description: 'Coffee 1' },
      { amount: '25.75', description: 'Lunch 1' },
      { amount: '5.99', description: 'Snack 1' },
      { amount: '15.25', description: 'Coffee 2' },
      { amount: '30.00', description: 'Dinner 1' }
    ];
    
    for (const transaction of transactions) {
      const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
      await addBtn.click();
      
      await page.selectOption('select', { label: 'Groceries' });
      await page.fill('input[type="number"]', transaction.amount);
      await page.fill('input[placeholder*="description"]', transaction.description);
      await page.click('button:has-text("Add"), button:has-text("Submit")');
      
      // Wait for transaction to appear
      await expect(page.locator(`text=${transaction.description}`)).toBeVisible({ timeout: 3000 });
    }
    
    // Test that all transactions are visible
    for (const transaction of transactions) {
      await expect(page.locator(`text=${transaction.description}`)).toBeVisible();
    }
    
    console.log('✅ Transaction list performance test passed');
  });
});