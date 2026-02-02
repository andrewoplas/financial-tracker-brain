import Dashboard from '@/components/Dashboard'
import MobileDashboard from '@/components/MobileDashboard'

export default function Home() {
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