export default function Card({ children, className = '', bodyClassName = '', noBody = false, ...rest }) {
  return (
    <div className={`ui-card ${className}`} {...rest}>
      {noBody ? children : <div className={`ui-card-body ${bodyClassName}`}>{children}</div>}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`ui-card-header ${className}`}>{children}</div>;
}
