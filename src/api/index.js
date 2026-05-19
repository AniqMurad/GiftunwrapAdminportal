import axios from 'axios';

const API = axios.create({
  baseURL: 'https://giftunwrapbackend.vercel.app/api',
  // baseURL: 'http://localhost:5000/api',
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

// ✅ Gift Box Item APIs
export const fetchGiftBoxItems = () => API.get('/gift-box-items');
export const createGiftBoxItem = (formData) =>
  API.post('/gift-box-items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateGiftBoxItem = (id, formData) =>
  API.put(`/gift-box-items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteGiftBoxItem = (id) => API.delete(`/gift-box-items/${id}`);
export const toggleGiftBoxItemStock = (id) =>
  API.patch(`/gift-box-items/${id}/toggle-stock`);

// ✅ Box APIs
export const fetchBoxes = () => API.get('/boxes');
export const createBox = (formData) =>
  API.post('/boxes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateBox = (id, formData) =>
  API.put(`/boxes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteBox = (id) => API.delete(`/boxes/${id}`);
export const toggleBoxStock = (id) => API.patch(`/boxes/${id}/toggle-stock`);

// ✅ Card APIs
export const fetchCards = () => API.get('/cards');
export const createCard = (formData) =>
  API.post('/cards', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateCard = (id, formData) =>
  API.put(`/cards/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteCard = (id) => API.delete(`/cards/${id}`);
export const toggleCardStock = (id) => API.patch(`/cards/${id}/toggle-stock`);

// ✅ Quote APIs
export const fetchQuotes = () => API.get('/quotes');
export const fetchQuoteById = (quoteId) => API.get(`/quotes/${quoteId}`);
export const updateQuoteStatus = (quoteId, status) =>
  API.patch(`/quotes/${quoteId}/status`, { status });
export const deleteQuote = (quoteId) => API.delete(`/quotes/${quoteId}`);

// ✅ Blog APIs
export const fetchBlogs = () => API.get('/blogs');
export const fetchBlogsAdmin = () => API.get('/blogs/admin/all');
export const fetchBlogById = (blogId) => API.get(`/blogs/${blogId}`);
export const createBlog = (formData) =>
  API.post('/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateBlog = (id, formData) =>
  API.put(`/blogs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteBlog = (id) => API.delete(`/blogs/${id}`);
export const toggleBlogPublished = (id) =>
  API.patch(`/blogs/${id}/toggle-published`);

export default API;
