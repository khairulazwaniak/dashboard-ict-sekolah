import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout({ children, badgeCounts = {}, alertCount = 0 }) {
  return (
    <div className="min-h-screen font-sans" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar badgeCounts={badgeCounts} />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <TopBar alertCount={alertCount} />
        <main className="flex-1 px-4 lg:px-8 py-6 space-y-5 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
