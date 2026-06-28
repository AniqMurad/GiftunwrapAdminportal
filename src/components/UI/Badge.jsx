const VARIANT_CLASS = {
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
  primary: 'badge-primary',
  neutral: 'badge-neutral',
};

export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span className={`badge ${VARIANT_CLASS[variant] || VARIANT_CLASS.neutral} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
}
