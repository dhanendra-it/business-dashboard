export default function TwoLine({ main, sub }) {
  return (
    <div>
      <div className="font-semibold leading-tight">{main}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  )
}
