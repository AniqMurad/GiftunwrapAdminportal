import { useEffect, useState } from 'react';
import { fetchQuotes, deleteQuote, updateQuoteStatus } from '../api';
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  Pagination,
  usePagination,
  Button,
  Badge,
  Modal,
  useToast,
  useConfirm,
} from '../components/ui';

const quoteStatuses = ['pending', 'contacted', 'quoted', 'closed'];

const STATUS_VARIANT = {
  pending: 'warning',
  contacted: 'info',
  quoted: 'primary',
  closed: 'neutral',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'quoted', label: 'Quoted' },
];

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [viewingQuote, setViewingQuote] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const res = await fetchQuotes();
      setQuotes(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quoteId) => {
    const ok = await confirm({
      title: 'Delete quote request?',
      message: 'This will permanently remove this corporate quote request.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    setDeletingId(quoteId);
    try {
      await deleteQuote(quoteId);
      setQuotes(quotes.filter((quote) => quote._id !== quoteId));
      toast.success('Quote deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete quote.');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (quoteId, newStatus) => {
    setUpdatingId(quoteId);
    try {
      const response = await updateQuoteStatus(quoteId, newStatus);
      setQuotes(quotes.map((quote) => (quote._id === quoteId ? response.data.data : quote)));
      toast.success(`Quote status updated to ${newStatus}.`);
    } catch (error) {
      toast.error('Failed to update quote status.');
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredQuotes = filter === 'all' ? quotes : quotes.filter((quote) => quote.status === filter);
  const { page, setPage, totalPages, pageItems } = usePagination(filteredQuotes, 8);

  return (
    <div className="page-shell">
      <PageHeader
        title="Corporate Quote Requests"
        description="Bulk order quote requests submitted by businesses."
      />

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? 'primary' : 'secondary'}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
          >
            {f.label} ({f.key === 'all' ? quotes.length : quotes.filter((q) => q.status === f.key).length})
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="dt-wrap">
          <div className="dt-scroll">
            <table className="dt-table">
              <tbody>
                <TableSkeleton rows={6} columns={6} />
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <EmptyState
          icon="bi-file-earmark-text"
          title="No quote requests found"
          description={filter === 'all' ? 'Quote requests will appear here.' : `No ${filter} quotes found.`}
        />
      ) : (
        <>
          <div className="dt-wrap">
            <div className="dt-scroll">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Company</th>
                    <th>Contact Info</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((quote) => (
                    <tr key={quote._id}>
                      <td data-label="Product">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {quote.productImage && <img src={quote.productImage} alt={quote.productName} className="dt-thumb" />}
                          <div>
                            <div className="dt-row-title">{quote.productName}</div>
                            <div className="dt-row-subtitle">ID: {quote.productId}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Company">
                        <span className="dt-row-title">{quote.companyName}</span>
                      </td>
                      <td data-label="Contact">
                        <div className="dt-row-subtitle">{quote.email}</div>
                        {quote.phoneNumber && <div className="dt-row-subtitle">{quote.phoneNumber}</div>}
                      </td>
                      <td data-label="Quantity">
                        <Badge variant="neutral">{quote.quantity} units</Badge>
                      </td>
                      <td data-label="Status">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <Badge variant={STATUS_VARIANT[quote.status] || 'neutral'}>{quote.status}</Badge>
                          <select
                            className="select"
                            style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                            value={quote.status}
                            disabled={updatingId === quote._id}
                            onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                            aria-label={`Change status for quote from ${quote.companyName}`}
                          >
                            {quoteStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                          {updatingId === quote._id && <span className="spinner spinner-dark" style={{ width: 12, height: 12 }} />}
                        </div>
                      </td>
                      <td data-label="Date">
                        <span className="dt-row-subtitle">{new Date(quote.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="col-actions" data-label="Actions">
                        <div className="dt-action-group">
                          <Button variant="secondary" size="sm" onClick={() => setViewingQuote(quote)}>
                            View
                          </Button>
                          <Button
                            variant="danger-ghost"
                            size="sm"
                            loading={deletingId === quote._id}
                            onClick={() => handleDelete(quote._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filteredQuotes.length} pageSize={8} />
        </>
      )}

      <Modal open={!!viewingQuote} onClose={() => setViewingQuote(null)} title="Quote Request Details">
        {viewingQuote && (
          <div>
            <p className="detail-row"><strong>Product:</strong> {viewingQuote.productName}</p>
            <p className="detail-row"><strong>Company:</strong> {viewingQuote.companyName}</p>
            <p className="detail-row"><strong>Email:</strong> {viewingQuote.email}</p>
            {viewingQuote.phoneNumber && <p className="detail-row"><strong>Phone:</strong> {viewingQuote.phoneNumber}</p>}
            <p className="detail-row"><strong>Quantity:</strong> {viewingQuote.quantity} units</p>
            <p className="detail-row"><strong>Status:</strong> {viewingQuote.status}</p>
            <p className="detail-row"><strong>Date:</strong> {new Date(viewingQuote.createdAt).toLocaleString()}</p>
            {viewingQuote.additionalRequirements && (
              <>
                <p className="detail-section-title" style={{ marginTop: 'var(--space-3)' }}>Additional Requirements</p>
                <p className="detail-row">{viewingQuote.additionalRequirements}</p>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
