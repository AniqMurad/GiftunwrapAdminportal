export default function EmptyState({ icon = 'bi-inbox', title = 'Nothing here yet', description, action = null }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon} empty-state-icon`} aria-hidden="true" />
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
