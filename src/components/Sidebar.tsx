'use client'

import { useState } from 'react'

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState('dashboard')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'wallets', label: 'Wallets', icon: '💳', badge: '3' },
    { id: 'transactions', label: 'Transactions', icon: '💸' },
    { id: 'analytics', label: 'Analytics', icon: '📈', badge: '2' },
    { id: 'history', label: 'History', icon: '📜', badge: '8' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', badge: '4' },
  ]

  const tools = [
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help Center', icon: '❓' },
  ]

  return (
    <div className="w-64 bg-white shadow-sm h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🧠</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Financial Brain</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <span className="absolute left-2.5 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">MENU</h3>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeItem === item.id
                    ? 'bg-emerald-50 text-emerald-600 border-r-2 border-emerald-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeItem === item.id 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tools Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">TOOLS</h3>
          <nav className="space-y-1">
            {tools.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeItem === item.id
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Upgrade Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm">⚡</span>
            <span className="text-sm font-semibold">Upgrade Pro</span>
          </div>
          <p className="text-xs text-emerald-100 mb-3">
            Get enhanced functionality with better organization
          </p>
          <button className="w-full bg-white text-emerald-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors">
            🆙 Upgrade
          </button>
        </div>
      </div>
    </div>
  )
}