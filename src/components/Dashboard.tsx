'use client'

import { useState } from 'react'
import WalletCard from './WalletCard'
import TransactionTable from './TransactionTable'
import Sidebar from './Sidebar'
import BudgetOverview from './BudgetOverview'
import SpendingAnalysis from './SpendingAnalysis'
import UserMenu from './UserMenu'

export default function Dashboard() {
  const [totalBalance] = useState(74503)
  const [monthlyIncome] = useState(101333)

  const walletData = [
    { name: 'Life Wallet', balance: 35000, color: 'bg-emerald-500', percentage: 65 },
    { name: 'Growth Wallet', balance: 25000, color: 'bg-emerald-400', percentage: 78 },
    { name: 'Fun Wallet', balance: 14503, color: 'bg-emerald-300', percentage: 42 },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Keep Track, Assess, and Enhance Your Financial Performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5H9l5-5z" />
              </svg>
            </button>
            <UserMenu />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total balance</h3>
            <div className="text-3xl font-bold text-gray-900">₱{totalBalance.toLocaleString()}.00</div>
            <div className="flex items-center mt-2">
              <span className="text-emerald-500 text-sm">+₱14,583.00</span>
              <span className="text-gray-400 text-sm ml-2">Total earned last mo</span>
            </div>
          </div>

          {/* Monthly Income */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-600 text-sm font-medium mb-2">My Income</h3>
            <div className="text-3xl font-bold text-gray-900">₱{monthlyIncome.toLocaleString()}.00</div>
            <div className="flex items-center mt-2">
              <span className="text-emerald-500 text-sm">Min +3.8% APR</span>
              <span className="text-gray-400 text-sm ml-2">Earned +₱5500.00</span>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm col-span-2">
            <h3 className="text-gray-600 text-sm font-medium mb-2">February 2026</h3>
            <div className="text-3xl font-bold text-gray-900">₱26,830.00</div>
            <p className="text-gray-600 text-sm mt-1">Total expense</p>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Min: ₱26,830.00</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-300 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Earned: +₱5500.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {walletData.map((wallet, index) => (
            <WalletCard key={index} {...wallet} />
          ))}
        </div>

        {/* Budget Overview */}
        <div className="mb-8">
          <BudgetOverview />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Spending Analysis */}
          <div className="lg:col-span-1">
            <SpendingAnalysis />
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    All Transactions →
                  </button>
                </div>
              </div>
              <TransactionTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}