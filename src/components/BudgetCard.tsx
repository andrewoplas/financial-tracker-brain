import { IconType } from 'react-icons'

interface BudgetCardProps {
  category: string
  spent: number
  budget: number
  icon: IconType
  color: string
}

export default function BudgetCard({ category, spent, budget, icon: Icon, color }: BudgetCardProps) {
  const percentage = (spent / budget) * 100
  const remaining = budget - spent
  
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500' 
    if (percentage >= 60) return 'bg-orange-500'
    return 'bg-emerald-500'
  }
  
  const getStatusColor = () => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-emerald-600'
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: color + '20' }}
          >
            <Icon size={20} style={{ color: color }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{category}</h3>
            <p className="text-sm text-gray-500">Monthly Budget</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${getStatusColor()}`}>
            ₱{Math.round(percentage)}%
          </div>
        </div>
      </div>

      {/* Budget Amount */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Spent</span>
          <span>Budget</span>
        </div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-2xl font-bold text-gray-900">₱{spent.toLocaleString()}</span>
          <span className="text-lg text-gray-600">/ ₱{budget.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-sm">
        {percentage >= 100 ? (
          <div className="text-red-600 font-medium">
            ⚠️ Over budget by ₱{Math.abs(remaining).toLocaleString()}
          </div>
        ) : (
          <div className="text-gray-600">
            <span className="text-emerald-600 font-medium">₱{remaining.toLocaleString()}</span> remaining
          </div>
        )}
      </div>
    </div>
  )
}