#!/usr/bin/env node
/**
 * Setup script to create test wallets and transactions
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://nbssibquqrkwuyhxzbyg.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3NpYnF1cXJrd3V5aHh6YnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjM5OTAsImV4cCI6MjA4NTU5OTk5MH0.sPL0Q_AS9sjF0lWFyFXThVz3JSmanHEI0E36jWlqvEI"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupTestData() {
  console.log('🚀 Setting up test data...\n')

  try {
    // Check if wallets table exists and has data
    const { data: existingWallets, error: walletsError } = await supabase
      .from('wallets')
      .select('id, name')
    
    if (walletsError) {
      console.error('❌ Error accessing wallets table:', walletsError.message)
      return
    }

    console.log(`📊 Found ${existingWallets.length} existing wallets`)

    if (existingWallets.length === 0) {
      console.log('🏗️ Creating default wallets...')
      
      // Create default wallets
      const { data: newWallets, error: insertError } = await supabase
        .from('wallets')
        .insert([
          {
            name: 'Life',
            description: 'Essential expenses and bills',
            balance: 0.00,
            budget_limit: 50000.00,
            color: '#EF4444'
          },
          {
            name: 'Growth',
            description: 'Investments and savings',
            balance: 0.00,
            budget_limit: 30000.00,
            color: '#10B981'
          },
          {
            name: 'Fun',
            description: 'Entertainment and discretionary spending',
            balance: 0.00,
            budget_limit: 20000.00,
            color: '#F59E0B'
          }
        ])
        .select()

      if (insertError) {
        console.error('❌ Error creating wallets:', insertError.message)
        return
      }

      console.log('✅ Created wallets:')
      newWallets.forEach(wallet => {
        console.log(`   - ${wallet.name}: ₱${wallet.balance.toLocaleString()}`)
      })

      // Now add some test transactions to demonstrate the balance issue
      console.log('\n💰 Adding test transactions...')
      
      const lifeWallet = newWallets.find(w => w.name === 'Life')
      const growthWallet = newWallets.find(w => w.name === 'Growth')
      
      const testTransactions = [
        {
          amount: 5000,
          description: 'Salary Payment',
          date: '2026-02-01',
          wallet_id: growthWallet.id,
          type: 'income',
          status: 'completed'
        },
        {
          amount: 1500,
          description: 'Grocery Shopping',
          date: '2026-02-01',
          wallet_id: lifeWallet.id,
          type: 'expense',
          status: 'completed'
        },
        {
          amount: 3000,
          description: 'Bonus',
          date: '2026-02-02',
          wallet_id: growthWallet.id,
          type: 'income',
          status: 'completed'
        },
        {
          amount: 800,
          description: 'Utilities Bill',
          date: '2026-02-02',
          wallet_id: lifeWallet.id,
          type: 'expense',
          status: 'completed'
        },
        {
          amount: 2000,
          description: 'Investment Transfer',
          date: '2026-02-03',
          wallet_id: growthWallet.id,
          type: 'expense',
          status: 'completed'
        }
      ]

      for (const transaction of testTransactions) {
        const { data, error } = await supabase
          .from('transactions')
          .insert([transaction])
          .select()

        if (error) {
          console.error(`❌ Error adding transaction: ${error.message}`)
        } else {
          console.log(`   ✅ Added: ${transaction.type} ₱${transaction.amount} - ${transaction.description}`)
        }
      }

      console.log('\n📊 Expected wallet balances after transactions:')
      console.log(`   Life: ₱${(0 - 1500 - 800).toLocaleString()} (2 expenses)`)
      console.log(`   Growth: ₱${(0 + 5000 + 3000 - 2000).toLocaleString()} (2 income, 1 expense)`)
      console.log(`   Fun: ₱${(0).toLocaleString()} (no transactions)`)

      console.log('\n🐛 Current stored balances (should be wrong due to old bug):')
      const { data: currentWallets } = await supabase
        .from('wallets')
        .select('name, balance')
        .order('name')
      
      currentWallets.forEach(wallet => {
        console.log(`   ${wallet.name}: ₱${wallet.balance.toLocaleString()}`)
      })

      console.log('\n✅ Test data setup complete!')
      console.log('   Now you can run the balance test to see the issues and fixes')

    } else {
      console.log('✅ Wallets already exist, skipping setup')
      
      // Show current state
      const { data: wallets } = await supabase
        .from('wallets')
        .select('name, balance')
        .order('name')
      
      console.log('\n📊 Current wallet balances:')
      wallets.forEach(wallet => {
        console.log(`   ${wallet.name}: ₱${wallet.balance.toLocaleString()}`)
      })

      const { data: transactionCount } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
      
      console.log(`\n📝 Total transactions: ${transactionCount}`)
    }

  } catch (error) {
    console.error('❌ Error during setup:', error.message)
    if (error.details) console.error('Details:', error.details)
  }
}

setupTestData().catch(console.error)