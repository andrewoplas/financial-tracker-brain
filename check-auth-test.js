#!/usr/bin/env node
/**
 * Test authentication status
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = "https://nbssibquqrkwuyhxzbyg.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ic3NpYnF1cXJrd3V5aHh6YnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjM5OTAsImV4cCI6MjA4NTU5OTk5MH0.sPL0Q_AS9sjF0lWFyFXThVz3JSmanHEI0E36jWlqvEI"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAuth() {
  console.log('🔐 Checking authentication status...\n')

  try {
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('❌ Auth error:', userError.message)
    }
    
    if (user) {
      console.log('✅ User authenticated:')
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
    } else {
      console.log('❌ No authenticated user')
    }

    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message)
    }
    
    if (session) {
      console.log('✅ Active session found')
    } else {
      console.log('❌ No active session')
    }

    // Try to access categories (should work without auth)
    console.log('\n📋 Testing categories access (should work)...')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name')
      .limit(3)
    
    if (categoriesError) {
      console.log('❌ Categories error:', categoriesError.message)
    } else {
      console.log('✅ Categories accessible:', categories.map(c => c.name).join(', '))
    }

    // Try to access wallets (should fail without auth)
    console.log('\n💰 Testing wallets access (should fail without auth)...')
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('name')
      .limit(3)
    
    if (walletsError) {
      console.log('❌ Wallets error (expected):', walletsError.message)
    } else {
      console.log('✅ Wallets accessible:', wallets)
    }

    // Try creating a test user (sign up)
    console.log('\n👤 Attempting to create test user...')
    const testEmail = 'test@balancefix.com'
    const testPassword = 'testpassword123'
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('ℹ️ Test user already exists, trying to sign in...')
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        })
        
        if (signInError) {
          console.log('❌ Sign in error:', signInError.message)
        } else {
          console.log('✅ Signed in successfully!')
          console.log(`   User ID: ${signInData.user.id}`)
          
          // Now try accessing wallets again
          console.log('\n💰 Testing wallets access after auth...')
          const { data: authWallets, error: authWalletsError } = await supabase
            .from('wallets')
            .select('name, balance')
          
          if (authWalletsError) {
            console.log('❌ Wallets error after auth:', authWalletsError.message)
          } else {
            console.log('✅ Wallets accessible after auth:', authWallets)
          }
        }
      } else {
        console.log('❌ Sign up error:', signUpError.message)
      }
    } else {
      console.log('✅ User created successfully!')
      console.log(`   User ID: ${signUpData.user.id}`)
      console.log('   Note: You may need to confirm email depending on settings')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkAuth().catch(console.error)