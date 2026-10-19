export default function Empty({ height = 'h-44', text = 'No data for this range' }) {
  return <div className={`grid ${height} place-items-center text-sm text-muted`}>{text}</div>
}
