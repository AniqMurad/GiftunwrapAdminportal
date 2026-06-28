import Spinner from './Spinner';

const VARIANT_CLASS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  'danger-ghost': 'btn-danger-ghost',
  success: 'btn-success',
  link: 'btn-link',
};

export default function Button({
  children,
  variant = 'primary',
  size,
  loading = false,
  disabled = false,
  iconOnly = false,
  icon = null,
  block = false,
  type = 'button',
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;
  const classes = [
    'btn',
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    iconOnly ? 'btn-icon-only' : '',
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size={14} dark={variant === 'secondary' || variant === 'ghost' || variant === 'link'} />
      ) : (
        icon
      )}
      {!iconOnly && children}
    </button>
  );
}
