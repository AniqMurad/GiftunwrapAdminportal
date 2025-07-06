// Frontend: src/pages/Products.js (or wherever your Products component is)
import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Ensure axios is imported for direct calls or your api.js handles it

const fetchProducts = () => axios.get('https://giftunwrapbackend.vercel.app/api/products');
const deleteProductById = (productId) => axios.delete(`https://giftunwrapbackend.vercel.app/api/products/${productId}`);


export default function Products() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchProducts();
        setCategories(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      await deleteProductById(productId);
      // Update state to remove the deleted product
      setCategories(prevCategories =>
        prevCategories.map(cat => ({
          ...cat,
          products: cat.products.filter(p => p._id !== productId)
        }))
      );
      alert('Product deleted successfully.');
    } catch (error) {
      alert('Failed to delete product.');
      console.error(error.response?.data || error.message || error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>;
  }

  if (categories.length === 0 || categories.every(cat => cat.products.length === 0)) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No products found in any category.</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>All Products</h2>

      {categories.map(cat => (
        <div key={cat._id} style={{ marginBottom: '2rem' }}>
          <h3 style={{ textTransform: 'capitalize', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#555' }}>
            {cat.category}
          </h3>

          <table
            border="1"
            cellPadding="8"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflow: 'hidden' // Ensures border radius is applied
            }}
          >
            <thead style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Name</th>
                <th style={{ textAlign: 'right', padding: '10px 8px' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>KeyGift</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Reviews</th> {/* NEW COLUMN */}
                <th style={{ textAlign: 'center', padding: '10px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cat.products.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>No products in this category.</td>
                </tr>
              ) : (
                cat.products.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>{p.name}</td>
                    <td style={{ textAlign: 'right', padding: '10px 8px', verticalAlign: 'top' }}>${p.price}</td>
                    <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>{p.keyGift}</td>
                    <td style={{ padding: '10px 8px', verticalAlign: 'top' }}> {/* Review Column */}
                      {p.reviews && p.reviews.length > 0 ? (
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                          {p.reviews.map((review, index) => (
                            <li key={review._id || index} style={{
                              marginBottom: '8px',
                              paddingBottom: '8px',
                              borderBottom: index < p.reviews.length - 1 ? '1px dotted #e0e0e0' : 'none', // Add dotted line between reviews
                              fontSize: '0.9em'
                            }}>
                              <strong>Rating:</strong> {review.rating} ⭐<br />
                              <strong>Comment:</strong> {review.comment}<br />
                              {review.userId && review.userId.name && ( // Access populated user data
                                <span><strong>By:</strong> {review.userId.name} ({review.userId.email})<br /></span>
                              )}
                              {review.createdAt && (
                                <span style={{ color: '#999' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: '#888' }}>No reviews yet.</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 8px', verticalAlign: 'top' }}>
                      <button
                        onClick={() => handleDelete(p._id)}
                        style={{
                          backgroundColor: '#d32f2f',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 15px',
                          cursor: 'pointer',
                          borderRadius: '5px',
                          transition: 'background-color 0.3s ease',
                          whiteSpace: 'nowrap' // Prevent text wrap
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b71c1c')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#d32f2f')}
                      >
                        Delete Product
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}