// Frontend: src/pages/Products.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// API functions
const fetchProducts = () => axios.get('https://giftunwrapbackend.vercel.app/api/products');
const deleteProductById = (productId) => axios.delete(`https://giftunwrapbackend.vercel.app/api/products/${productId}`);
// New API call for updating a product
const updateProductById = (productId, productData, images) => {
  const formData = new FormData();
  formData.append('products', JSON.stringify([productData])); // products field should be an array stringified

  // Append new images if any
  images.forEach(image => {
    formData.append('images', image);
  });

  return axios.put(`https://giftunwrapbackend.vercel.app/api/products/${productId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


export default function Products() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); // State to hold product being edited
  const [editFormData, setEditFormData] = useState({}); // State for form inputs
  const [newImages, setNewImages] = useState([]); // State for new images to upload
  const [currentImagesToRetain, setCurrentImagesToRetain] = useState([]); // State for images currently on the product that should be retained

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

  // Function to initiate editing
  const handleEditClick = (product, category) => {
    setEditingProduct(product._id);
    setEditFormData({
      _id: product._id, // Keep the _id for the update API call
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || '',
      discount: product.discount || '',
      keyGift: product.keyGift,
      subcategory: product.subcategory || '',
      shortDescription: product.shortDescription || '',
      longDescription: product.longDescription || '',
    });
    setNewImages([]); // Clear any previously selected new images
    setCurrentImagesToRetain(product.images || []); // Store existing images to retain
  };

  // Handle form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle new image file selection
  const handleNewImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  // Handle removing an existing image during edit
  const handleRemoveExistingImage = (imageUrlToRemove) => {
    setCurrentImagesToRetain(prevImages => prevImages.filter(url => url !== imageUrlToRemove));
  };

  // Function to submit edited product
  const handleSaveEdit = async () => {
    let productDataToSend = { ...editFormData };

    
    if (newImages.length === 0) {
        productDataToSend.images = currentImagesToRetain;
    } else {
 
    }


    try {
      await updateProductById(editingProduct, productDataToSend, newImages);
      // Update state after successful edit
      setCategories(prevCategories =>
        prevCategories.map(cat => ({
          ...cat,
          products: cat.products.map(p =>
            p._id === editingProduct
              ? {
                  ...p,
                  ...editFormData,
                  
                }
              : p
          ),
        }))
      );
      await fetchUpdatedProducts(); // Re-fetch all products to ensure UI reflects changes, especially images

      setEditingProduct(null); // Exit editing mode
      setEditFormData({}); // Clear form data
      setNewImages([]); // Clear new image selection
      setCurrentImagesToRetain([]); // Clear retained images
      alert('Product updated successfully.');
    } catch (error) {
      alert('Failed to update product.');
      console.error('Error updating product:', error.response?.data || error.message || error);
    }
  };

  const fetchUpdatedProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchProducts();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      console.error('Error re-fetching products:', err);
      setError('Failed to re-load products after update.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditFormData({});
    setNewImages([]);
    setCurrentImagesToRetain([]);
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
              overflow: 'hidden'
            }}
          >
            <thead style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Name</th>
                <th style={{ textAlign: 'right', padding: '10px 8px' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>KeyGift</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Reviews</th>
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
                    {editingProduct === p._id ? (
                      // EDIT MODE
                      <>
                        <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name || ''}
                            onChange={handleEditFormChange}
                            style={{ width: '100%', padding: '5px' }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', padding: '10px 8px', verticalAlign: 'top' }}>
                          <input
                            type="number"
                            name="price"
                            value={editFormData.price || ''}
                            onChange={handleEditFormChange}
                            style={{ width: '80px', padding: '5px' }}
                          />
                        </td>
                        <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                          <input
                            type="text"
                            name="keyGift"
                            value={editFormData.keyGift || ''}
                            onChange={handleEditFormChange}
                            style={{ width: '100%', padding: '5px' }}
                          />
                        </td>
                        <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                          {/* Display existing images and allow removal */}
                          <div style={{ marginBottom: '10px' }}>
                            {currentImagesToRetain.map((imgUrl, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                    <img src={imgUrl} alt="product" style={{ width: '50px', height: '50px', marginRight: '5px', objectFit: 'cover' }} />
                                    <button
                                        onClick={() => handleRemoveExistingImage(imgUrl)}
                                        style={{
                                            background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '0.8em'
                                        }}
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
                          </div>
                          <input
                            type="file"
                            multiple
                            onChange={handleNewImageChange}
                            style={{ width: '100%' }}
                          />
                          {/* Add other fields like description, subcategory, brand if needed */}
                          <textarea
                            name="shortDescription"
                            placeholder="Short Description"
                            value={editFormData.shortDescription || ''}
                            onChange={handleEditFormChange}
                            style={{ width: '100%', minHeight: '50px', padding: '5px', marginTop: '10px' }}
                          />
                          <textarea
                            name="longDescription"
                            placeholder="Long Description"
                            value={editFormData.longDescription || ''}
                            onChange={handleEditFormChange}
                            style={{ width: '100%', minHeight: '80px', padding: '5px', marginTop: '5px' }}
                          />
                          <input
                            type="number"
                            name="originalPrice"
                            placeholder="Original Price (optional)"
                            value={editFormData.originalPrice || ''}
                            onChange={handleEditFormChange}
                            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
                          />
                           <input
                            type="number"
                            name="discount"
                            placeholder="Discount (optional)"
                            value={editFormData.discount || ''}
                            onChange={handleEditFormChange}
                            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
                          />
                          <input
                            type="text"
                            name="subcategory"
                            placeholder="Subcategory (optional)"
                            value={editFormData.subcategory || ''}
                            onChange={handleEditFormChange}
                            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
                          />
                          {/* Reviews are displayed, but not editable here as they have their own management */}
                           <div style={{marginTop: '10px', fontSize: '0.9em', color: '#666'}}>
                             <strong>Current Reviews:</strong>
                             {p.reviews && p.reviews.length > 0 ? (
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                                    {p.reviews.map((review, index) => (
                                        <li key={review._id || index} style={{ marginBottom: '5px', borderBottom: index < p.reviews.length - 1 ? '1px dotted #e0e0e0' : 'none' }}>
                                            Rating: {review.rating}⭐, Comment: {review.comment}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span>No reviews.</span>
                            )}
                           </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '10px 8px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={handleSaveEdit}
                            style={{
                              backgroundColor: '#28a745',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 15px',
                              cursor: 'pointer',
                              borderRadius: '5px',
                              marginRight: '10px',
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              backgroundColor: '#6c757d',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 15px',
                              cursor: 'pointer',
                              borderRadius: '5px',
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      // DISPLAY MODE
                      <>
                        <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                          {p.name}
                          {p.images && p.images.length > 0 && (
                            <div style={{ marginTop: '5px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {p.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`${p.name} image ${idx + 1}`}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '3px' }}
                                />
                              ))}
                            </div>
                          )}
                          {p.shortDescription && <p style={{fontSize: '0.85em', color: '#666', marginTop: '5px', marginBottom: '0'}}><em>{p.shortDescription}</em></p>}
                        </td>
                        <td style={{ textAlign: 'right', padding: '10px 8px', verticalAlign: 'top' }}>
                          ${p.price}
                          {p.originalPrice && p.originalPrice > p.price && (
                            <div style={{fontSize: '0.8em', color: '#999', textDecoration: 'line-through'}}>${p.originalPrice}</div>
                          )}
                          {p.discount && (
                            <div style={{fontSize: '0.8em', color: 'green'}}>({p.discount}% Off)</div>
                          )}
                        </td>
                        <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                          {p.keyGift}
                          {p.subcategory && <div style={{fontSize: '0.85em', color: '#888'}}>({p.subcategory})</div>}
                        </td>
                        <td style={{ padding: '10px 8px', verticalAlign: 'top' }}>
                          {p.reviews && p.reviews.length > 0 ? (
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                              {p.reviews.map((review, index) => (
                                <li key={review._id || index} style={{
                                  marginBottom: '8px',
                                  paddingBottom: '8px',
                                  borderBottom: index < p.reviews.length - 1 ? '1px dotted #e0e0e0' : 'none',
                                  fontSize: '0.9em'
                                }}>
                                  <strong>Rating:</strong> {review.rating} ⭐<br />
                                  <strong>Comment:</strong> {review.comment}<br />
                                  <span><strong>By:</strong> {review.username}<br /></span>
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
                            onClick={() => handleEditClick(p, cat)} // Pass product and category to edit handler
                            style={{
                              backgroundColor: '#007bff',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 15px',
                              cursor: 'pointer',
                              borderRadius: '5px',
                              marginRight: '10px',
                              marginBottom: '5px',
                              transition: 'background-color 0.3s ease',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#0056b3')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#007bff')}
                          >
                            Edit Product
                          </button>
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
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b71c1c')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#d32f2f')}
                          >
                            Delete Product
                          </button>
                        </td>
                      </>
                    )}
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