import { Page, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export class TestHelpers {
  
  /**
   * Generate unique test email
   */
  static generateTestEmail(prefix: string = 'test'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2)}@example.com`;
  }

  /**
   * Create and login a test user
   */
  static async createAndLoginUser(page: Page, emailPrefix: string = 'user'): Promise<string> {
    const testEmail = this.generateTestEmail(emailPrefix);
    
    await page.goto('/auth');
    await page.fill('[data-testid="email"]', testEmail);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="signup-btn"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify wallets are created
    await expect(page.locator('text=Life')).toBeVisible({ timeout: 5000 });
    
    return testEmail;
  }

  /**
   * Add a transaction via UI
   */
  static async addTransaction(
    page: Page, 
    options: {
      category?: string;
      amount: string;
      description: string;
    }
  ): Promise<void> {
    const { category = 'Groceries', amount, description } = options;
    
    const addBtn = page.locator('button:has-text("Add Transaction"), [data-testid="add-transaction"]').first();
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();
    
    await page.selectOption('select', { label: category });
    await page.fill('input[type="number"]', amount);
    await page.fill('input[placeholder*="description"]', description);
    await page.click('button:has-text("Add"), button:has-text("Submit")');
    
    // Wait for transaction to appear
    await expect(page.locator(`text=${description}`)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify transaction appears in the UI
   */
  static async verifyTransactionExists(
    page: Page,
    description: string,
    amount: string
  ): Promise<void> {
    await expect(page.locator(`text=${description}`)).toBeVisible();
    await expect(page.locator(`text=${amount}`)).toBeVisible();
  }

  /**
   * Clear all user data from database (cleanup)
   */
  static async cleanupTestUser(email: string): Promise<void> {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser = users?.users?.find(user => user.email === email);
    
    if (testUser) {
      // Delete user and all related data (cascading deletes should handle the rest)
      await supabase.auth.admin.deleteUser(testUser.id);
    }
  }

  /**
   * Wait for element with better error messaging
   */
  static async waitForElement(
    page: Page,
    selector: string,
    timeout: number = 5000
  ): Promise<void> {
    try {
      await expect(page.locator(selector)).toBeVisible({ timeout });
    } catch (error) {
      console.error(`Element not found: ${selector}`);
      console.error(`Current URL: ${page.url()}`);
      console.error(`Page title: ${await page.title()}`);
      throw error;
    }
  }

  /**
   * Take screenshot with timestamp for debugging
   */
  static async debugScreenshot(
    page: Page,
    name: string
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `test-results/debug-${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if element is touch-friendly (mobile)
   */
  static async verifyTouchFriendly(
    page: Page,
    selector: string,
    minHeight: number = 40
  ): Promise<void> {
    const element = page.locator(selector);
    await expect(element).toBeVisible();
    
    const boundingBox = await element.boundingBox();
    if (boundingBox) {
      expect(boundingBox.height).toBeGreaterThanOrEqual(minHeight);
    }
  }

  /**
   * Simulate network conditions
   */
  static async simulateSlowNetwork(page: Page): Promise<void> {
    // Simulate slow 3G
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 500 * 1024, // 500kb/s
      uploadThroughput: 500 * 1024,
      latency: 400 // 400ms latency
    });
  }

  /**
   * Reset network conditions
   */
  static async resetNetwork(page: Page): Promise<void> {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.disable');
  }

  /**
   * Measure performance of an action
   */
  static async measurePerformance<T>(
    action: () => Promise<T>,
    actionName: string
  ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await action();
    const duration = Date.now() - startTime;
    
    console.log(`⏱️ ${actionName} took ${duration}ms`);
    return { result, duration };
  }

  /**
   * Generate test data for transactions
   */
  static getTestTransactions(): Array<{
    category: string;
    amount: string;
    description: string;
  }> {
    return [
      { category: 'Groceries', amount: '25.99', description: 'Weekly grocery shopping' },
      { category: 'Transportation', amount: '12.50', description: 'Bus fare' },
      { category: 'Entertainment', amount: '15.00', description: 'Movie ticket' },
      { category: 'Food', amount: '8.75', description: 'Coffee and pastry' },
      { category: 'Shopping', amount: '45.00', description: 'Clothing purchase' },
      { category: 'Health', amount: '20.00', description: 'Pharmacy visit' },
      { category: 'Utilities', amount: '85.00', description: 'Electric bill' },
      { category: 'Groceries', amount: '18.25', description: 'Fresh produce' },
      { category: 'Entertainment', amount: '30.00', description: 'Concert ticket' },
      { category: 'Food', amount: '22.50', description: 'Restaurant dinner' }
    ];
  }

  /**
   * Verify wallet balances are correct
   */
  static async verifyWalletBalances(
    page: Page,
    expectedBalances: { [walletName: string]: string }
  ): Promise<void> {
    for (const [walletName, expectedBalance] of Object.entries(expectedBalances)) {
      const walletElement = page.locator(`text=${walletName}`).first();
      const walletContainer = walletElement.locator('..'); // Parent container
      
      await expect(walletContainer.locator(`text=${expectedBalance}`)).toBeVisible();
    }
  }

  /**
   * Handle common error scenarios
   */
  static async handleAuthRedirect(page: Page): Promise<boolean> {
    // Check if redirected to auth page
    if (page.url().includes('/auth')) {
      console.log('🔐 Detected auth redirect');
      return true;
    }
    return false;
  }

  /**
   * Setup mobile viewport
   */
  static async setupMobileViewport(
    page: Page,
    device: 'iphone' | 'android' = 'iphone'
  ): Promise<void> {
    const viewports = {
      iphone: { width: 375, height: 667 },
      android: { width: 360, height: 640 }
    };
    
    await page.setViewportSize(viewports[device]);
  }

  /**
   * Setup desktop viewport
   */
  static async setupDesktopViewport(page: Page): Promise<void> {
    await page.setViewportSize({ width: 1280, height: 720 });
  }
}

// Common test data
export const TEST_CATEGORIES = [
  'Groceries',
  'Transportation', 
  'Entertainment',
  'Food',
  'Shopping',
  'Health',
  'Utilities',
  'Education',
  'Travel',
  'Other'
];

export const TEST_WALLETS = ['Life', 'Growth', 'Fun'];

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD_TIME: 2000, // 2 seconds
  TRANSACTION_SUBMISSION: 3000, // 3 seconds
  FORM_INTERACTION: 500, // 0.5 seconds
  DASHBOARD_RENDER: 1500 // 1.5 seconds
};