export default function Spinner({ size = 16, dark = false, className = '' }) {
  return (
    <span
      className={`spinner ${dark ? 'spinner-dark' : ''} ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-hidden="true"
    />
  );
}
