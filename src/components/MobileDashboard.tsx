'use client'

import { useState } from 'react'
import BottomNavigation from './BottomNavigation'
import SpendingChart from './SpendingChart'
import BudgetCard from './BudgetCard'
import { 
  IoSettingsOutline, 
  IoNotificationsOutline, 
  IoCardOutline, 
  IoDownloadOutline,
  IoHomeOutline,
  IoTrendingUpOutline,
  IoGameControllerOutline,
  IoFastFoodOutline,
  IoCarOutline,
  IoFilmOutline,
  IoCafeOutline
} from 'react-icons/io5'

export default function MobileDashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const [totalBalance] = useState(74503)
  const [monthlySpent] = useState(26830)
  const [transferLimit] = useState(50000)

  const walletData = [
    { name: 'Life', balance: 35000, spent: 15000, color: '#10B981', percentage: 35, icon: IoHomeOutline },
    { name: 'Growth', balance: 25000, spent: 5000, color: '#34D399', percentage: 12, icon: IoTrendingUpOutline },
    { name: 'Fun', balance: 14503, spent: 6830, color: '#6EE7B7', percentage: 20, icon: IoGameControllerOutline },
  ]

  const recentTransactions = [
    { id: 1, name: 'McDonald\'s', category: 'Food & Drinks', amount: -245, icon: IoFastFoodOutline, wallet: 'Fun' },
    { id: 2, name: 'Netflix', category: 'Entertainment', amount: -549, icon: IoFilmOutline, wallet: 'Fun' },
    { id: 3, name: 'Angkas Premium', category: 'Transportation', amount: -150, icon: IoCarOutline, wallet: 'Life' },
    { id: 4, name: 'Coffee Bean', category: 'Food & Drinks', amount: -180, icon: IoCafeOutline, wallet: 'Fun' }
  ]

  const mobileBudgetData = [
    { category: 'Food & Dining', spent: 450, budget: 500, icon: IoFastFoodOutline, color: '#F59E0B' },
    { category: 'Transportation', spent: 280, budget: 400, icon: IoCarOutline, color: '#3B82F6' },
    { category: 'Entertainment', spent: 180, budget: 200, icon: IoFilmOutline, color: '#8B5CF6' }
  ]

  if (activeTab === 'wallet') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Mobile Header */}
        <div className="bg-white px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Budget Overview</h1>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <IoSettingsOutline size={20} />
            </button>
          </div>
        </div>

        {/* Overall Budget */}
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Monthly Budget</h2>
                <p className="text-emerald-100 text-sm">February 2026</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">₱1,100</div>
                <div className="text-emerald-100 text-xs">Total Budget</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xl font-bold">₱910</div>
                <div className="text-emerald-100 text-sm">Spent (83%)</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">₱190</div>
                <div className="text-emerald-100 text-sm">Remaining</div>
              </div>
            </div>

            <div className="w-full bg-emerald-400 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '83%' }}></div>
            </div>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="px-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="space-y-4">
            {mobileBudgetData.map((budget, index) => (
              <div key={index} className="bg-white rounded-xl p-4">
                <BudgetCard {...budget} />
              </div>
            ))}
          </div>
        </div>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    )
  }

  if (activeTab === 'insights') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Mobile Header */}
        <div className="bg-white px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <IoSettingsOutline size={20} />
            </button>
          </div>
        </div>

        {/* Spending Chart */}
        <div className="px-6 mb-6">
          <SpendingChart walletData={walletData} totalSpent={monthlySpent} />
        </div>

        {/* Time Period Selector */}
        <div className="px-6 mb-6">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button className="flex-1 py-2 px-4 text-gray-600 text-sm font-medium">Week</button>
            <button className="flex-1 py-2 px-4 bg-white text-emerald-600 text-sm font-medium rounded-lg shadow-sm">Month</button>
            <button className="flex-1 py-2 px-4 text-gray-600 text-sm font-medium">Year</button>
          </div>
        </div>

        {/* Spending Categories */}
        <div className="px-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Categories</h3>
          <div className="space-y-3">
            {walletData.map((wallet, index) => (
              <div key={index} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: wallet.color + '20' }}
                  >
                    <wallet.icon size={20} style={{ color: wallet.color }} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">₱{wallet.spent.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{wallet.name} Wallet</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium" style={{ color: wallet.color }}>
                    {wallet.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-gray-900 font-medium">Andrew</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <IoSettingsOutline size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <IoNotificationsOutline size={20} />
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-1">Available Balance</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">₱{totalBalance.toLocaleString()}.00</h2>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Transfer Limit</span>
            <span className="font-medium">₱{transferLimit.toLocaleString()}</span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span>Spent ₱{monthlySpent.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-6">
          <button className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors">
            <IoCardOutline size={20} />
            <span>Pay</span>
          </button>
          <button className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors">
            <IoDownloadOutline size={20} />
            <span>Deposit</span>
          </button>
        </div>
      </div>

      {/* Operations Section */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Operations</h3>
          <button className="text-emerald-600 text-sm font-medium">View All</button>
        </div>

        {/* Today's Transactions */}
        <div className="mb-4">
          <h4 className="text-gray-600 text-sm font-medium mb-3">Today</h4>
          <div className="space-y-3">
            {recentTransactions.slice(0, 2).map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <transaction.icon size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.name}</div>
                    <div className="text-sm text-gray-500">{transaction.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ₱{Math.abs(transaction.amount)}.00
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">{transaction.wallet}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yesterday's Transactions */}
        <div>
          <h4 className="text-gray-600 text-sm font-medium mb-3">Yesterday</h4>
          <div className="space-y-3">
            {recentTransactions.slice(2).map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <transaction.icon size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.name}</div>
                    <div className="text-sm text-gray-500">{transaction.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ₱{Math.abs(transaction.amount)}.00
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">{transaction.wallet}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}