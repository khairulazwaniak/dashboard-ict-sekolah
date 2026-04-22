export default function SectionHeader({ icon, title, color = 'text-white', onMore }) {
  return (
    <div className="flex items-center justify-between">
      <div className={`flex items-center gap-2 text-sm font-bold ${color}`}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      {onMore && (
        <button
          onClick={onMore}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors font-medium"
        >
          Lihat semua →
        </button>
      )}
    </div>
  )
}
