export default function PageHeader({ title, description, actions = null }) {
  return (
    <div className="page-header">
      <div className="page-header-titles">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
