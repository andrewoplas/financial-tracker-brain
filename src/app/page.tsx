'use client'

import { useAuth } from '@/contexts/AuthContext'
import Dashboard from '@/components/Dashboard'
import MobileDashboard from '@/components/MobileDashboard'
import AuthForm from '@/components/AuthForm'

export default function Home() {
  const { user, loading } = useAuth()

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧠</span>
          </div>
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-emerald-700 mt-2">Loading Financial Brain...</p>
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
    <main className="min-h-screen bg-gray-50">
      {/* Desktop Dashboard */}
      <div className="hidden lg:block">
        <Dashboard />
      </div>
      
      {/* Mobile Dashboard */}
      <div className="block lg:hidden">
        <MobileDashboard />
      </div>
    </main>
  )
}