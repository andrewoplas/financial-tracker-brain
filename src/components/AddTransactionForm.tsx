'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getWallets, getCategories, addTransaction, recalculateWalletBalance, Wallet, Category } from '@/lib/supabase'
import { IoClose, IoWalletOutline, IoCalendarOutline, IoCardOutline } from 'react-icons/io5'

interface AddTransactionFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddTransactionForm({ isOpen, onClose, onSuccess }: AddTransactionFormProps) {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    wallet_id: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense' | 'transfer'
  })

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      const [walletsData, categoriesData] = await Promise.all([
        getWallets(),
        getCategories()
      ])
      setWallets(walletsData)
      setCategories(categoriesData)
      
      // Set default wallet if available
      if (walletsData.length > 0 && !formData.wallet_id) {
        setFormData(prev => ({ ...prev, wallet_id: walletsData[0].id }))
      }
    } catch (error) {
      console.error('Error loading form data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount')
        return
      }

      // Add transaction
      await addTransaction({
        amount: amount,
        description: formData.description,
        date: formData.date,
        wallet_id: formData.wallet_id,
        category_id: formData.category_id || undefined,
        type: formData.type,
        status: 'completed'
      })

      // Recalculate wallet balance from all transactions
      await recalculateWalletBalance(formData.wallet_id)

      // Reset form
      setFormData({
        amount: '',
        description: '',
        wallet_id: wallets[0]?.id || '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Failed to add transaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')
    
    // Ensure only one decimal point
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    
    return numericValue
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'expense':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'transfer':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4">
      <div className="bg-white rounded-t-3xl lg:rounded-2xl w-full max-w-md shadow-xl slide-up transform transition-all duration-300 ease-out max-h-[90vh] overflow-hidden">
        {/* Header with mobile enhancements */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
            <p className="text-gray-500 text-sm">Track your spending and income</p>
          </div>
          <button
            onClick={onClose}
            className="mobile-button p-3 hover:bg-gray-100 rounded-full transition-colors no-tap-highlight"
          >
            <IoClose size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Form with mobile optimizations */}
        <div className="overflow-y-auto scroll-touch max-h-[calc(90vh-140px)] lg:max-h-none">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-24 lg:pb-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Transaction Type
            </label>
            <div className="flex space-x-2">
              {(['expense', 'income', 'transfer'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type }))}
                  className={`mobile-button flex-1 py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-200 no-tap-highlight ${
                    formData.type === type
                      ? `${getTypeColor(type)} shadow-lg scale-105`
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <span className="block">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-3">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">
                ₱
              </span>
              <input
                type="text"
                id="amount"
                required
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  amount: formatAmount(e.target.value) 
                }))}
                className="mobile-input w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-medium no-tap-highlight"
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">Enter the transaction amount</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-3">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mobile-input w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 no-tap-highlight"
              placeholder="What was this transaction for?"
              autoComplete="off"
            />
            <p className="text-gray-500 text-xs mt-2">Brief description of the transaction</p>
          </div>

          {/* Wallet Selection */}
          <div>
            <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 mb-3">
              Wallet <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IoWalletOutline size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                id="wallet"
                required
                value={formData.wallet_id}
                onChange={(e) => setFormData(prev => ({ ...prev, wallet_id: e.target.value }))}
                className="mobile-input w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white no-tap-highlight"
              >
                <option value="">Choose wallet...</option>
                {wallets.map(wallet => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} - ₱{wallet.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-3">
              Category <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <div className="relative">
              <IoCardOutline size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="mobile-input w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white no-tap-highlight"
              >
                <option value="">No category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-3">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IoCalendarOutline size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                id="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mobile-input w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 no-tap-highlight"
              />
            </div>
          </div>

          {/* Submit Buttons - Enhanced for mobile */}
          <div className="sticky bottom-0 bg-white pt-6 pb-2 -mx-6 px-6 border-t border-gray-100 lg:static lg:border-0">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="mobile-button flex-1 py-4 px-6 border-2 border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 transition-all no-tap-highlight"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="mobile-button flex-1 py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl no-tap-highlight"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add Transaction'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}