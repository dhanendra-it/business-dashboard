export default function ProgressBar({ value, color = '#14766a', height = 'h-1.5' }) {
  const width = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full overflow-hidden rounded-full bg-line/70 ${height}`}>
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  )
}
