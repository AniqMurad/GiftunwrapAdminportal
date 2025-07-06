import axios from 'axios';

const API = axios.create({
  baseURL: 'https://giftunwrapbackend.vercel.app/api',
});

// ✅ User APIs
export const fetchUsers = () => API.get('/users/allusers');
export const deleteUserById = (userId) => API.delete(`/users/delete/${userId}`);

// ✅ Message APIs
export const fetchMessages = () => API.get('/messages');
export const deleteMessageById = (messageId) => API.delete(`/messages/${messageId}`);

// ✅ Order APIs
export const fetchOrders = () => API.get('/orders');
export const deleteOrderById = (orderId) => API.delete(`/orders/${orderId}`);
export const updateOrderStatus = (orderId, newStatus) =>
  API.put(`/orders/${orderId}/status`, { status: newStatus });

// ✅ Product APIs
export const fetchProducts = () => API.get('/products');
export const deleteProductById = (productId) => API.delete(`/products/${productId}`);
export const postProduct = (data) =>
  API.post('/products/multipleproductcategory', data);

export default API;
