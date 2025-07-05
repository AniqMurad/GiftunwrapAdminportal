import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { pathname } = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/users', label: 'Users' },
    { path: '/products', label: 'Products' },
    { path: '/post-product', label: 'Post Product' },
    { path: '/orders', label: 'Orders' },
    { path: '/messages', label: 'Messages' },
    { path: '/adminreviews', label: 'Reviews' },
  ];

  return (
    <div
      style={{
        width: '240px',
        background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
        padding: '2rem 1.5rem',
        color: '#fff',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2 style={{ marginBottom: '2rem', fontSize: '1.6rem', color: '#fff', fontWeight: 'bold' }}>
        Admin Portal
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <li key={item.path} style={{ marginBottom: '1rem' }}>
            <Link
              to={item.path}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: pathname === item.path ? '#1d4ed8' : '#cbd5e1',
                backgroundColor: pathname === item.path ? '#f8fafc' : 'transparent',
                fontWeight: pathname === item.path ? '600' : '400',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
