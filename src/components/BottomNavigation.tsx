'use client'

import { 
  IoHomeOutline, 
  IoHome, 
  IoStatsChartOutline, 
  IoStatsChart, 
  IoWalletOutline, 
  IoWallet, 
  IoEllipsisHorizontalOutline,
  IoEllipsisHorizontal
} from 'react-icons/io5'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: IoHomeOutline, 
      activeIcon: IoHome 
    },
    { 
      id: 'insights', 
      label: 'Insights', 
      icon: IoStatsChartOutline, 
      activeIcon: IoStatsChart 
    },
    { 
      id: 'wallet', 
      label: 'Wallet', 
      icon: IoWalletOutline, 
      activeIcon: IoWallet 
    },
    { 
      id: 'more', 
      label: 'More', 
      icon: IoEllipsisHorizontalOutline, 
      activeIcon: IoEllipsisHorizontal 
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const IconComponent = activeTab === tab.id ? tab.activeIcon : tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`mobile-button flex flex-col items-center py-3 px-4 min-w-0 transition-all duration-200 rounded-2xl hover:bg-gray-50 no-tap-highlight ${
                activeTab === tab.id 
                  ? 'text-emerald-600 scale-105' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`mb-1 transition-transform duration-200 ${
                activeTab === tab.id ? 'scale-110' : ''
              }`}>
                <IconComponent size={20} />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
      
      {/* Home Indicator */}
      <div className="flex justify-center mt-2 pb-1">
        <div className="w-32 h-1 bg-gray-900 rounded-full opacity-30"></div>
      </div>
    </div>
  )
}