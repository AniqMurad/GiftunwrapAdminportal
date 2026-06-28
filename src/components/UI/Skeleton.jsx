export default function Skeleton({ width = '100%', height = '1rem', radius, className = '', style = {} }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="dt-skeleton-row">
          {Array.from({ length: columns }).map((__, c) => (
            <td key={c}>
              <Skeleton height="0.9rem" width={c === 0 ? '70%' : '50%'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardListSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ui-card ui-card-body">
          <Skeleton height="1.1rem" width="40%" style={{ marginBottom: '0.6rem' }} />
          <Skeleton height="0.85rem" width="80%" style={{ marginBottom: '0.4rem' }} />
          <Skeleton height="0.85rem" width="60%" />
        </div>
      ))}
    </div>
  );
}
