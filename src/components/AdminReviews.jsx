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
            const response = await axios.get('https://giftunwrapbackend.vercel.app/api/products/reviews');
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
            await axios.delete(`https://giftunwrapbackend.vercel.app/api/products/reviews/${reviewId}`);
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
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mt-4" style={{ maxWidth: '900px' }}>
            <h2 className="mb-4">All Product Reviews</h2>

            {reviews.length === 0 ? (
                <div className="alert alert-info">No reviews found.</div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {reviews.map((review) => (
                        <div key={review._id} className="card shadow-sm">
                            <div className="card-body d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="fw-semibold mb-1">{review.comment}</p>
                                    <p className="text-muted mb-1">
                                        by {review.user ? review.user.name : 'Unknown User'} ({review.user ? review.user.email : 'N/A'})
                                    </p>
                                    <p className="text-muted mb-1">
                                        Product: <strong>{review.productName}</strong> ({review.productCategory}) (ID: {review.productId})
                                    </p>
                                    {review.rating && (
                                        <p className="text-muted mb-1">
                                            Rating: {review.rating}/5
                                        </p>
                                    )}
                                    <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                                        Reviewed on: {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    className="btn btn-sm btn-outline-danger"
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