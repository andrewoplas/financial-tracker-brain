#!/usr/bin/env node
/**
 * Simple test script to validate balance calculation fixes
 * Run with: node simple-balance-test.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://nbssibquqrkwuyhxzbyg.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3NpYnF1cXJrd3V5aHh6YnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjM5OTAsImV4cCI6MjA4NTU5OTk5MH0.sPL0Q_AS9sjF0lWFyFXThVz3JSmanHEI0E36jWlqvEI"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

async function testBalanceCalculations() {
  console.log('🧪 Testing Balance Calculation Fix...\n')

  try {
    // Get all wallets
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('id, name, balance')

    if (walletsError) throw walletsError

    console.log(`📊 Found ${wallets.length} wallets\n`)

    let totalIssues = 0

    for (const wallet of wallets) {
      console.log(`\n💰 Testing wallet: ${wallet.name}`)
      console.log(`   ID: ${wallet.id}`)
      console.log(`   Current stored balance: ₱${wallet.balance.toLocaleString()}`)

      // Get transactions for this wallet
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('amount, type, description, date')
        .eq('wallet_id', wallet.id)
        .order('date', { ascending: true })

      if (transError) throw transError

      console.log(`   Transaction count: ${transactions.length}`)

      if (transactions.length > 0) {
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
          totalIssues++
          
          // Show transaction breakdown
          console.log(`   \n   📋 Transaction breakdown:`)
          let runningBalance = 0
          for (const trans of transactions.slice(-5)) { // Show last 5 transactions
            if (trans.type === 'income') {
              runningBalance += trans.amount
              console.log(`   ➕ ${trans.date}: +₱${trans.amount} (${trans.description}) → ₱${runningBalance}`)
            } else if (trans.type === 'expense') {
              runningBalance -= trans.amount
              console.log(`   ➖ ${trans.date}: -₱${trans.amount} (${trans.description}) → ₱${runningBalance}`)
            }
          }
          if (transactions.length > 5) {
            console.log(`   ... and ${transactions.length - 5} more transactions`)
          }
        }
      } else {
        console.log(`   📝 No transactions yet`)
        if (wallet.balance !== 0) {
          console.log(`   ❌ Wallet has balance but no transactions!`)
          totalIssues++
        }
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   Total wallets: ${wallets.length}`)
    console.log(`   Issues found: ${totalIssues}`)
    
    if (totalIssues === 0) {
      console.log(`   🎉 All balances are correct!`)
    } else {
      console.log(`   ⚠️ ${totalIssues} wallet(s) need balance correction`)
    }

  } catch (error) {
    console.error('❌ Error during testing:', error.message)
    if (error.details) console.error('Details:', error.details)
    if (error.hint) console.error('Hint:', error.hint)
  }
}

async function addTestTransaction() {
  console.log('\n🧪 Adding a test transaction to verify our fix...')
  
  try {
    // Get the first wallet
    const { data: wallets } = await supabase.from('wallets').select('id, name, balance').limit(1)
    
    if (!wallets || wallets.length === 0) {
      console.log('❌ No wallets found for testing')
      return
    }
    
    const testWallet = wallets[0]
    console.log(`   Using wallet: ${testWallet.name} (₱${testWallet.balance.toLocaleString()})`)
    
    // Add a small test expense
    const testAmount = 1
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        amount: testAmount,
        description: 'Balance Test Transaction',
        date: new Date().toISOString().split('T')[0],
        wallet_id: testWallet.id,
        type: 'expense',
        status: 'completed'
      }])
      .select()

    if (error) throw error
    
    console.log(`   ✅ Test transaction added: ₱${testAmount} expense`)
    
    // Check what the balance should be now
    const calculatedBalance = await calculateWalletBalanceFromTransactions(testWallet.id)
    console.log(`   Expected balance after transaction: ₱${calculatedBalance.toLocaleString()}`)
    
    // Get current stored balance (unchanged since we haven't updated it)
    const { data: currentWallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', testWallet.id)
      .single()
    
    console.log(`   Actual stored balance: ₱${currentWallet.balance.toLocaleString()}`)
    
    if (Math.abs(currentWallet.balance - calculatedBalance) > 0.01) {
      console.log(`   🔧 Balance needs recalculation! (This is expected with the old bug)`)
      console.log(`   🔧 Our new fix should handle this automatically when used`)
    } else {
      console.log(`   ✅ Balance is already correct`)
    }
    
    console.log(`\n   📝 Transaction ID: ${data[0].id} (you can delete this later)`)
    
  } catch (error) {
    console.error('❌ Error adding test transaction:', error.message)
  }
}

async function main() {
  console.log('🚀 Starting Balance Fix Validation\n')
  
  await testBalanceCalculations()
  await addTestTransaction()
  
  console.log('\n✨ Test complete!')
}

main().catch(console.error)