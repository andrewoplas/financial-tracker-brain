'use client'

import { 
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoStatsChartOutline
} from 'react-icons/io5'

export default function SpendingAnalysis() {
  const spendingData = [
    {
      category: 'Food & Dining',
      thisMonth: 450,
      lastMonth: 390,
      color: '#F59E0B',
      trend: 'up'
    },
    {
      category: 'Transportation', 
      thisMonth: 280,
      lastMonth: 320,
      color: '#3B82F6',
      trend: 'down'
    },
    {
      category: 'Entertainment',
      thisMonth: 180,
      lastMonth: 150,
      color: '#8B5CF6', 
      trend: 'up'
    },
    {
      category: 'Shopping',
      thisMonth: 320,
      lastMonth: 280,
      color: '#EC4899',
      trend: 'up'
    }
  ]

  const totalThisMonth = spendingData.reduce((sum, item) => sum + item.thisMonth, 0)
  const totalLastMonth = spendingData.reduce((sum, item) => sum + item.lastMonth, 0)
  const overallChange = ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100

  const getPercentageChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="space-y-6">
      {/* Overall Spending Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <IoStatsChartOutline size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Monthly Spending</h3>
              <p className="text-sm text-gray-500">February vs January</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">₱{totalThisMonth.toLocaleString()}</div>
            <div className={`flex items-center space-x-1 text-sm ${
              overallChange >= 0 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {overallChange >= 0 ? (
                <IoTrendingUpOutline size={16} />
              ) : (
                <IoTrendingDownOutline size={16} />
              )}
              <span>{Math.abs(overallChange).toFixed(1)}% vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Analysis</h3>
        <div className="space-y-4">
          {spendingData.map((item, index) => {
            const change = getPercentageChange(item.thisMonth, item.lastMonth)
            return (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div>
                    <div className="font-medium text-gray-900">{item.category}</div>
                    <div className="text-sm text-gray-500">
                      ₱{item.thisMonth} this month
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {((item.thisMonth / totalThisMonth) * 100).toFixed(0)}%
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${
                    change >= 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {change >= 0 ? (
                      <IoTrendingUpOutline size={14} />
                    ) : (
                      <IoTrendingDownOutline size={14} />
                    )}
                    <span>{Math.abs(change).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Smart Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-3">Smart Insights</h4>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="font-medium text-blue-900 text-sm">Dining Out Alert</div>
                <div className="text-blue-800 text-sm">
                  You spent 15% more on Food & Dining this month. Consider cooking at home more often.
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="font-medium text-blue-900 text-sm">Transportation Savings</div>
                <div className="text-blue-800 text-sm">
                  Great job! You saved ₱40 on transportation this month.
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="font-medium text-blue-900 text-sm">Shopping Pattern</div>
                <div className="text-blue-800 text-sm">
                  Your shopping spending increased by 14%. Most purchases were on weekends.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}