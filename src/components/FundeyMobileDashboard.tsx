'use client'

import { useState, useEffect, useCallback } from 'react'
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
  IoPersonOutline,
  IoRefreshOutline
} from 'react-icons/io5'

export default function FundeyMobileDashboard() {
  const { user, signOut } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      }
      
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
      if (isRefresh) {
        setRefreshing(false)
      }
    }
  }, [])

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    const diff = currentY - startY
    
    // Only allow pull down when at top of page
    if (window.scrollY <= 0 && diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 60))
    }
  }, [startY])

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 50) {
      loadData(true)
    }
    setPullDistance(0)
    setStartY(0)
  }, [pullDistance, loadData])

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
    <div 
      className="min-h-screen bg-white scroll-container pull-to-refresh"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex justify-center"
          style={{ transform: `translateY(${Math.max(0, pullDistance - 60)}px)` }}
        >
          <div className="bg-white rounded-full shadow-lg p-3 mt-safe">
            <IoRefreshOutline 
              size={20} 
              className={`text-green-600 transition-transform duration-200 ${
                pullDistance > 50 ? 'animate-spin' : ''
              }`}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white pt-12 pb-6 mobile-spacing safe-area-top">
        <div className="flex items-center justify-between mb-6">
          <div className="slide-up">
            <h1 className="text-xl font-medium text-gray-900">
              Hi, {getUserName(user?.email || '')} 👋
            </h1>
            <p className="text-gray-500 text-sm">Welcome Back!</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="mobile-button p-2 rounded-full hover:bg-gray-100 no-tap-highlight">
              <IoNotificationsOutline size={24} className="text-gray-600" />
            </button>
            <button className="mobile-button w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 no-tap-highlight">
              <span className="text-white text-xs font-medium">
                {getInitials(user?.email || '')}
              </span>
            </button>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="mb-6 slide-up">
          <p className="text-gray-500 text-sm mb-2">Total Balance</p>
          <div className="flex items-center space-x-3">
            <h2 className={`text-3xl font-bold text-gray-900 transition-all duration-300 ${
              !balanceVisible ? 'blur-sm' : ''
            }`}>
              {balanceVisible ? formatAmount(totalBalance) : '₱••••••'}
            </h2>
            <button 
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="mobile-button p-2 rounded-full hover:bg-gray-100 no-tap-highlight smooth-bounce"
            >
              {balanceVisible ? (
                <IoEyeOutline size={20} className="text-gray-400" />
              ) : (
                <IoEyeOffOutline size={20} className="text-gray-400" />
              )}
            </button>
          </div>
          {refreshing && (
            <div className="flex items-center mt-2">
              <IoRefreshOutline size={16} className="text-green-600 animate-spin mr-2" />
              <p className="text-green-600 text-sm">Updating balance...</p>
            </div>
          )}
        </div>

        {/* Wallet Cards */}
        <div className="flex space-x-3 mb-6 overflow-x-auto scroll-touch pb-2">
          {wallets.map((wallet, index) => (
            <button
              key={wallet.id}
              className="mobile-card bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-4 flex-shrink-0 text-white min-w-[140px] shadow-lg hover:shadow-xl no-tap-highlight"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-green-200 text-xs">••••</p>
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <IoCardOutline size={12} className="text-white" />
                </div>
              </div>
              <p className="text-white font-semibold text-sm mb-1">{wallet.name}</p>
              <p className="text-green-200 text-xs">
                {balanceVisible ? `₱${wallet.balance.toLocaleString()}` : '••••••'}
              </p>
            </button>
          ))}
          {wallets.length === 0 && (
            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl p-4 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No wallets yet</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mb-6">
          <button 
            onClick={() => setShowAddTransaction(true)}
            className="mobile-button bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 py-4 flex items-center space-x-2 flex-1 justify-center shadow-lg hover:shadow-xl no-tap-highlight"
          >
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">+</span>
            </div>
            <span className="font-medium">Add Transaction</span>
          </button>
          <button className="mobile-button bg-green-100 hover:bg-green-200 text-green-700 rounded-2xl px-4 py-4 flex items-center space-x-2 shadow-md hover:shadow-lg no-tap-highlight">
            <IoArrowDownOutline size={18} />
            <span className="font-medium">Request</span>
          </button>
          <button className="mobile-button bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl p-4 shadow-md hover:shadow-lg no-tap-highlight">
            <IoAppsOutline size={20} />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mobile-spacing pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="mobile-button text-gray-500 text-sm hover:text-gray-700 px-3 py-2 rounded-lg no-tap-highlight">
            See All →
          </button>
        </div>

        <div className="space-y-1">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IoCardOutline size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm mb-2">No transactions yet</p>
              <p className="text-gray-400 text-xs">Add your first transaction to get started</p>
            </div>
          ) : (
            transactions.map((transaction, index) => (
              <button
                key={transaction.id}
                className="mobile-card w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 no-tap-highlight slide-up"
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                    (transaction.type || 'expense') === 'income' 
                      ? 'bg-green-100' 
                      : (transaction.type || 'expense') === 'expense'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      (transaction.type || 'expense') === 'income' 
                        ? 'text-green-600' 
                        : (transaction.type || 'expense') === 'expense'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}>
                      {transaction.merchant?.[0]?.toUpperCase() || transaction.description[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-gray-900 truncate">
                      {transaction.merchant || transaction.description}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${
                    (transaction.type || 'expense') === 'income' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {(transaction.type || 'expense') === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                  </p>
                  <p className="text-gray-500 text-xs capitalize">{transaction.type || 'expense'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around px-4 py-2">
          <button className="mobile-button flex flex-col items-center py-2 px-4 no-tap-highlight">
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <IoHomeOutline size={24} className="text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600">Home</span>
          </button>
          <button className="mobile-button flex flex-col items-center py-2 px-4 no-tap-highlight">
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <IoStatsChartOutline size={22} className="text-gray-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">Analytics</span>
          </button>
          <button className="mobile-button flex flex-col items-center py-2 px-4 no-tap-highlight">
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <IoCardOutline size={22} className="text-gray-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">Wallets</span>
          </button>
          <button className="mobile-button flex flex-col items-center py-2 px-4 no-tap-highlight">
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <IoPersonOutline size={22} className="text-gray-400" />
            </div>
            <span className="text-xs font-medium text-gray-400">Profile</span>
          </button>
        </div>
        
        {/* Home Indicator for iOS-style appearance */}
        <div className="flex justify-center pb-2">
          <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
        </div>
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