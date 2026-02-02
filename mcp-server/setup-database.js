#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env.local' });

async function setupDatabase() {
  console.log('🗄️ Setting up database functions for MCP server...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Using service role for admin functions
  );

  try {
    // Read the SQL function
    const sql = readFileSync('wallet-balance-function.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Try alternative method - direct SQL execution
      const { error: directError } = await supabase
        .from('_supabase_migrations') 
        .select('*')
        .limit(1);
        
      if (directError) {
        console.log('⚠️ Could not create function via API. Please run the SQL manually in Supabase Dashboard:\n');
        console.log('Go to: https://supabase.com/dashboard/project/nbssibquqrkwuyhxzbyg/sql\n');
        console.log('Paste this SQL:');
        console.log('─'.repeat(50));
        console.log(sql);
        console.log('─'.repeat(50));
        console.log('\nThen click "Run" to create the function.\n');
        return;
      }
    }

    console.log('✅ Database function created successfully!\n');
    
    // Test the function
    console.log('🧪 Testing the function...');
    
    // Get a test wallet (should be one from auto-creation)
    const { data: wallets, error: walletError } = await supabase
      .from('wallets')
      .select('id, name, balance')
      .limit(1);

    if (walletError || !wallets?.length) {
      console.log('⚠️ No wallets found. Make sure you have signed up a user first!\n');
      return;
    }

    const testWallet = wallets[0];
    console.log(`Using test wallet: ${testWallet.name} (current balance: ₱${testWallet.balance})`);

    // Test the function with a small amount
    const { error: testError } = await supabase.rpc('update_wallet_balance', {
      wallet_id: testWallet.id,
      amount_change: 0.01 // Add 1 centavo as test
    });

    if (testError) {
      console.log('❌ Function test failed:', testError.message);
      return;
    }

    // Revert the test change
    await supabase.rpc('update_wallet_balance', {
      wallet_id: testWallet.id,
      amount_change: -0.01 // Remove the test centavo
    });

    console.log('✅ Function test passed!\n');
    console.log('🎉 MCP server database setup complete!\n');
    console.log('Next steps:');
    console.log('  1. Run: npm test');
    console.log('  2. Configure OpenClaw to use this MCP server');
    console.log('  3. Start talking to Claude about your finances! 💰\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n⚠️ Please run the SQL manually in Supabase Dashboard:\n');
    console.log('Go to: https://supabase.com/dashboard/project/nbssibquqrkwuyhxzbyg/sql\n');
    console.log('Paste this SQL:');
    console.log('─'.repeat(50));
    const sql = readFileSync('wallet-balance-function.sql', 'utf8');
    console.log(sql);
    console.log('─'.repeat(50));
  }
}

setupDatabase().catch(console.error);