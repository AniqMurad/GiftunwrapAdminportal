import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            // Updated endpoint: Call the new API to get all reviews
            const response = await axios.get('https://giftunwrap-puce.vercel.app/api/products/reviews');
            setReviews(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError('Failed to fetch reviews. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            // Updated endpoint: Call the new API to delete a specific review
            await axios.delete(`https://giftunwrap-puce.vercel.app/api/products/reviews/${reviewId}`);
            alert('Review deleted successfully!');
            fetchReviews(); // Re-fetch reviews to update the list
        } catch (err) {
            console.error('Error deleting review:', err);
            if (err.response && err.response.data && err.response.data.message) {
                alert(`Failed to delete review: ${err.response.data.message}`);
            } else {
                alert('Failed to delete review. Please try again.');
            }
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                Loading reviews...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                {error}
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '24px',
            }}
        >
            <h1
                style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '24px',
                }}
            >
                All Product Reviews
            </h1>

            {reviews.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>
                    No reviews found.
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map((review) => (
                        <div
                            key={review._id} 
                            style={{
                                border: '1px solid #e5e7eb',
                                padding: '16px',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '8px',
                                }}
                            >
                                <div>
                                    <p style={{ fontWeight: '600', fontSize: '16px' }}>{review.comment}</p>
                                    <p style={{ fontSize: '14px', color: '#4b5563' }}>
                                        by {review.user ? review.user.name : 'Unknown User'} ({review.user ? review.user.email : 'N/A'})
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                        Product: <strong>{review.productName}</strong> ({review.productCategory}) (ID: {review.productId})
                                    </p>
                                    {review.rating && (
                                        <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                            Rating: {review.rating}/5
                                        </p>
                                    )}
                                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                                        Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    style={{
                                        backgroundColor: '#d32f2f',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        transition: 'background-color 0.3s ease',
                                    }}
                                    onMouseOver={(e) => (e.target.style.backgroundColor = '#b71c1c')}
                                    onMouseOut={(e) => (e.target.style.backgroundColor = '#d32f2f')}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminReviews;