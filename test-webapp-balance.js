#!/usr/bin/env node
/**
 * Test script to verify balance calculations work in the actual web app
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://nbssibquqrkwuyhxzbyg.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3NpYnF1cXJrd3V5aHh6YnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjM5OTAsImV4cCI6MjA4NTU5OTk5MH0.sPL0Q_AS9sjF0lWFyFXThVz3JSmanHEI0E36jWlqvEI"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testWebAppBalances() {
  console.log('🌐 Testing Web App Balance Display\n')

  try {
    // Sign in as test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@balancefix.com',
      password: 'testpassword123',
    })
    
    if (error) throw error
    console.log('✅ Signed in as test user')

    // Get wallets as the web app would
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: true })

    if (walletsError) throw walletsError

    console.log('\n💰 Current wallet balances (as seen by web app):')
    let totalBalance = 0
    
    for (const wallet of wallets) {
      totalBalance += wallet.balance
      
      // Get transaction count for this wallet
      const { data: transactionCount, error: countError } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('wallet_id', wallet.id)
      
      if (countError) console.error(`Error counting transactions for ${wallet.name}:`, countError.message)
      
      const budgetPercentage = wallet.budget_limit ? 
        Math.round((Math.abs(wallet.balance) / wallet.budget_limit) * 100) : 0
      
      console.log(`   ${wallet.name}:`)
      console.log(`     Balance: ₱${wallet.balance.toLocaleString()}`)
      console.log(`     Budget: ₱${wallet.budget_limit?.toLocaleString() || 'No limit'}`)
      console.log(`     Usage: ${budgetPercentage}%`)
      console.log(`     Transactions: ${transactionCount || 0}`)
      console.log(`     ID: ${wallet.id.slice(0, 8)}...`)
    }

    console.log(`\n📊 Total Balance: ₱${totalBalance.toLocaleString()}`)

    // Get recent transactions as the web app would
    console.log('\n📝 Recent transactions (as seen by web app):')
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select(`
        *,
        wallets(name, color),
        categories(name, icon)
      `)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)

    if (transError) throw transError

    if (transactions.length === 0) {
      console.log('   No transactions found')
    } else {
      for (const trans of transactions) {
        const walletName = trans.wallets?.name || 'Unknown Wallet'
        const sign = trans.type === 'income' ? '+' : '-'
        console.log(`   ${trans.date}: ${sign}₱${trans.amount.toLocaleString()} - ${trans.description}`)
        console.log(`     Wallet: ${walletName} | Status: ${trans.status}`)
      }
    }

    // Test adding a transaction (simulating the AddTransactionForm)
    console.log('\n🧪 Testing transaction addition...')
    
    if (wallets.length > 0) {
      const testWallet = wallets[0]
      const beforeBalance = testWallet.balance
      
      console.log(`   Using wallet: ${testWallet.name} (₱${beforeBalance.toLocaleString()})`)
      
      // Add a test transaction
      const { data: newTransaction, error: addError } = await supabase
        .from('transactions')
        .insert({
          user_id: data.user.id,
          amount: 75,
          description: 'Web App Balance Test',
          date: new Date().toISOString().split('T')[0],
          wallet_id: testWallet.id,
          type: 'expense',
          status: 'completed'
        })
        .select()
        .single()

      if (addError) throw addError
      
      console.log(`   ✅ Added test expense: ₱75`)
      console.log(`   Transaction ID: ${newTransaction.id}`)
      
      // Check if balance updated automatically (if triggers are working)
      const { data: updatedWallet, error: fetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', testWallet.id)
        .single()

      if (fetchError) throw fetchError
      
      const afterBalance = updatedWallet.balance
      const expectedBalance = beforeBalance - 75
      
      console.log(`\n📊 Balance check:`)
      console.log(`   Before: ₱${beforeBalance.toLocaleString()}`)
      console.log(`   Expected after: ₱${expectedBalance.toLocaleString()}`)
      console.log(`   Actual after: ₱${afterBalance.toLocaleString()}`)
      
      if (Math.abs(afterBalance - expectedBalance) < 0.01) {
        console.log(`   🎉 Balance updated correctly! (Triggers working)`)
      } else {
        console.log(`   ⚠️ Balance not updated automatically (Need to use recalculateWalletBalance)`)
        
        // Simulate what our fixed AddTransactionForm does
        console.log(`   🔧 Simulating recalculateWalletBalance...`)
        
        // Calculate balance from transactions
        const { data: allTransactions, error: calcError } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('wallet_id', testWallet.id)

        if (calcError) throw calcError
        
        let calculatedBalance = 0
        if (allTransactions) {
          for (const trans of allTransactions) {
            if (trans.type === 'income') {
              calculatedBalance += trans.amount
            } else if (trans.type === 'expense') {
              calculatedBalance -= trans.amount
            }
          }
        }
        
        // Update the wallet balance
        const { error: updateError } = await supabase
          .from('wallets')
          .update({ balance: calculatedBalance })
          .eq('id', testWallet.id)

        if (updateError) throw updateError
        
        console.log(`   ✅ Manually fixed balance: ₱${calculatedBalance.toLocaleString()}`)
        
        if (Math.abs(calculatedBalance - expectedBalance) < 0.01) {
          console.log(`   🎉 Manual fix works correctly!`)
        } else {
          console.log(`   ❌ Something is wrong with the calculation`)
        }
      }
    }

    console.log('\n✨ Web app balance test completed!')
    console.log('   Visit http://localhost:3002 to see the dashboard with real data')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    if (error.details) console.error('   Details:', error.details)
  }
}

testWebAppBalances().catch(console.error)