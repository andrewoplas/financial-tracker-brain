#!/usr/bin/env node
/**
 * Comprehensive test for balance calculation fixes with authentication
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://nbssibquqrkwuyhxzbyg.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3NpYnF1cXJrd3V5aHh6YnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjM5OTAsImV4cCI6MjA4NTU5OTk5MH0.sPL0Q_AS9sjF0lWFyFXThVz3JSmanHEI0E36jWlqvEI"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Our new balance calculation functions (from the fixed supabase.ts)
async function calculateWalletBalanceFromTransactions(walletId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('wallet_id', walletId)

  if (error) throw error

  let balance = 0
  if (data) {
    for (const transaction of data) {
      if (transaction.type === 'income') {
        balance += transaction.amount
      } else if (transaction.type === 'expense') {
        balance -= transaction.amount
      }
    }
  }
  return balance
}

async function recalculateWalletBalance(walletId) {
  const calculatedBalance = await calculateWalletBalanceFromTransactions(walletId)
  
  const { error } = await supabase
    .from('wallets')
    .update({ balance: calculatedBalance })
    .eq('id', walletId)

  if (error) throw error
  
  return calculatedBalance
}

async function signInTestUser() {
  const testEmail = 'test@balancefix.com'
  const testPassword = 'testpassword123'

  console.log('🔐 Signing in test user...')
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })
  
  if (error) {
    console.log('❌ Sign in failed, trying to create user...')
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (signUpError) {
      throw new Error(`Failed to create user: ${signUpError.message}`)
    }
    
    console.log('✅ Test user created!')
    return signUpData.user
  } else {
    console.log('✅ Test user signed in!')
    return data.user
  }
}

async function addTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user.id,
      ...transaction
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function testFullBalanceFlow() {
  console.log('🚀 Starting Full Balance Calculation Test\n')

  try {
    // Step 1: Authenticate
    const user = await signInTestUser()
    
    // Step 2: Check if user has wallets (should be auto-created by trigger)
    console.log('\n💰 Checking user wallets...')
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('id, name, balance')
      .eq('user_id', user.id)
    
    if (walletsError) throw walletsError
    
    console.log(`   Found ${wallets.length} wallets:`)
    wallets.forEach(wallet => {
      console.log(`   - ${wallet.name}: ₱${wallet.balance.toLocaleString()} (ID: ${wallet.id.slice(0, 8)}...)`)
    })

    if (wallets.length === 0) {
      console.log('   No wallets found. Creating default wallets...')
      
      const defaultWallets = [
        { name: 'Life', description: 'Essential expenses', color: '#EF4444', budget_limit: 50000 },
        { name: 'Growth', description: 'Investments and savings', color: '#10B981', budget_limit: 30000 },
        { name: 'Fun', description: 'Entertainment', color: '#F59E0B', budget_limit: 20000 }
      ]
      
      for (const walletData of defaultWallets) {
        const { data, error } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, ...walletData })
          .select()
          .single()
        
        if (error) throw error
        wallets.push(data)
        console.log(`   ✅ Created: ${data.name}`)
      }
    }

    // Step 3: Get a test wallet
    const testWallet = wallets[0]
    console.log(`\n🧪 Using test wallet: ${testWallet.name}`)

    // Step 4: Get initial balance
    const initialBalance = testWallet.balance
    console.log(`   Initial stored balance: ₱${initialBalance.toLocaleString()}`)

    const initialCalculatedBalance = await calculateWalletBalanceFromTransactions(testWallet.id)
    console.log(`   Initial calculated balance: ₱${initialCalculatedBalance.toLocaleString()}`)

    // Step 5: Add some test transactions
    console.log('\n💸 Adding test transactions...')
    
    const testTransactions = [
      { amount: 1000, description: 'Test Income', type: 'income' },
      { amount: 300, description: 'Test Expense 1', type: 'expense' },
      { amount: 200, description: 'Test Expense 2', type: 'expense' },
    ]

    let expectedBalance = initialCalculatedBalance

    for (const transactionData of testTransactions) {
      const transaction = await addTransaction({
        ...transactionData,
        date: new Date().toISOString().split('T')[0],
        wallet_id: testWallet.id,
        status: 'completed'
      })
      
      if (transactionData.type === 'income') {
        expectedBalance += transactionData.amount
      } else if (transactionData.type === 'expense') {
        expectedBalance -= transactionData.amount
      }
      
      console.log(`   ✅ Added ${transactionData.type}: ₱${transactionData.amount} - ${transactionData.description}`)
      console.log(`      Expected balance now: ₱${expectedBalance.toLocaleString()}`)
    }

    // Step 6: Check the stored balance (should be wrong with old bug)
    const { data: currentWallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', testWallet.id)
      .single()
    
    console.log(`\n📊 Balance comparison:`)
    console.log(`   Stored balance: ₱${currentWallet.balance.toLocaleString()}`)
    console.log(`   Expected balance: ₱${expectedBalance.toLocaleString()}`)

    // Step 7: Calculate actual balance from transactions
    const actualCalculatedBalance = await calculateWalletBalanceFromTransactions(testWallet.id)
    console.log(`   Calculated from transactions: ₱${actualCalculatedBalance.toLocaleString()}`)

    // Step 8: Verify our calculation is correct
    const difference = Math.abs(expectedBalance - actualCalculatedBalance)
    if (difference < 0.01) {
      console.log(`   ✅ Our calculation is correct!`)
    } else {
      console.log(`   ❌ Calculation error! Difference: ₱${difference.toLocaleString()}`)
    }

    // Step 9: Test our fix function
    if (Math.abs(currentWallet.balance - actualCalculatedBalance) > 0.01) {
      console.log(`\n🔧 Balance mismatch detected! Testing fix function...`)
      
      const fixedBalance = await recalculateWalletBalance(testWallet.id)
      console.log(`   ✅ Fixed balance: ₱${fixedBalance.toLocaleString()}`)
      
      if (Math.abs(fixedBalance - expectedBalance) < 0.01) {
        console.log(`   🎉 Fix function works correctly!`)
      } else {
        console.log(`   ❌ Fix function has issues!`)
      }
    } else {
      console.log(`\n✅ Balance is already correct (no fix needed)`)
    }

    // Step 10: Test adding another transaction and using the fix
    console.log(`\n🧪 Testing real-world flow with fix...`)
    
    const newTransaction = await addTransaction({
      amount: 150,
      description: 'Final Test Expense',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      wallet_id: testWallet.id,
      status: 'completed'
    })
    
    console.log(`   ✅ Added expense: ₱150`)
    
    // Use our fix (this simulates the fixed AddTransactionForm behavior)
    const finalFixedBalance = await recalculateWalletBalance(testWallet.id)
    const finalExpectedBalance = expectedBalance - 150
    
    console.log(`   Expected final balance: ₱${finalExpectedBalance.toLocaleString()}`)
    console.log(`   Actual fixed balance: ₱${finalFixedBalance.toLocaleString()}`)
    
    if (Math.abs(finalFixedBalance - finalExpectedBalance) < 0.01) {
      console.log(`   🎉 FULL FLOW TEST PASSED!`)
    } else {
      console.log(`   ❌ Full flow test failed!`)
    }

    console.log(`\n✨ Test completed successfully!`)

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.details) console.error('   Details:', error.details)
  }
}

testFullBalanceFlow().catch(console.error)