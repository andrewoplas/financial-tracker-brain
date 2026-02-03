import { IoHomeOutline, IoTrendingUpOutline, IoGameControllerOutline } from 'react-icons/io5'

interface WalletCardProps {
  name: string
  balance: number
  color: string
  percentage: number
}

const getWalletIcon = (walletName: string) => {
  if (walletName.includes('Life')) return IoHomeOutline
  if (walletName.includes('Growth')) return IoTrendingUpOutline
  if (walletName.includes('Fun')) return IoGameControllerOutline
  return IoHomeOutline
}

export default function WalletCard({ name, balance, color, percentage }: WalletCardProps) {
  return (
    <div className="mobile-card bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 active:scale-[0.98] no-tap-highlight">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 font-semibold">{name}</h3>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          {(() => {
            const IconComponent = getWalletIcon(name)
            return <IconComponent size={24} className="text-white" />
          })()}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          ₱{balance.toLocaleString()}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-emerald-600">{percentage}%</span>
          <span className="text-sm text-gray-500">of budget used</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button className="mobile-button flex-1 bg-emerald-50 text-emerald-600 py-3 px-4 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-all shadow-sm hover:shadow-md no-tap-highlight">
          Add Money
        </button>
        <button className="mobile-button flex-1 bg-gray-50 text-gray-600 py-3 px-4 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all shadow-sm hover:shadow-md no-tap-highlight">
          Transfer
        </button>
      </div>
    </div>
  )
}