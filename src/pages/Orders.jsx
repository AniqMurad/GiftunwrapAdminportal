import { useEffect, useState } from 'react';
import { fetchOrders, deleteOrderById, updateOrderStatus } from '../api';
import {
  PageHeader,
  EmptyState,
  CardListSkeleton,
  Pagination,
  usePagination,
  Button,
  Card,
  Badge,
  useToast,
  useConfirm,
} from '../components/UI';

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

const STATUS_VARIANT = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'danger',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchOrders();
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { page, setPage, totalPages, pageItems } = usePagination(orders, 6);

  const handleDelete = async (orderId) => {
    const ok = await confirm({
      title: 'Delete order?',
      message: 'This will permanently remove this order from the system.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    setDeletingId(orderId);
    try {
      await deleteOrderById(orderId);
      setOrders(orders.filter((order) => order._id !== orderId));
      toast.success('Order deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete order.');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((order) => (order._id === orderId ? updatedOrder.data : order)));
      toast.success(`Order status updated to ${newStatus}.`);
    } catch (err) {
      toast.error('Failed to update order status.');
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader title="All Orders" description="Customer orders placed on the storefront." />

      {error ? (
        <div className="alert-banner alert-banner-danger">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          {error}
        </div>
      ) : loading ? (
        <CardListSkeleton count={3} />
      ) : orders.length === 0 ? (
        <EmptyState icon="bi-cart-x" title="No orders found" description="Orders placed by customers will appear here." />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {pageItems.map((order) => (
              <Card key={order._id} style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <p className="dt-row-title" style={{ wordBreak: 'break-all' }}>Order ID: {order._id}</p>
                    <p className="dt-row-subtitle">User ID: {order.user || 'N/A'}</p>
                  </div>
                  <Button
                    variant="danger-ghost"
                    size="sm"
                    loading={deletingId === order._id}
                    onClick={() => handleDelete(order._id)}
                    icon={<i className="bi bi-trash3" aria-hidden="true" />}
                  >
                    Delete
                  </Button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <Badge variant={STATUS_VARIANT[order.status] || 'neutral'}>{order.status}</Badge>
                  <select
                    className="select"
                    style={{ width: 'auto', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    aria-label={`Change status for order ${order._id}`}
                  >
                    {orderStatuses.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                      </option>
                    ))}
                  </select>
                  {updatingId === order._id && <span className="spinner spinner-dark" style={{ width: 14, height: 14 }} />}
                  <span className="dt-row-subtitle" style={{ marginLeft: 'auto' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <hr className="section-divider" />

                <div className="detail-section">
                  <p className="detail-section-title">Shipping Info</p>
                  <p className="detail-row">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                  <p className="detail-row">{order.shippingAddress?.email} | {order.shippingAddress?.phone}</p>
                  <p className="detail-row">
                    {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country} - {order.shippingAddress?.postalCode}
                  </p>
                  {order.shippingAddress?.additionalInfo && (
                    <p className="detail-row"><em>Note:</em> {order.shippingAddress.additionalInfo}</p>
                  )}
                </div>

                <div className="detail-section">
                  <p className="detail-section-title">Payment</p>
                  <p className="detail-row"><strong>Method:</strong> {order.paymentDetails?.method}</p>
                  {order.paymentDetails?.method === 'creditCard' && (
                    <p className="detail-row"><strong>Card Name:</strong> {order.paymentDetails.cardName}</p>
                  )}
                  <p className="detail-row"><strong>Save Card:</strong> {order.paymentDetails?.saveCardDetails ? 'Yes' : 'No'}</p>
                </div>

                <div className="detail-section">
                  <p className="detail-section-title">Order Items</p>

                  {order.isGiftBox && (
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                      <div className="alert-banner alert-banner-info" style={{ marginBottom: 'var(--space-3)' }}>
                        <i className="bi bi-gift" aria-hidden="true" />
                        Build-a-Box Gift Order
                      </div>

                      {order.selectedBox && (
                        <div className="mini-card">
                          <div className="mini-card-header">Gift Box</div>
                          <div className="mini-card-body">
                            {order.selectedBox.image && (
                              <img src={order.selectedBox.image} alt={order.selectedBox.name} className="mini-card-img" />
                            )}
                            <div>
                              <p className="detail-row"><strong>Name:</strong> {order.selectedBox.name}</p>
                              <p className="detail-row"><strong>Size:</strong> {order.selectedBox.size}</p>
                              <p className="detail-row"><strong>Price:</strong> ${order.selectedBox.price?.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {order.selectedCard && (
                        <div className="mini-card">
                          <div className="mini-card-header">Greeting Card</div>
                          <div className="mini-card-body">
                            {order.selectedCard.image && (
                              <img src={order.selectedCard.image} alt={order.selectedCard.name} className="mini-card-img" />
                            )}
                            <div>
                              <p className="detail-row"><strong>Name:</strong> {order.selectedCard.name}</p>
                              <p className="detail-row"><strong>Design:</strong> {order.selectedCard.design}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {order.cardMessage && (
                        <div className="mini-card">
                          <div className="mini-card-header">Card Message</div>
                          <div className="mini-card-body">
                            <p className="detail-row" style={{ fontStyle: 'italic' }}>&ldquo;{order.cardMessage}&rdquo;</p>
                          </div>
                        </div>
                      )}

                      <p className="detail-section-title" style={{ marginTop: 'var(--space-3)' }}>Gift Items</p>
                    </div>
                  )}

                  <div>
                    {order.orderItems?.map((item, index) => (
                      <div key={item.productId || index} className="order-item-row">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="order-item-thumb" />}
                        <span className="detail-row" style={{ margin: 0 }}>
                          <strong>{item.name}</strong> x {item.quantity} — ${item.priceAtTimeOfOrder}{' '}
                          <span style={{ color: 'var(--color-text-subtle)' }}>({item.productCategory})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="section-divider" />

                <div className="detail-section" style={{ marginTop: 0 }}>
                  <p className="detail-section-title">Summary</p>
                  <p className="detail-row"><strong>Subtotal:</strong> ${order.subtotal}</p>
                  <p className="detail-row"><strong>Shipping:</strong> ${order.shippingCost}</p>
                  <p className="detail-row"><strong>Discount:</strong> ${order.discountAmount}</p>
                  <p className="detail-row" style={{ fontWeight: 700 }}><strong>Total:</strong> ${order.totalAmount}</p>
                </div>
              </Card>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={orders.length} pageSize={6} />
        </>
      )}
    </div>
  );
}
