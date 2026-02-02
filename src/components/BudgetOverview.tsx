'use client'

import BudgetCard from './BudgetCard'
import { 
  IoFastFoodOutline, 
  IoCarOutline, 
  IoFilmOutline, 
  IoStorefrontOutline,
  IoHomeOutline,
  IoSchoolOutline
} from 'react-icons/io5'

export default function BudgetOverview() {
  const budgetData = [
    {
      category: 'Food & Dining',
      spent: 450,
      budget: 500,
      icon: IoFastFoodOutline,
      color: '#F59E0B'
    },
    {
      category: 'Transportation',
      spent: 280,
      budget: 400,
      icon: IoCarOutline,
      color: '#3B82F6'
    },
    {
      category: 'Entertainment',
      spent: 180,
      budget: 200,
      icon: IoFilmOutline,
      color: '#8B5CF6'
    },
    {
      category: 'Shopping',
      spent: 320,
      budget: 250,
      icon: IoStorefrontOutline,
      color: '#EC4899'
    },
    {
      category: 'Utilities',
      spent: 150,
      budget: 300,
      icon: IoHomeOutline,
      color: '#10B981'
    },
    {
      category: 'Education',
      spent: 75,
      budget: 100,
      icon: IoSchoolOutline,
      color: '#06B6D4'
    }
  ]

  const totalSpent = budgetData.reduce((sum, item) => sum + item.spent, 0)
  const totalBudget = budgetData.reduce((sum, item) => sum + item.budget, 0)
  const overallPercentage = (totalSpent / totalBudget) * 100

  return (
    <div className="space-y-6">
      {/* Overall Budget Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Monthly Budget</h2>
            <p className="text-emerald-100">February 2026</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">₱{totalBudget.toLocaleString()}</div>
            <div className="text-emerald-100 text-sm">Total Budget</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold">₱{totalSpent.toLocaleString()}</div>
            <div className="text-emerald-100 text-sm">Total Spent ({Math.round(overallPercentage)}%)</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">₱{(totalBudget - totalSpent).toLocaleString()}</div>
            <div className="text-emerald-100 text-sm">Remaining</div>
          </div>
        </div>

        <div className="w-full bg-emerald-400 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Budget Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Budget Categories</h3>
          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
            Manage Budgets →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetData.map((budget, index) => (
            <BudgetCard key={index} {...budget} />
          ))}
        </div>
      </div>

      {/* Smart Insights */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Smart Insights</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• You're over budget on Shopping by ₱70 this month</p>
              <p>• Great job staying under budget on Food & Dining!</p>
              <p>• You have ₱150 left in your Utilities budget</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}