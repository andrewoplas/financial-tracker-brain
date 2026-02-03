#!/usr/bin/env node
/**
 * Test script to validate balance calculation fixes
 * Run with: node test-balance-fix.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Helper functions (copied from our updated supabase.ts)
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

async function getStoredWalletBalance(walletId) {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance')
    .eq('id', walletId)
    .single()

  if (error) throw error
  return data.balance
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

async function testBalanceCalculations() {
  console.log('🧪 Testing Balance Calculation Fix...\n')

  try {
    // Get all wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('id, name, balance')

    if (walletsError) throw walletsError

    console.log(`📊 Found ${wallets.length} wallets\n`)

    for (const wallet of wallets) {
      console.log(`\n💰 Testing wallet: ${wallet.name} (${wallet.id})`)
      console.log(`   Current stored balance: ₱${wallet.balance.toLocaleString()}`)

      // Get transactions for this wallet
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('amount, type, description, date')
        .eq('wallet_id', wallet.id)
        .order('date', { ascending: true })

      if (transError) throw transError

      console.log(`   Transaction count: ${transactions.length}`)

      // Calculate balance from transactions
      const calculatedBalance = await calculateWalletBalanceFromTransactions(wallet.id)
      console.log(`   Calculated from transactions: ₱${calculatedBalance.toLocaleString()}`)

      // Check if they match
      const difference = Math.abs(wallet.balance - calculatedBalance)
      const isValid = difference < 0.01

      if (isValid) {
        console.log(`   ✅ Balance is correct!`)
      } else {
        console.log(`   ❌ Balance mismatch! Difference: ₱${difference.toLocaleString()}`)
        
        // Show transaction breakdown
        console.log(`   \n   📋 Transaction breakdown:`)
        let runningBalance = 0
        for (const trans of transactions) {
          if (trans.type === 'income') {
            runningBalance += trans.amount
            console.log(`   ➕ ${trans.date}: +₱${trans.amount} (${trans.description}) → ₱${runningBalance}`)
          } else if (trans.type === 'expense') {
            runningBalance -= trans.amount
            console.log(`   ➖ ${trans.date}: -₱${trans.amount} (${trans.description}) → ₱${runningBalance}`)
          }
        }
        
        // Fix the balance
        console.log(`   \n   🔧 Fixing balance...`)
        const newBalance = await recalculateWalletBalance(wallet.id)
        console.log(`   ✅ Fixed! New balance: ₱${newBalance.toLocaleString()}`)
      }
    }

    console.log('\n🎉 Balance validation complete!')

  } catch (error) {
    console.error('❌ Error during testing:', error.message)
    if (error.details) console.error('Details:', error.details)
    if (error.hint) console.error('Hint:', error.hint)
  }
}

// Add a test transaction function
async function addTestTransaction(walletId, amount, type, description) {
  console.log(`\n🧪 Adding test ${type}: ₱${amount} - ${description}`)
  
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      amount: amount,
      description: description,
      date: new Date().toISOString().split('T')[0],
      wallet_id: walletId,
      type: type,
      status: 'completed'
    }])
    .select()

  if (error) throw error
  
  console.log(`   ✅ Transaction added: ${data[0].id}`)
  return data[0]
}

async function runFullTest() {
  await testBalanceCalculations()
  
  // Get the first wallet for testing
  const { data: wallets } = await supabase.from('wallets').select('id, name').limit(1)
  
  if (wallets && wallets.length > 0) {
    const testWallet = wallets[0]
    console.log(`\n🧪 Running live transaction test with wallet: ${testWallet.name}`)
    
    // Get initial balance
    const initialBalance = await calculateWalletBalanceFromTransactions(testWallet.id)
    console.log(`   Initial balance: ₱${initialBalance.toLocaleString()}`)
    
    // Add test income
    await addTestTransaction(testWallet.id, 100, 'income', 'Test Income')
    await recalculateWalletBalance(testWallet.id)
    
    const balanceAfterIncome = await calculateWalletBalanceFromTransactions(testWallet.id)
    console.log(`   Balance after +₱100 income: ₱${balanceAfterIncome.toLocaleString()}`)
    
    // Add test expense
    await addTestTransaction(testWallet.id, 50, 'expense', 'Test Expense')
    await recalculateWalletBalance(testWallet.id)
    
    const balanceAfterExpense = await calculateWalletBalanceFromTransactions(testWallet.id)
    console.log(`   Balance after -₱50 expense: ₱${balanceAfterExpense.toLocaleString()}`)
    
    const expectedFinalBalance = initialBalance + 100 - 50
    const actualFinalBalance = balanceAfterExpense
    
    if (Math.abs(expectedFinalBalance - actualFinalBalance) < 0.01) {
      console.log(`   ✅ Live test PASSED! Expected: ₱${expectedFinalBalance}, Got: ₱${actualFinalBalance}`)
    } else {
      console.log(`   ❌ Live test FAILED! Expected: ₱${expectedFinalBalance}, Got: ₱${actualFinalBalance}`)
    }
  }
}

// Run the test
if (require.main === module) {
  runFullTest().catch(console.error)
}

module.exports = {
  testBalanceCalculations,
  addTestTransaction,
  calculateWalletBalanceFromTransactions
}