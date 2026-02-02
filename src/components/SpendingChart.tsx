'use client'

interface WalletData {
  name: string
  balance: number
  spent: number
  color: string
  percentage: number
}

interface SpendingChartProps {
  walletData: WalletData[]
  totalSpent: number
}

export default function SpendingChart({ walletData, totalSpent }: SpendingChartProps) {
  const size = 200
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  
  let accumulatedPercentage = 0

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex flex-col items-center">
        {/* SVG Circular Chart */}
        <div className="relative mb-6">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />
            
            {/* Spending segments */}
            {walletData.map((wallet, index) => {
              const percentage = wallet.percentage
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -((accumulatedPercentage / 100) * circumference)
              
              const segment = (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={wallet.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )
              
              accumulatedPercentage += percentage
              return segment
            })}
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-gray-600 text-sm mb-1">Spent this February</p>
            <h3 className="text-2xl font-bold text-gray-900">₱{totalSpent.toLocaleString()}</h3>
          </div>
          
          {/* Percentage labels around the circle */}
          {walletData.map((wallet, index) => {
            let currentPercentage = 0
            for (let i = 0; i < index; i++) {
              currentPercentage += walletData[i].percentage
            }
            currentPercentage += wallet.percentage / 2 // Position at middle of segment
            
            const angle = (currentPercentage / 100) * 360 - 90 // -90 to start from top
            const labelRadius = radius + 35
            const x = size / 2 + labelRadius * Math.cos((angle * Math.PI) / 180)
            const y = size / 2 + labelRadius * Math.sin((angle * Math.PI) / 180)
            
            return (
              <div
                key={index}
                className="absolute text-xs font-semibold"
                style={{
                  left: x - 15,
                  top: y - 10,
                  color: wallet.color,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {wallet.percentage}%
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4">
          {walletData.map((wallet, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: wallet.color }}
              ></div>
              <span className="text-sm text-gray-600 font-medium">{wallet.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}