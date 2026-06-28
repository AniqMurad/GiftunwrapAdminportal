import { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { ToastProvider, ConfirmProvider, Button, Input } from './components/UI';
//comment
const Users = lazy(() => import('./pages/Users'));
const Products = lazy(() => import('./pages/Products'));
const PostProduct = lazy(() => import('./pages/PostProduct'));
const Orders = lazy(() => import('./pages/Orders'));
const Messages = lazy(() => import('./pages/Messages'));
const AdminReviews = lazy(() => import('./components/AdminReviews'));
const GiftBoxItems = lazy(() => import('./pages/GiftBoxItems'));
const BoxesAndCards = lazy(() => import('./pages/BoxesAndCards'));
const Quotes = lazy(() => import('./pages/Quotes'));
const Blogs = lazy(() => import('./pages/Blogs'));
const PostBlog = lazy(() => import('./pages/PostBlog'));

const ADMIN_ID = 'giftunwrapadmin';
const ADMIN_PASS = '02012025';

function LoginScreen({ onLogin }) {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (id === ADMIN_ID && pass === ADMIN_PASS) {
      onLogin();
    } else {
      setError('Wrong ID or Password');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-icon">
          <i className="bi bi-gift-fill" aria-hidden="true" />
        </div>
        <h3 className="login-title">Admin Login</h3>
        <p className="login-subtitle">Sign in to manage GiftUnwrap</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" role="alert">
              <i className="bi bi-exclamation-circle" aria-hidden="true" />
              {error}
            </div>
          )}

          <Input
            label="Admin ID"
            placeholder="Enter admin ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
            autoFocus
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
          />

          <Button type="submit" block style={{ marginTop: '0.5rem' }}>
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

function AdminPortalLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app-shell">
        <Sidebar isOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <div className={`sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)} />

        <div className="app-main">
          <Topbar onMenuClick={() => setSidebarOpen(true)} onLogout={onLogout} />

          <main className="app-content">
            <Suspense
              fallback={
                <div className="page-loader">
                  <span className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
                  Loading page...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/products" element={<Products />} />
                <Route path="/post-product" element={<PostProduct />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/quotes" element={<Quotes />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/post-blog" element={<PostBlog />} />
                <Route path="/post-blog/:id" element={<PostBlog />} />
                <Route path="/adminreviews" element={<AdminReviews />} />
                <Route path="/gift-box-items" element={<GiftBoxItems />} />
                <Route path="/boxes-and-cards" element={<BoxesAndCards />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <ToastProvider>
      <ConfirmProvider>
        {isAuth ? (
          <AdminPortalLayout onLogout={() => setIsAuth(false)} />
        ) : (
          <LoginScreen onLogin={() => setIsAuth(true)} />
        )}
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;

/* push for live 28 june sunday */
