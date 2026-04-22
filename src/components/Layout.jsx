import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout({ children, badgeCounts = {}, alertCount = 0 }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <Sidebar badgeCounts={badgeCounts} />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopBar alertCount={alertCount} />
        <main className="flex-1 px-4 lg:px-8 py-6 space-y-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
