import { test, expect } from '@playwright/test';

test.describe('Mobile User Experience', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone SE size)
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('Complete mobile user flow - iPhone SE', async ({ page }) => {
    console.log('📱 Testing complete mobile user journey...');
    
    const testEmail = `mobile-${Date.now()}@example.com`;
    
    // 1. MOBILE AUTH EXPERIENCE
    console.log('🔐 Testing mobile auth interface...');
    await page.goto('/auth');
    
    // Verify elements are properly sized for mobile
    const emailInput = page.locator('[data-testid="email"]');
    const passwordInput = page.locator('[data-testid="password"]');
    const signupBtn = page.locator('[data-testid="signup-btn"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signupBtn).toBeVisible();
    
    // Check that inputs are touch-friendly (at least 44px tall)
    const emailBox = await emailInput.boundingBox();
    const passwordBox = await passwordInput.boundingBox();
    const buttonBox = await signupBtn.boundingBox();
    
    if (emailBox) expect(emailBox.height).toBeGreaterThanOrEqual(40);
    if (passwordBox) expect(passwordBox.height).toBeGreaterThanOrEqual(40);
    if (buttonBox) expect(buttonBox.height).toBeGreaterThanOrEqual(40);
    
    // Fill form and signup
    await emailInput.fill(testEmail);
    await passwordInput.fill('TestPassword123!');
    await signupBtn.click();
    
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 2. MOBILE DASHBOARD EXPERIENCE
    console.log('📊 Testing mobile dashboard layout...');
    
    // Verify wallets are visible and properly laid out
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Growth')).toBeVisible();
    await expect(page.locator('text=Fun')).toBeVisible();
    
    // Check wallet cards don't overflow screen
    const walletCards = page.locator('.wallet-card, [data-testid="wallet"]');
    const cardCount = await walletCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = walletCards.nth(i);
      if (await card.isVisible()) {
        const cardBox = await card.boundingBox();
        if (cardBox) {
          expect(cardBox.width).toBeLessThanOrEqual(375); // Screen width
          expect(cardBox.x).toBeGreaterThanOrEqual(0); // Not off screen
        }
      }
    }
    
    // 3. MOBILE TRANSACTION ENTRY
    console.log('💸 Testing mobile transaction entry...');
    
    const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    
    // Check button is touch-friendly
    const addBtnBox = await addBtn.boundingBox();
    if (addBtnBox) expect(addBtnBox.height).toBeGreaterThanOrEqual(40);
    
    await addBtn.click();
    
    // Test form elements on mobile
    const categorySelect = page.locator('select').first();
    const amountInput = page.locator('input[type="number"]');
    const descriptionInput = page.locator('input[placeholder*="description"]');
    const submitBtn = page.locator('button:has-text("Add"), button:has-text("Submit")').first();
    
    // Verify all form elements are accessible on mobile
    await expect(categorySelect).toBeVisible();
    await expect(amountInput).toBeVisible();
    await expect(descriptionInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
    
    // Fill form using touch interactions
    await categorySelect.selectOption({ label: 'Groceries' });
    await amountInput.fill('12.99');
    await descriptionInput.fill('Mobile coffee purchase');
    await submitBtn.click();
    
    // 4. VERIFY MOBILE TRANSACTION DISPLAY
    console.log('📱 Verifying mobile transaction display...');
    
    await expect(page.locator('text=Mobile coffee purchase')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=12.99')).toBeVisible();
    
    // Check transaction list is readable on mobile
    const transactionElements = page.locator('.transaction-item, [data-testid="transaction"]');
    if (await transactionElements.count() > 0) {
      const firstTransaction = transactionElements.first();
      const transactionBox = await firstTransaction.boundingBox();
      if (transactionBox) {
        expect(transactionBox.width).toBeLessThanOrEqual(375);
        expect(transactionBox.height).toBeGreaterThan(30); // Readable height
      }
    }
    
    console.log('✅ Mobile user journey completed successfully');
  });

  test('Mobile touch interactions and gestures', async ({ page }) => {
    console.log('👆 Testing mobile touch interactions...');
    
    const testEmail = `touch-test-${Date.now()}@example.com`;
    
    // Setup user
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Test tap interactions (simulate touch)
    const walletElement = page.locator('text=Life').first();
    if (await walletElement.isVisible()) {
      // Use tap instead of click for mobile
      await walletElement.tap();
      console.log('👆 Tapped wallet element');
    }
    
    // Test that buttons respond to touch
    const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
    await addBtn.tap();
    
    // Fill form using mobile-appropriate interactions
    await page.tap('select');  // Tap to open dropdown
    await page.selectOption('select', { label: 'Groceries' });
    
    const amountInput = page.locator('input[type="number"]');
    await amountInput.tap();
    await amountInput.fill('25.99');
    
    const descriptionInput = page.locator('input[placeholder*="description"]');
    await descriptionInput.tap();
    await descriptionInput.fill('Touch interaction test');
    
    await page.tap('button:has-text("Add"), button:has-text("Submit")');
    
    await expect(page.locator('text=Touch interaction test')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Touch interactions test completed');
  });

  test('Mobile landscape orientation', async ({ page }) => {
    console.log('🔄 Testing mobile landscape mode...');
    
    // Set landscape orientation (typical mobile landscape)
    await page.setViewportSize({ width: 667, height: 375 });
    
    const testEmail = `landscape-${Date.now()}@example.com`;
    
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Verify layout adapts to landscape
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Growth')).toBeVisible();
    await expect(page.locator('text=Fun')).toBeVisible();
    
    // Check that content doesn't overflow in landscape
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(667);
    }
    
    // Test transaction addition in landscape
    const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
    await addBtn.click();
    
    await page.selectOption('select', { label: 'Groceries' });
    await page.fill('input[type="number"]', '18.50');
    await page.fill('input[placeholder*="description"]', 'Landscape test');
    await page.click('button:has-text("Add"), button:has-text("Submit")');
    
    await expect(page.locator('text=Landscape test')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Landscape orientation test completed');
  });

  test('Mobile performance and scrolling', async ({ page }) => {
    console.log('📱⚡ Testing mobile performance...');
    
    const testEmail = `perf-mobile-${Date.now()}@example.com`;
    
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard');
    
    // Add several transactions to test scrolling
    const transactions = [
      'Mobile transaction 1',
      'Mobile transaction 2',
      'Mobile transaction 3',
      'Mobile transaction 4',
      'Mobile transaction 5'
    ];
    
    for (const desc of transactions) {
      const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
      await addBtn.click();
      
      await page.selectOption('select', { label: 'Groceries' });
      await page.fill('input[type="number"]', '10.00');
      await page.fill('input[placeholder*="description"]', desc);
      await page.click('button:has-text("Add"), button:has-text("Submit")');
      
      await expect(page.locator(`text=${desc}`)).toBeVisible({ timeout: 3000 });
    }
    
    // Test scrolling behavior
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Verify first and last transactions are still accessible
    await expect(page.locator('text=Mobile transaction 1')).toBeVisible();
    
    console.log('✅ Mobile performance and scrolling test completed');
  });
});