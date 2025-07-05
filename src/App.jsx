import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import PostProduct from './pages/PostProduct';
import Orders from './pages/Orders';
import Messages from './pages/Messages';
import Sidebar from './components/Sidebar';
import AdminReviews from './components/AdminReviews';

function App() {
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
            <Route path="/messages" element={<Messages />} />
            <Route path="/adminreviews" element={<AdminReviews />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
