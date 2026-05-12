import { useEffect, useState } from 'react';
import { fetchQuotes, deleteQuote, updateQuoteStatus } from '../api';

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, contacted, quoted, closed
  const quoteStatuses = ['pending', 'contacted', 'quoted', 'closed'];

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
      alert('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quoteId) => {
    const confirmed = window.confirm('Are you sure you want to delete this quote request?');
    if (!confirmed) return;

    try {
      await deleteQuote(quoteId);
      setQuotes(quotes.filter(quote => quote._id !== quoteId));
      alert('Quote deleted successfully.');
    } catch (error) {
      alert('Failed to delete quote.');
      console.error(error);
    }
  };

  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      const response = await updateQuoteStatus(quoteId, newStatus);
      setQuotes(quotes.map(quote =>
        quote._id === quoteId ? response.data.data : quote
      ));
      alert(`Quote status updated to ${newStatus}.`);
    } catch (error) {
      alert('Failed to update quote status.');
      console.error(error);
    }
  };

  const filteredQuotes = filter === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.status === filter);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'contacted': return 'bg-info';
      case 'quoted': return 'bg-primary';
      case 'closed': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Corporate Quote Requests</h2>
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${filter === 'all' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setFilter('all')}
          >
            All ({quotes.length})
          </button>
          <button 
            className={`btn btn-sm ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({quotes.filter(q => q.status === 'pending').length})
          </button>
          <button 
            className={`btn btn-sm ${filter === 'contacted' ? 'btn-info' : 'btn-outline-info'}`}
            onClick={() => setFilter('contacted')}
          >
            Contacted ({quotes.filter(q => q.status === 'contacted').length})
          </button>
          <button 
            className={`btn btn-sm ${filter === 'quoted' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter('quoted')}
          >
            Quoted ({quotes.filter(q => q.status === 'quoted').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="alert alert-info">
          {filter === 'all' ? 'No quote requests found.' : `No ${filter} quotes found.`}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Company</th>
                <th>Contact Info</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {quote.productImage && (
                        <img 
                          src={quote.productImage} 
                          alt={quote.productName}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          className="rounded me-2"
                        />
                      )}
                      <div>
                        <div className="fw-semibold">{quote.productName}</div>
                        <small className="text-muted">ID: {quote.productId}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold">{quote.companyName}</div>
                  </td>
                  <td>
                    <div>
                      <small className="d-block">
                        📧 {quote.email}
                      </small>
                      {quote.phoneNumber && (
                        <small className="d-block">
                          📱 {quote.phoneNumber}
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-dark">{quote.quantity} units</span>
                  </td>
                  <td>
                    <select
                      className={`form-select form-select-sm badge ${getStatusBadgeColor(quote.status)}`}
                      value={quote.status}
                      onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                      style={{ width: 'auto', color: 'white', border: 'none' }}
                    >
                      {quoteStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <small>{new Date(quote.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          const message = `
Quote Request Details:

Product: ${quote.productName}
Company: ${quote.companyName}
Email: ${quote.email}
${quote.phoneNumber ? `Phone: ${quote.phoneNumber}` : ''}
Quantity: ${quote.quantity} units
Status: ${quote.status}
Date: ${new Date(quote.createdAt).toLocaleString()}

${quote.additionalRequirements ? `Additional Requirements:\n${quote.additionalRequirements}` : ''}
                          `.trim();
                          alert(message);
                        }}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(quote._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredQuotes.length > 0 && (
        <div className="mt-3">
          <small className="text-muted">
            Showing {filteredQuotes.length} of {quotes.length} total quote requests
          </small>
        </div>
      )}
    </div>
  );
}
