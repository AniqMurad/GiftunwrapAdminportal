import { useEffect, useState } from 'react';
import {
  fetchUsers,
  fetchOrders,
  fetchProducts,
  fetchMessages
} from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchUsers().then(res => setUsers(res.data));
    fetchOrders().then(res => setOrders(res.data));
    fetchProducts().then(res => setProducts(res.data));
    fetchMessages().then(res => setMessages(res.data));
  }, []);

  const totalProducts = products.reduce((acc, cat) => acc + cat.products.length, 0);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard Overview</h2>

      <div className="stats-grid">
        <StatCard label="Users" value={users.length} icon="bi-people" />
        <StatCard label="Orders" value={orders.length} icon="bi-box-seam" />
        <StatCard label="Messages" value={messages.length} icon="bi-chat-dots" />
        <StatCard label="Total Products" value={totalProducts} icon="bi-bag" />
      </div>

      <div className="dashboard-section">
        <h3>Recent Orders</h3>
        {orders.slice(0, 5).map(order => (
          <div key={order._id} className="glass-card">
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            <h5>Shipping Info</h5>
            <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <p>{order.shippingAddress?.email} | {order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
            <p>{order.shippingAddress?.country} - {order.shippingAddress?.postalCode}</p>
            {order.shippingAddress?.additionalInfo && (
              <p><em>Note:</em> {order.shippingAddress.additionalInfo}</p>
            )}

            <h5>Items</h5>
            <ul>
              {order.orderItems?.map(item => (
                <li key={item.productId}>
                  <strong>{item.name}</strong> x {item.quantity} — ${item.priceAtTimeOfOrder}
                </li>
              ))}
            </ul>

            <h5>Total: ${order.totalAmount}</h5>
          </div>
        ))}

        <h3 style={{ marginTop: '40px' }}>Recent Messages</h3>
        {messages.slice(0, 5).map(msg => (
          <div key={msg._id} className="glass-card">
            <p><strong>Name:</strong> {msg.name}</p>
            <p><strong>Email:</strong> {msg.email}</p>
            <p><strong>Message:</strong> {msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card glass-card">
      <i className={`bi ${icon} stat-icon`}></i>
      <div>
        <h6>{label}</h6>
        <h4>{value}</h4>
      </div>
    </div>
  );
}
