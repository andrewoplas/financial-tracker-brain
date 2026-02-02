import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Wallet {
  id: string
  name: string
  description?: string
  balance: number
  budget_limit?: number
  color?: string
  user_id: string
  created_at: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  created_at: string
}

export interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  wallet_id: string
  category_id?: string
  user_id: string
  type?: 'income' | 'expense' | 'transfer'
  status?: 'pending' | 'completed' | 'failed'
  payment_method?: string
  merchant?: string
  notes?: string
  created_at: string
  updated_at?: string
  // Relations
  wallets?: Wallet
  categories?: Category
}

// Helper function to get current user
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('User not authenticated')
  }
  return user
}

// API Functions (all require authentication via RLS)
export async function getWallets(): Promise<Wallet[]> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getTransactions(limit: number = 50): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      wallets(name, color),
      categories(name, icon)
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function addTransaction(
  transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Transaction> {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      user_id: user.id
    })
    .select(`
      *,
      wallets(name, color),
      categories(name, icon)
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateWalletBalance(walletId: string, newBalance: number): Promise<void> {
  const { error } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('id', walletId)

  if (error) throw error
}

export async function createWallet(
  wallet: Omit<Wallet, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<Wallet> {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('wallets')
    .insert({
      ...wallet,
      user_id: user.id
    })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateWallet(
  walletId: string, 
  updates: Partial<Omit<Wallet, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Wallet> {
  const { data, error } = await supabase
    .from('wallets')
    .update(updates)
    .eq('id', walletId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function deleteWallet(walletId: string): Promise<void> {
  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', walletId)

  if (error) throw error
}

// Calculate wallet spending for the current month
export async function getWalletSpending(walletId: string, month?: string): Promise<number> {
  const startOfMonth = month || new Date().toISOString().slice(0, 7) + '-01'
  const endOfMonth = month || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('wallet_id', walletId)
    .eq('type', 'expense')
    .gte('date', startOfMonth)
    .lte('date', endOfMonth)

  if (error) throw error

  return data?.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) || 0
}

// Get spending summary by category
export async function getSpendingSummary(period: 'week' | 'month' | 'year' = 'month') {
  const now = new Date()
  let startDate: string
  
  switch (period) {
    case 'week':
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startDate = startOfWeek.toISOString().slice(0, 10)
      break
    case 'year':
      startDate = `${now.getFullYear()}-01-01`
      break
    default: // month
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        type,
        categories(name, icon, color),
        wallets(name, color)
      `)
      .gte('date', startDate)
      .eq('type', 'expense')

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting spending summary:', error)
    return []
  }
}