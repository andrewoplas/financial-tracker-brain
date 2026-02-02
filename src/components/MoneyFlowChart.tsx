'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getTransactions, Transaction } from '@/lib/supabase'

interface MoneyFlowChartProps {
  period?: 'week' | 'month'
}

interface DayData {
  date: string
  income: number
  expense: number
  net: number
}

export default function MoneyFlowChart({ period = 'month' }: MoneyFlowChartProps) {
  const { user } = useAuth()
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [period])

  const loadChartData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get date range based on period
      const now = new Date()
      const startDate = new Date()
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 6) // Last 7 days
      } else {
        startDate.setDate(now.getDate() - 29) // Last 30 days
      }

      // Fetch transactions for the period
      const transactions = await getTransactions(200) // Get more to ensure we have enough data
      
      // Filter transactions by date range
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= now
      })

      // Group by day and calculate totals
      const dayMap = new Map<string, DayData>()
      
      // Initialize all days in range with zero values
      for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0]
        dayMap.set(dateKey, {
          date: dateKey,
          income: 0,
          expense: 0,
          net: 0
        })
      }

      // Aggregate transaction data
      filteredTransactions.forEach(transaction => {
        const dateKey = transaction.date
        const dayData = dayMap.get(dateKey)
        
        if (dayData) {
          if (transaction.type === 'income') {
            dayData.income += transaction.amount
          } else if (transaction.type === 'expense') {
            dayData.expense += transaction.amount
          }
          dayData.net = dayData.income - dayData.expense
        }
      })

      // Convert to array and sort by date
      const chartData = Array.from(dayMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      setData(chartData)
    } catch (error) {
      console.error('Error loading chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expense, Math.abs(d.net))))
  const chartHeight = 200

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (period === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.getDate().toString()
    }
  }

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `₱${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `₱${(amount / 1000).toFixed(1)}K`
    } else {
      return `₱${amount.toFixed(0)}`
    }
  }

  if (loading) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-gray-500">No transaction data available</p>
          <p className="text-gray-400 text-sm">Start adding transactions to see your money flow</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 relative">
      {/* Chart container */}
      <div className="relative h-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-4 text-xs text-gray-400">
          <span>{formatAmount(maxValue)}</span>
          <span>{formatAmount(maxValue / 2)}</span>
          <span>₱0</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 mr-4 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
              <div
                key={ratio}
                className="absolute w-full border-t border-gray-200"
                style={{ bottom: `${ratio * 100}%` }}
              />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between" style={{ height: chartHeight }}>
            {data.map((dayData, index) => {
              const incomeHeight = maxValue > 0 ? (dayData.income / maxValue) * chartHeight : 0
              const expenseHeight = maxValue > 0 ? (dayData.expense / maxValue) * chartHeight : 0
              
              return (
                <div key={dayData.date} className="flex flex-col items-center space-y-1 flex-1">
                  {/* Bars container */}
                  <div className="relative flex justify-center space-x-1" style={{ height: chartHeight }}>
                    {/* Income bar */}
                    <div
                      className="w-3 bg-green-500 rounded-t"
                      style={{ height: `${incomeHeight}px` }}
                      title={`Income: ${formatAmount(dayData.income)}`}
                    />
                    {/* Expense bar */}
                    <div
                      className="w-3 bg-red-400 rounded-t"
                      style={{ height: `${expenseHeight}px` }}
                      title={`Expense: ${formatAmount(dayData.expense)}`}
                    />
                  </div>
                  
                  {/* Date label */}
                  <span className="text-xs text-gray-500 transform -rotate-45 origin-center">
                    {formatDate(dayData.date)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Income</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span className="text-gray-600">Expenses</span>
        </div>
      </div>
    </div>
  )
}