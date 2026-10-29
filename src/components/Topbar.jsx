import { useLocation } from 'react-router-dom';
import { menuItems } from './Sidebar';
import Button from './UI/Button';

function getPageTitle(pathname) {
  if (pathname.startsWith('/post-blog/')) return 'Edit Blog';
  const exact = menuItems.find((item) => item.path === pathname);
  if (exact) return exact.label;
  const partial = menuItems.find((item) => item.path !== '/' && pathname.startsWith(item.path));
  return partial ? partial.label : 'Admin Portal';
}

export default function Topbar({ onMenuClick, onLogout }) {
  const { pathname } = useLocation();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open navigation menu">
          <i className="bi bi-list" aria-hidden="true" style={{ fontSize: '1.2rem' }} />
        </button>
        <span className="topbar-title">{getPageTitle(pathname)}</span>
      </div>

      <div className="topbar-right">
        <span className="topbar-admin-chip">
          <span className="topbar-admin-avatar">A</span>
          <span>Admin</span>
        </span>
        <Button variant="ghost" size="sm" onClick={onLogout} icon={<i className="bi bi-box-arrow-right" aria-hidden="true" />}>
          Logout
        </Button>
      </div>
    </header>
  );
}
