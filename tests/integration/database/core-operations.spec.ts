import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Load environment variables for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

test.describe('Database Integration Tests', () => {
  let supabase: any;
  
  test.beforeEach(() => {
    supabase = createClient(supabaseUrl, supabaseKey);
  });
  
  test('Database tables are accessible', async () => {
    console.log('🗄️ Testing database connectivity...');
    
    // Test each critical table
    const tables = ['categories', 'wallets', 'transactions'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      expect(error).toBeNull();
      expect(data).toBeDefined();
      console.log(`✅ Table "${table}" accessible`);
    }
  });
  
  test('Categories are pre-populated', async () => {
    console.log('📋 Testing categories setup...');
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*');
    
    expect(error).toBeNull();
    expect(categories?.length).toBeGreaterThan(0);
    
    // Check for expected categories
    if (categories) {
      const categoryNames = categories.map((cat: any) => cat.name);
      expect(categoryNames).toContain('Groceries');
      console.log(`✅ Found ${categories.length} categories including Groceries`);
    }
  });

  test('Wallet triggers work correctly (regression test)', async () => {
    console.log('🏦 Testing wallet creation triggers...');
    
    // Create a test user
    const testEmail = `db-test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    expect(authError).toBeNull();
    expect(authData.user).toBeDefined();
    
    if (authData.user) {
      // Wait a moment for triggers to execute
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if wallets were created by the trigger
      const { data: wallets, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authData.user.id);
      
      expect(walletError).toBeNull();
      expect(wallets).toHaveLength(3);
      
      if (wallets) {
        const walletNames = wallets.map((w: any) => w.name).sort();
        expect(walletNames).toEqual(['Fun', 'Growth', 'Life']);
        console.log('✅ Wallet creation triggers working correctly');
      }
      
      // Clean up test user
      await supabase.auth.admin.deleteUser(authData.user.id);
    }
  });
});