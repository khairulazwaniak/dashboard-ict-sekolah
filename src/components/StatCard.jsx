export default function StatCard({ num, label, icon, color = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-600 transition-colors">
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-3xl font-black ${color}`}>{num ?? '—'}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  )
}
