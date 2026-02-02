'use client'

import { 
  IoCardOutline, 
  IoPhonePortraitOutline, 
  IoBuildOutline,
  IoFastFoodOutline,
  IoCarOutline,
  IoFilmOutline,
  IoCashOutline
} from 'react-icons/io5'

export default function TransactionTable() {
  const transactions = [
    {
      id: 1,
      name: 'McDonald\'s',
      category: 'Food & Drinks',
      date: 'Feb 02, 2026 - 11:00 AM',
      amount: -245,
      status: 'Completed',
      type: 'Credit Card',
      wallet: 'Fun',
      icon: IoFastFoodOutline
    },
    {
      id: 2,
      name: 'Angkas Premium',
      category: 'Transportation',
      date: 'Feb 01, 2026 - 09:58 PM',
      amount: -150,
      status: 'Pending',
      type: 'E-wallet',
      wallet: 'Life',
      icon: IoCarOutline
    },
    {
      id: 3,
      name: 'Netflix',
      category: 'Entertainment',
      date: 'Feb 01, 2026 - 03:11 AM',
      amount: -549,
      status: 'Completed',
      type: 'Credit Card',
      wallet: 'Fun',
      icon: IoFilmOutline
    },
    {
      id: 4,
      name: 'Salary Transfer',
      category: 'Income',
      date: 'Jan 31, 2026 - 09:00 AM',
      amount: 65000,
      status: 'Completed',
      type: 'Bank Transfer',
      wallet: 'Life',
      icon: IoCashOutline
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'Credit Card': return IoCardOutline
      case 'Bank Transfer': return IoBuildOutline
      case 'E-wallet': return IoPhonePortraitOutline
      default: return IoCashOutline
    }
  }

  const getWalletColor = (wallet: string) => {
    switch (wallet) {
      case 'Life': return 'bg-emerald-100 text-emerald-800'
      case 'Growth': return 'bg-blue-100 text-blue-800'
      case 'Fun': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200">
          <tr className="text-left">
            <th className="pb-4 pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Name ↓
            </th>
            <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Date ↓
            </th>
            <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Transaction ↓
            </th>
            <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Amount ↓
            </th>
            <th className="pb-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status ↓
            </th>
            <th className="pb-4 pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 pl-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <transaction.icon size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.name}</div>
                    <div className="text-sm text-gray-500">{transaction.category}</div>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div className="text-sm text-gray-900">{transaction.date}</div>
              </td>
              <td className="py-4">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getWalletColor(transaction.wallet)}`}>
                    {transaction.wallet}
                  </span>
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const PaymentIcon = getPaymentIcon(transaction.type)
                      return <PaymentIcon size={14} className="text-gray-400" />
                    })()}
                    <span className="text-sm text-gray-500">{transaction.type}</span>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div className={`font-semibold ${transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}₱{Math.abs(transaction.amount).toLocaleString()}.00
                </div>
              </td>
              <td className="py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </td>
              <td className="py-4 pr-6">
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="text-lg">⚪</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}