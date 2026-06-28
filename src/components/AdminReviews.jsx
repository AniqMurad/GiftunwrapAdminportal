import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PageHeader,
  EmptyState,
  CardListSkeleton,
  Pagination,
  usePagination,
  Button,
  Card,
  useToast,
  useConfirm,
} from './UI';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  const fetchReviews = async () => {
    try {
      setLoading(true);
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

  const { page, setPage, totalPages, pageItems } = usePagination(reviews, 8);

  const handleDeleteReview = async (reviewId) => {
    const ok = await confirm({
      title: 'Delete review?',
      message: 'This will permanently remove this product review.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    setDeletingId(reviewId);
    try {
      await axios.delete(`https://giftunwrapbackend.vercel.app/api/products/reviews/${reviewId}`);
      toast.success('Review deleted successfully!');
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      if (err.response?.data?.message) {
        toast.error(`Failed to delete review: ${err.response.data.message}`);
      } else {
        toast.error('Failed to delete review. Please try again.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader title="All Product Reviews" description="Customer reviews submitted on storefront products." />

      {error ? (
        <div className="alert-banner alert-banner-danger">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          {error}
        </div>
      ) : loading ? (
        <CardListSkeleton count={3} />
      ) : reviews.length === 0 ? (
        <EmptyState icon="bi-star" title="No reviews found" description="Customer reviews will appear here once submitted." />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {pageItems.map((review) => (
              <Card key={review._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                  <div style={{ minWidth: 0 }}>
                    {review.rating && (
                      <div style={{ marginBottom: '0.4rem' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <i
                            key={i}
                            className={`bi ${i < review.rating ? 'bi-star-fill' : 'bi-star'}`}
                            style={{ color: '#f59e0b', fontSize: '0.85rem', marginRight: '0.1rem' }}
                            aria-hidden="true"
                          />
                        ))}
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-subtle)', marginLeft: '0.3rem' }}>
                          {review.rating}/5
                        </span>
                      </div>
                    )}
                    <p className="dt-row-title" style={{ marginBottom: '0.3rem' }}>{review.comment}</p>
                    <p className="dt-row-subtitle" style={{ marginBottom: '0.15rem' }}>
                      by {review.user ? review.user.name : 'Unknown User'} ({review.user ? review.user.email : 'N/A'})
                    </p>
                    <p className="dt-row-subtitle" style={{ marginBottom: '0.15rem' }}>
                      Product: <strong>{review.productName}</strong> ({review.productCategory}) · ID: {review.productId}
                    </p>
                    <p className="dt-row-subtitle">
                      Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="danger-ghost"
                    size="sm"
                    loading={deletingId === review._id}
                    onClick={() => handleDeleteReview(review._id)}
                    icon={<i className="bi bi-trash3" aria-hidden="true" />}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={reviews.length} pageSize={8} />
        </>
      )}
    </div>
  );
}
