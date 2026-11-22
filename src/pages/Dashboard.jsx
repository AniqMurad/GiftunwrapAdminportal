import { useEffect, useState } from 'react';
import {
  fetchUsers,
  fetchOrders,
  fetchProducts,
  fetchMessages
} from '../api';
import { PageHeader, Card, Badge, EmptyState, Skeleton, CardListSkeleton, useToast } from '../components/UI';
import './Dashboard.css';

const ORDER_STATUS_VARIANT = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'danger',
};

export default function Dashboard() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const results = await Promise.allSettled([
        fetchUsers(),
        fetchOrders(),
        fetchProducts(),
        fetchMessages(),
      ]);

      if (cancelled) return;

      const [usersRes, ordersRes, productsRes, messagesRes] = results;
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data);
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data);
      if (messagesRes.status === 'fulfilled') setMessages(messagesRes.value.data);

      const failed = results.some((r) => r.status === 'rejected');
      if (failed) toast.error('Some dashboard data failed to load.');

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalProducts = products.reduce((acc, cat) => acc + cat.products.length, 0);

  return (
    <div className="page-shell">
      <PageHeader title="Dashboard Overview" description="A quick look at what's happening across the storefront." />

      <div className="stats-grid">
        <StatCard label="Users" value={users.length} icon="bi-people" loading={loading} />
        <StatCard label="Orders" value={orders.length} icon="bi-box-seam" loading={loading} />
        <StatCard label="Messages" value={messages.length} icon="bi-chat-dots" loading={loading} />
        <StatCard label="Total Products" value={totalProducts} icon="bi-bag" loading={loading} />
      </div>

      <div className="dashboard-section">
        <h3>Recent Orders</h3>
        {loading ? (
          <CardListSkeleton count={3} />
        ) : orders.length === 0 ? (
          <EmptyState icon="bi-box-seam" title="No orders yet" description="New orders will show up here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {orders.slice(0, 5).map(order => (
              <Card key={order._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <p className="dt-row-title" style={{ wordBreak: 'break-all', margin: 0 }}>Order: {order._id}</p>
                  <Badge variant={ORDER_STATUS_VARIANT[order.status] || 'neutral'}>{order.status}</Badge>
                </div>
                <p className="dt-row-subtitle" style={{ marginTop: '0.3rem' }}>{new Date(order.createdAt).toLocaleString()}</p>

                <div className="detail-section">
                  <p className="detail-section-title">Shipping Info</p>
                  <p className="detail-row">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                  <p className="detail-row">{order.shippingAddress?.email} | {order.shippingAddress?.phone}</p>
                  <p className="detail-row">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                  <p className="detail-row">{order.shippingAddress?.country} - {order.shippingAddress?.postalCode}</p>
                  {order.shippingAddress?.additionalInfo && (
                    <p className="detail-row"><em>Note:</em> {order.shippingAddress.additionalInfo}</p>
                  )}
                </div>

                <div className="detail-section">
                  <p className="detail-section-title">Items</p>
                  {order.orderItems?.map(item => (
                    <p className="detail-row" key={item.productId}>
                      <strong>{item.name}</strong> x {item.quantity} — ${item.priceAtTimeOfOrder}
                    </p>
                  ))}
                </div>

                <p className="detail-row" style={{ fontWeight: 700, marginTop: 'var(--space-3)' }}>Total: ${order.totalAmount}</p>
              </Card>
            ))}
          </div>
        )}

        <h3 style={{ marginTop: 'var(--space-7)' }}>Recent Messages</h3>
        {loading ? (
          <CardListSkeleton count={2} />
        ) : messages.length === 0 ? (
          <EmptyState icon="bi-chat-dots" title="No messages yet" description="Contact form submissions will show up here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {messages.slice(0, 5).map(msg => (
              <Card key={msg._id}>
                <p className="dt-row-title" style={{ marginBottom: '0.15rem' }}>{msg.name}</p>
                <p className="dt-row-subtitle" style={{ marginBottom: '0.6rem' }}>{msg.email}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text)' }}>{msg.content}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, loading }) {
  return (
    <Card bodyClassName="stat-card">
      <span className="stat-icon-wrap">
        <i className={`bi ${icon} stat-icon`}></i>
      </span>
      <div>
        <h6>{label}</h6>
        {loading ? <Skeleton width="3rem" height="1.6rem" /> : <h4>{value}</h4>}
      </div>
    </Card>
  );
}
