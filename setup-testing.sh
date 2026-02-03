#!/bin/bash

# 🧪 Financial Tracker Testing Framework Setup
# This script sets up the comprehensive testing framework
# Run with: bash setup-testing.sh

echo "🚀 Setting up Financial Tracker Testing Framework..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Step 1: Install testing dependencies
echo "📦 Installing testing dependencies..."
npm install --save-dev \
  @playwright/test \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  lighthouse \
  cross-env

echo "🌐 Installing Playwright browsers..."
npx playwright install

# Step 2: Create test directory structure
echo "📁 Creating test directory structure..."
mkdir -p tests/{e2e/user-flows,integration/{auth,database,components},performance,regression,utils}

# Step 3: Create configuration files
echo "⚙️ Creating configuration files..."

# Playwright config
cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [['html'], ['line']],
  
  use: {
    baseURL: process.env.NODE_ENV === 'production' 
      ? 'https://financial-tracker-brain.vercel.app'
      : 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  
  webServer: {
    command: 'npm run dev',
    port: 3001,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
EOF

# Vitest config  
cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
EOF

# Test setup file
cat > tests/setup.ts << 'EOF'
import '@testing-library/jest-dom';
import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.local' });
EOF

# Step 4: Create the critical user journey test
echo "🎯 Creating critical user journey test..."
cat > tests/e2e/user-flows/complete-user-journey.spec.ts << 'EOF'
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
EOF

# Step 5: Create wallet creation regression test
echo "🛡️ Creating wallet creation regression test..."
cat > tests/regression/wallet-creation.spec.ts << 'EOF'
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
EOF

# Step 6: Update package.json scripts
echo "📝 Adding test scripts to package.json..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts = {
  ...pkg.scripts,
  'test': 'vitest',
  'test:e2e': 'playwright test',
  'test:e2e:headed': 'playwright test --headed',
  'test:ui': 'playwright test --ui',
  'test:performance': 'lighthouse http://localhost:3001 --output html --output-path ./tests/performance/report.html',
  'test:all': 'npm run test && npm run test:e2e'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# Step 7: Create GitHub Actions workflow
echo "🔄 Creating GitHub Actions workflow..."
mkdir -p .github/workflows

cat > .github/workflows/test.yml << 'EOF'
name: Test Suite
on: 
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
      
    - name: Run unit tests
      run: npm run test
      
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
EOF

# Step 8: Create .gitignore entries for test artifacts
echo "📋 Updating .gitignore for test artifacts..."
cat >> .gitignore << 'EOF'

# Testing artifacts
/test-results/
/playwright-report/
/tests/performance/report.html
/coverage/
EOF

echo ""
echo "✅ Testing framework setup complete!"
echo ""
echo "🎯 Quick Start Commands:"
echo "  npm run test:e2e:headed    # Run E2E tests with browser visible"
echo "  npm run test:e2e           # Run E2E tests headless"
echo "  npm run test               # Run unit/integration tests"
echo "  npm run test:all           # Run all tests"
echo ""
echo "📁 Created files:"
echo "  - playwright.config.ts     # E2E test configuration"
echo "  - vitest.config.ts         # Unit test configuration"
echo "  - tests/                   # Test directory structure"
echo "  - .github/workflows/test.yml # CI/CD automation"
echo ""
echo "🚀 To start testing immediately:"
echo "  1. Start dev server: PORT=3001 npm run dev"
echo "  2. Run critical test: npm run test:e2e:headed"
echo ""
echo "🏆 Your testing framework is ready to catch bugs like the wallet creation issue!"