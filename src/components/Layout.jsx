import TopBar from './TopBar'

export default function Layout({ children, badgeCounts = {}, alertCount = 0 }) {
  return (
    <div className="min-h-screen text-white font-sans" style={{ background: 'var(--bg-primary)' }}>
      <TopBar badgeCounts={badgeCounts} alertCount={alertCount} />
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {children}
      </main>
    </div>
  )
}
