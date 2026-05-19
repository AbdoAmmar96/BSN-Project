import clsx from 'clsx';

/**
 * Reusable data table for dashboards.
 *
 * Props:
 *   columns: Array<{ key, label, render?: (row) => ReactNode, className?, align? }>
 *   rows:    Array<any>
 *   loading: boolean
 *   onRowClick: (row) => void
 *   empty: ReactNode (shown when no rows)
 */
export default function DataTable({ columns, rows, loading, onRowClick, empty }) {
  if (loading) {
    return (
      <div className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-8 shadow-brutal text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-orange border-t-transparent" />
        <p className="mt-3 font-mono text-sm opacity-60">جاري التحميل...</p>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-12 shadow-brutal text-center">
        {empty || <p className="font-mono text-sm opacity-60">لا توجد بيانات</p>}
      </div>
    );
  }

  return (
    <div className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink shadow-brutal overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-brand-purple-deep text-white">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 font-display font-bold text-xs uppercase tracking-wider',
                    col.align === 'center' && 'text-center',
                    col.align === 'left' && 'text-left',
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'border-b border-brand-ink/5',
                  onRowClick && 'cursor-pointer hover:bg-brand-purple/5 transition'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'px-4 py-3',
                      col.align === 'center' && 'text-center',
                      col.align === 'left' && 'text-left',
                      col.cellClassName
                    )}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
