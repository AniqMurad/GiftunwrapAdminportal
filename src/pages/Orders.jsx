import { useEffect, useState } from 'react';
import { fetchOrders, deleteOrderById, updateOrderStatus } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']; // Define possible statuses

  useEffect(() => {
    fetchOrders().then(res => setOrders(res.data));
  }, []);

  const handleDelete = async (orderId) => {
    const confirmed = window.confirm('Are you sure you want to delete this order?');
    if (!confirmed) return;

    try {
      await deleteOrderById(orderId);
      setOrders(orders.filter(order => order._id !== orderId));
      alert('Order deleted successfully.');
    } catch (error) {
      alert('Failed to delete order.');
      console.error(error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      // Update the orders state with the modified order
      setOrders(orders.map(order =>
        order._id === orderId ? updatedOrder.data : order
      ));
      alert(`Order ${orderId} status updated to ${newStatus}.`);
    } catch (error) {
      alert('Failed to update order status.');
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Orders</h2>

      {orders.length === 0 ? (
        <div className="alert alert-info">No orders found.</div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="card shadow-sm mb-4 border-start border-primary border-5"
            style={{ position: 'relative' }}
          >
            <div className="card-body">
              <button
                onClick={() => handleDelete(order._id)}
                className="btn btn-danger position-absolute"
                style={{ top: '15px', right: '15px' }}
              >
                Delete
              </button>

              <h5 className="card-title mb-2">Order ID: {order._id}</h5>
              <p><strong>User ID:</strong> {order.user || 'N/A'}</p>
              <p className="text-muted mb-2"><strong>Status:</strong> {order.status}
                <select
                  className="form-select form-select-sm d-inline-block ms-2"
                  style={{ width: 'auto' }}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  {orderStatuses.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                    </option>
                  ))}
                </select>
              </p>
              <p><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</p>

              <hr />

              <h6>Shipping Info</h6>
              <p className="mb-1">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
              <p className="mb-1">{order.shippingAddress?.email} | {order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country} - {order.shippingAddress?.postalCode}</p>
              {order.shippingAddress?.additionalInfo && (
                <p><em>Note:</em> {order.shippingAddress.additionalInfo}</p>
              )}

              <hr />

              <h6>Payment</h6>
              <p><strong>Method:</strong> {order.paymentDetails?.method}</p>
              {order.paymentDetails?.method === 'creditCard' && (
                <p><strong>Card Name:</strong> {order.paymentDetails.cardName}</p>
              )}
              <p><strong>Save Card:</strong> {order.paymentDetails?.saveCardDetails ? 'Yes' : 'No'}</p>

              <hr />

              <h6>Order Items</h6>
              <ul className="mb-3 ps-3">
                {order.orderItems?.map(item => (
                  <li key={item.productId}>
                    <strong>{item.name}</strong> x {item.quantity} — ${item.priceAtTimeOfOrder} ({item.productCategory})
                  </li>
                ))}
              </ul>

              <hr />

              <h6>Summary</h6>
              <p><strong>Subtotal:</strong> ${order.subtotal}</p>
              <p><strong>Shipping:</strong> ${order.shippingCost}</p>
              <p><strong>Discount:</strong> ${order.discountAmount}</p>
              <p><strong>Total:</strong> <span className="fw-bold">${order.totalAmount}</span></p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
