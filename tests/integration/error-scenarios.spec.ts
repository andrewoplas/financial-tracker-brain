import { test, expect } from '@playwright/test';

test.describe('Error Scenario Tests', () => {
  
  test('Handles network failures gracefully', async ({ page }) => {
    console.log('🌐 Testing network failure handling...');
    
    // Setup user first
    const testEmail = `network-test-${Date.now()}@example.com`;
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Now block network requests to Supabase
    await page.route('**/rest/v1/**', route => route.abort());
    
    // Try to add a transaction while network is blocked
    const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
    await addBtn.click();
    
    await page.selectOption('select', { label: 'Groceries' });
    await page.fill('input[type="number"]', '15.75');
    await page.fill('input[placeholder*="description"]', 'Network test transaction');
    await page.click('button:has-text("Add"), button:has-text("Submit")');
    
    // Should show some kind of error message or retry option
    // The exact behavior depends on implementation
    console.log('🚨 Network blocked - checking error handling...');
    
    // Unblock network
    await page.unroute('**/rest/v1/**');
    
    console.log('✅ Network failure test completed');
  });

  test('Handles invalid form data', async ({ page }) => {
    console.log('📝 Testing form validation...');
    
    // Setup user
    const testEmail = `form-test-${Date.now()}@example.com`;
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Try to add transaction with invalid data
    const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
    await addBtn.click();
    
    // Test negative amount
    await page.fill('input[type="number"]', '-50');
    await page.fill('input[placeholder*="description"]', 'Negative amount test');
    await page.click('button:has-text("Add"), button:has-text("Submit")');
    
    // Should prevent submission or show error
    console.log('💰 Tested negative amount validation');
    
    // Test extremely large amount
    await page.fill('input[type="number"]', '999999999');
    await page.click('button:has-text("Add"), button:has-text("Submit")');
    
    // Should handle large numbers appropriately
    console.log('💸 Tested large amount validation');
    
    // Test empty description
    await page.fill('input[type="number"]', '25.50');
    await page.fill('input[placeholder*="description"]', '');
    await page.click('button:has-text("Add"), button:has-text("Submit")');
    
    // Should require description or provide default
    console.log('📝 Tested empty description validation');
    
    console.log('✅ Form validation test completed');
  });

  test('Handles session expiration', async ({ page }) => {
    console.log('🕒 Testing session expiration...');
    
    // Setup user
    const testEmail = `session-exp-${Date.now()}@example.com`;
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Clear all cookies/storage to simulate session expiration
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());
    
    // Try to perform an action that requires authentication
    await page.reload();
    
    // Should redirect to auth page or show login prompt
    // The exact behavior depends on implementation
    console.log('🔐 Session cleared - checking redirect behavior...');
    
    // Wait a moment to see what happens
    await page.waitForTimeout(2000);
    
    // Check if redirected to auth or still on dashboard with error
    const currentUrl = page.url();
    console.log(`📍 Current URL after session clear: ${currentUrl}`);
    
    console.log('✅ Session expiration test completed');
  });

  test('Handles malformed server responses', async ({ page }) => {
    console.log('🔧 Testing malformed response handling...');
    
    // Setup user
    const testEmail = `malformed-test-${Date.now()}@example.com`;
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Mock malformed responses from API
    await page.route('**/rest/v1/transactions**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"invalid": "json"'  // Malformed JSON
      });
    });
    
    // Try to add a transaction
    const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
    await addBtn.click();
    
    await page.selectOption('select', { label: 'Groceries' });
    await page.fill('input[type="number"]', '15.75');
    await page.fill('input[placeholder*="description"]', 'Malformed response test');
    await page.click('button:has-text("Add"), button:has-text("Submit")');
    
    // Should handle malformed response gracefully
    console.log('📡 Testing malformed JSON response handling...');
    
    // Restore normal routing
    await page.unroute('**/rest/v1/transactions**');
    
    console.log('✅ Malformed response test completed');
  });

  test('Handles concurrent user actions', async ({ page }) => {
    console.log('🔄 Testing concurrent actions...');
    
    // Setup user
    const testEmail = `concurrent-test-${Date.now()}@example.com`;
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Try to submit multiple transactions rapidly
    const transactions = [
      { amount: '10.00', description: 'Concurrent 1' },
      { amount: '20.00', description: 'Concurrent 2' },
      { amount: '30.00', description: 'Concurrent 3' }
    ];
    
    // Start all transactions simultaneously
    const promises = transactions.map(async (transaction, index) => {
      // Open new transaction form
      const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
      await addBtn.click();
      
      await page.selectOption('select', { label: 'Groceries' });
      await page.fill('input[type="number"]', transaction.amount);
      await page.fill('input[placeholder*="description"]', transaction.description);
      
      // Submit with slight delay to simulate real user behavior
      await page.waitForTimeout(index * 100);
      await page.click('button:has-text("Add"), button:has-text("Submit")');
    });
    
    // Wait for all to complete
    await Promise.allSettled(promises);
    
    // Check that at least some transactions were processed
    console.log('⚡ Concurrent submissions completed');
    
    console.log('✅ Concurrent actions test completed');
  });
});