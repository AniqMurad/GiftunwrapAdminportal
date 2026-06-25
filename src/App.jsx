import { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';

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

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const ADMIN_ID = 'giftunwrapadmin';
  const ADMIN_PASS = '02012025';

  const handleLogin = () => {
    if (id === ADMIN_ID && pass === ADMIN_PASS) {
      setIsAuth(true);
    } else {
      setError('Wrong ID or Password');
    }
  };

  if (!isAuth) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
        }}
      >
        <div
          style={{
            background: '#020617',
            padding: '30px',
            borderRadius: '10px',
            width: '320px',
            boxShadow: '0 0 20px rgba(0,0,0,0.6)',
          }}
        >
          <h3 style={{ color: '#fff', marginBottom: '15px' }}>
            Admin Login
          </h3>

          <input
            placeholder="Admin ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          {error && (
            <div style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '10px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // ✅ NORMAL ADMIN PORTAL
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Suspense fallback={<div style={{ padding: '20px' }}>Loading...</div>}>
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
        </div>
      </div>
    </Router>
  );
}

export default App;
