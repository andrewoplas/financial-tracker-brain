'use client'

import { useAuth } from '@/contexts/AuthContext'
import FundeyDesktopDashboard from '@/components/FundeyDesktopDashboard'
import FundeyMobileDashboard from '@/components/FundeyMobileDashboard'
import AuthForm from '@/components/AuthForm'

export default function Home() {
  const { user, loading } = useAuth()

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white mt-2 font-medium">Loading Financial Brain...</p>
        </div>
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm onAuthSuccess={() => window.location.reload()} />
  }

  // Show main app if authenticated
  return (
    <main className="min-h-screen">
      {/* Desktop Dashboard */}
      <div className="hidden lg:block">
        <FundeyDesktopDashboard />
      </div>
      
      {/* Mobile Dashboard */}
      <div className="block lg:hidden">
        <FundeyMobileDashboard />
      </div>
    </main>
  )
}