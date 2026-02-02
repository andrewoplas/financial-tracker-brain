'use client'

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'insights', label: 'Insights', icon: '📊' },
    { id: 'wallet', label: 'Wallet', icon: '💳' },
    { id: 'more', label: 'More', icon: '⚙️' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 safe-area-bottom">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-2 px-3 min-w-0 transition-colors ${
              activeTab === tab.id 
                ? 'text-emerald-600' 
                : 'text-gray-500'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Home Indicator */}
      <div className="flex justify-center mt-1">
        <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
      </div>
    </div>
  )
}