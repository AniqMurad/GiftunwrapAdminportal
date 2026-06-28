let uid = 0;
const nextId = () => `field-${(uid += 1)}`;

export function Field({ label, required, help, error, children, htmlFor, className = '' }) {
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="field-error">
          <i className="bi bi-exclamation-circle" aria-hidden="true" /> {error}
        </span>
      ) : (
        help && <span className="field-help">{help}</span>
      )}
    </div>
  );
}

export function Input({ id, label, required, help, error, className = '', ...rest }) {
  const inputId = id || (label ? nextId() : undefined);
  return (
    <Field label={label} required={required} help={help} error={error} htmlFor={inputId}>
      <input id={inputId} className={`input ${className}`} {...rest} />
    </Field>
  );
}

export function Textarea({ id, label, required, help, error, className = '', ...rest }) {
  const inputId = id || (label ? nextId() : undefined);
  return (
    <Field label={label} required={required} help={help} error={error} htmlFor={inputId}>
      <textarea id={inputId} className={`textarea ${className}`} {...rest} />
    </Field>
  );
}

export function Select({ id, label, required, help, error, className = '', children, ...rest }) {
  const inputId = id || (label ? nextId() : undefined);
  return (
    <Field label={label} required={required} help={help} error={error} htmlFor={inputId}>
      <select id={inputId} className={`select ${className}`} {...rest}>
        {children}
      </select>
    </Field>
  );
}
