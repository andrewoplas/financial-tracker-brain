'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getWallets, getTransactions, getSpendingSummary, Wallet, Transaction } from '@/lib/supabase'
import AddTransactionForm from './AddTransactionForm'
import MoneyFlowChart from './MoneyFlowChart'
import { 
  IoHomeOutline,
  IoStatsChartOutline,
  IoCardOutline,
  IoSettingsOutline,
  IoNotificationsOutline,
  IoLogOutOutline,
  IoSearchOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline
} from 'react-icons/io5'

export default function FundeyDesktopDashboard() {
  const { user, signOut } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTransaction, setShowAddTransaction] = useState(false)

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  const monthlyIncome = 101333 // Mock data for now
  const totalExpense = 26830 // Mock data for now

  const loadData = async () => {
    try {
      const [walletsData, transactionsData] = await Promise.all([
        getWallets(),
        getTransactions(10)
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
    }).format(amount)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">Fundey</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">MENU</p>
          <nav className="space-y-1">
            <a href="#" className="bg-gray-100 text-gray-900 flex items-center px-3 py-2 rounded-lg">
              <IoHomeOutline size={18} className="mr-3" />
              Dashboard
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 flex items-center px-3 py-2 rounded-lg hover:bg-gray-50">
              <IoStatsChartOutline size={18} className="mr-3" />
              Analytics
              <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">2</span>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 flex items-center px-3 py-2 rounded-lg hover:bg-gray-50">
              <IoCardOutline size={18} className="mr-3" />
              Transaction
            </a>
          </nav>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 mt-8">TOOLS</p>
          <nav className="space-y-1">
            <a href="#" className="text-gray-600 hover:text-gray-900 flex items-center px-3 py-2 rounded-lg hover:bg-gray-50">
              <IoSettingsOutline size={18} className="mr-3" />
              Settings
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 flex items-center px-3 py-2 rounded-lg hover:bg-gray-50">
              <IoNotificationsOutline size={18} className="mr-3" />
              Notifications
              <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">4</span>
            </a>
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getInitials(user?.email || '')}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{getUserName(user?.email || '')}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button onClick={signOut} className="text-gray-400 hover:text-gray-600">
              <IoLogOutOutline size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Keep Track, Assess, and Enhance Your Financial Performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddTransaction(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>+</span>
                <span>Add Transaction</span>
              </button>
              <div className="relative">
                <IoSearchOutline size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">⌘S</kbd>
              </div>
              <IoNotificationsOutline size={20} className="text-gray-600" />
              <IoSettingsOutline size={20} className="text-gray-600" />
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Balance */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Total Balance</h3>
                <select className="text-sm text-gray-600 border-none bg-transparent">
                  <option>All time</option>
                </select>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatAmount(totalBalance)}</p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center text-green-600">
                  <IoTrendingUpOutline size={14} className="mr-1" />
                  Total earned last time +₱84,503.00
                </span>
              </div>
            </div>

            {/* Income */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">My Income</h3>
                <span className="text-sm text-gray-600">July 2024</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatAmount(monthlyIncome)}</p>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Salary ₱28.3K</div>
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Budget ₱38.5K</div>
                <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Investment ₱34.4K</div>
              </div>
            </div>

            {/* Expense */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-medium">Total Expense</h3>
                <span className="text-sm text-gray-600">July 2024</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{formatAmount(totalExpense)}</p>
              <div className="flex items-center space-x-2 text-sm">
                <IoTrendingUpOutline size={14} className="text-green-600" />
                <span className="text-green-600">74% APR</span>
                <span className="text-gray-600">Earned +₱800.00</span>
              </div>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Money Flow Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Money Flow</h3>
                <select className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1">
                  <option>Monthly</option>
                </select>
              </div>
              <MoneyFlowChart period="month" />
            </div>

            {/* Budget Categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Remaining Monthly Budget</h3>
                <button className="text-green-600 text-sm hover:text-green-700">Budget setting →</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-gray-700">Healthcare</span>
                  </div>
                  <span className="font-medium text-gray-900">₱450.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-gray-700">Food</span>
                  </div>
                  <span className="font-medium text-gray-900">₱250.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Utilities</span>
                  </div>
                  <span className="font-medium text-gray-900">₱275.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-700">Supplies</span>
                  </div>
                  <span className="font-medium text-gray-900">₱150.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                <div className="flex items-center space-x-4">
                  <select className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1">
                    <option>All Transaction</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-green-600 text-xs font-semibold">
                                {(transaction.merchant || transaction.description)[0]?.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-gray-900 font-medium">
                              {transaction.merchant || transaction.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm capitalize">
                            {transaction.type || 'transaction'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                          {(transaction.type || 'expense') === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            (transaction.status || 'pending') === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {transaction.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-gray-400 hover:text-gray-600">•••</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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