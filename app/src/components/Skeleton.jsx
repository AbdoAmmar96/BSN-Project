import RawSkeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const baseColor = 'rgba(15, 8, 48, 0.08)';
const highlightColor = 'rgba(15, 8, 48, 0.16)';

export function Skeleton(props) {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <RawSkeleton borderRadius={10} {...props} />
    </SkeletonTheme>
  );
}

/** Card skeleton — title, lines, meta */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card">
      <Skeleton height={20} width="55%" className="mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={`${90 - i * 10}%`} className="mb-2" />
      ))}
      <div className="flex gap-2 mt-3">
        <Skeleton height={26} width={70} borderRadius={100} />
        <Skeleton height={26} width={90} borderRadius={100} />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6, cols = 3 }) {
  const gridCols = cols === 4 ? 'lg:grid-cols-4' : cols === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';
  return (
    <div className={`grid sm:grid-cols-2 ${gridCols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Table-row skeleton — for lists with row layout */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="bg-brand-ink/5 px-4 py-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={14} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-4 py-3 border-t border-brand-ink/5 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} height={14} width={`${50 + Math.random() * 40}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Simple inline loader for small areas (button area, etc.) */
export function InlineSkeleton({ width = 100, height = 14 }) {
  return <Skeleton width={width} height={height} />;
}
