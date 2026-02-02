'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getWallets, getTransactions, Wallet, Transaction } from '@/lib/supabase'
import AddTransactionForm from './AddTransactionForm'
import { 
  IoNotificationsOutline, 
  IoSendOutline, 
  IoArrowDownOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoAppsOutline,
  IoHomeOutline,
  IoStatsChartOutline,
  IoCardOutline,
  IoPersonOutline
} from 'react-icons/io5'

export default function FundeyMobileDashboard() {
  const { user, signOut } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showAddTransaction, setShowAddTransaction] = useState(false)

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)

  const loadData = async () => {
    try {
      const [walletsData, transactionsData] = await Promise.all([
        getWallets(),
        getTransactions(5) // Get recent 5 transactions
      ])
      setWallets(walletsData)
      setTransactions(transactionsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleTransactionAdded = () => {
    loadData() // Reload data when a transaction is added
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(Math.abs(amount))
  }

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase()
  }

  const getUserName = (email: string) => {
    const name = email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900">
              Hi, {getUserName(user?.email || '')}
            </h1>
            <p className="text-gray-500 text-sm">Welcome Back!</p>
          </div>
          <div className="flex items-center space-x-4">
            <IoNotificationsOutline size={24} className="text-gray-600" />
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {getInitials(user?.email || '')}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Wallet Balance</p>
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {balanceVisible ? formatAmount(totalBalance) : '••••••'}
            </h2>
            <button 
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="text-gray-400 hover:text-gray-600"
            >
              {balanceVisible ? (
                <IoEyeOutline size={20} />
              ) : (
                <IoEyeOffOutline size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="flex space-x-3 mb-6">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id}
              className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 flex-1 text-white"
            >
              <p className="text-green-200 text-xs mb-1">••••</p>
              <p className="text-white font-semibold text-sm">{wallet.name}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 py-3 flex items-center space-x-2 transition-colors"
          >
            <span className="text-xl">+</span>
            <span className="font-medium">Add Transaction</span>
          </button>
          <button className="bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl px-6 py-3 flex items-center space-x-2 transition-colors">
            <IoArrowDownOutline size={16} />
            <span className="font-medium">Request</span>
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl p-3 transition-colors">
            <IoAppsOutline size={20} />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-gray-500 text-sm hover:text-gray-700">
            See Details →
          </button>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent transactions</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-pink-600 text-sm font-semibold">
                      {transaction.merchant?.[0]?.toUpperCase() || transaction.description[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.merchant || transaction.description}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    (transaction.type || 'expense') === 'income' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {(transaction.type || 'expense') === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                  </p>
                  <p className="text-gray-500 text-xs capitalize">{transaction.type || 'transaction'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-around">
          <button className="p-3">
            <IoHomeOutline size={24} className="text-green-600" />
          </button>
          <button className="p-3">
            <IoStatsChartOutline size={24} className="text-gray-400" />
          </button>
          <button className="p-3">
            <IoCardOutline size={24} className="text-gray-400" />
          </button>
          <button className="p-3">
            <IoPersonOutline size={24} className="text-gray-400" />
          </button>
        </div>
        <div className="w-32 h-1 bg-gray-300 rounded-full mx-auto mt-2"></div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionForm
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSuccess={handleTransactionAdded}
      />
    </div>
  )
}