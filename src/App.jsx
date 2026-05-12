import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import PostProduct from './pages/PostProduct';
import Orders from './pages/Orders';
import Messages from './pages/Messages';
import Sidebar from './components/Sidebar';
import AdminReviews from './components/AdminReviews';
import GiftBoxItems from './pages/GiftBoxItems';
import BoxesAndCards from './pages/BoxesAndCards';
import Quotes from './pages/Quotes';

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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/products" element={<Products />} />
            <Route path="/post-product" element={<PostProduct />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/adminreviews" element={<AdminReviews />} />
            <Route path="/gift-box-items" element={<GiftBoxItems />} />
            <Route path="/boxes-and-cards" element={<BoxesAndCards />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
