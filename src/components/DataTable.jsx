import { useState } from 'react'

export default function DataTable({
  columns,
  rows,
  onRowClick,
  pageSize = 8,
  empty = 'Nothing to show for this range'
}) {
  const [limit, setLimit] = useState(pageSize)

  if (!rows.length) {
    return <div className="grid h-28 place-items-center text-sm text-muted">{empty}</div>
  }

  const shown = rows.slice(0, limit)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line">
              {columns.map(c => (
                <th
                  key={c.label}
                  className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted ${
                    c.right ? 'text-right' : 'text-left'
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(row => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-line/60 last:border-0 ${
                  onRowClick ? 'cursor-pointer hover:bg-paper/70' : ''
                }`}
              >
                {columns.map(c => (
                  <td
                    key={c.label}
                    className={`px-3 py-2.5 align-middle ${c.right ? 'text-right tabular-nums' : ''}`}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > pageSize && (
        <div className="flex justify-center gap-4 pt-3 text-xs font-bold">
          {limit < rows.length && (
            <button onClick={() => setLimit(l => l + pageSize)} className="text-brand">
              Show more ({rows.length - limit} left)
            </button>
          )}
          {limit > pageSize && (
            <button onClick={() => setLimit(pageSize)} className="text-muted">
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  )
}
