import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
  { path: '/users', label: 'Users', icon: 'bi-people' },
  { path: '/products', label: 'Products', icon: 'bi-bag' },
  { path: '/post-product', label: 'Post Product', icon: 'bi-plus-square' },
  { path: '/gift-box-items', label: 'Gift Box Items', icon: 'bi-box-seam' },
  { path: '/boxes-and-cards', label: 'Boxes & Cards', icon: 'bi-gift' },
  { path: '/orders', label: 'Orders', icon: 'bi-cart-check' },
  { path: '/quotes', label: 'Quote Requests', icon: 'bi-file-earmark-text' },
  { path: '/blogs', label: 'Blogs', icon: 'bi-journal-text' },
  { path: '/post-blog', label: 'Post Blog', icon: 'bi-pencil-square' },
  { path: '/messages', label: 'Messages', icon: 'bi-chat-dots' },
  { path: '/adminreviews', label: 'Reviews', icon: 'bi-star' },
];

export default function Sidebar({ isOpen = false, onNavigate }) {
  const { pathname } = useLocation();

  return (
    <nav className={`sidebar ${isOpen ? 'is-open' : ''}`} aria-label="Primary">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon" aria-hidden="true">
          <i className="bi bi-gift-fill" />
        </span>
        <span className="sidebar-brand-text">
          GiftUnwrap
          <small>Admin Portal</small>
        </span>
      </div>

      <ul className="sidebar-nav">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={onNavigate}
              className={`sidebar-link ${pathname === item.path ? 'active' : ''}`}
              aria-current={pathname === item.path ? 'page' : undefined}
            >
              <i className={`bi ${item.icon}`} aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">GiftUnwrap Admin &copy; {new Date().getFullYear()}</div>
    </nav>
  );
}

export { menuItems };
