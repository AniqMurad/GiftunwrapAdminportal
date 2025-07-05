import { useEffect, useState } from 'react';
import { fetchMessages, deleteMessageById } from '../api';

export default function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages().then(res => setMessages(res.data));
  }, []);

  const handleDelete = async (messageId) => {
    const confirmed = window.confirm('Are you sure you want to delete this message?');
    if (!confirmed) return;

    try {
      await deleteMessageById(messageId);
      setMessages(messages.filter(msg => msg._id !== messageId));
      alert('Message deleted successfully.');
    } catch (error) {
      alert('Failed to delete message.');
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Messages</h2>

      {messages.length === 0 ? (
        <div className="alert alert-info">No messages found.</div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg._id}
            className="card shadow-sm mb-3"
            style={{ borderLeft: '5px solid #1d4ed8' }} // Removed position: relative here
          >
            <div
              className="card-body"
              style={{ position: 'relative' }} // Add position relative here
            >
              <h5 className="card-title mb-2">{msg.name}</h5>
              <h6 className="card-subtitle mb-2 text-muted">{msg.email}</h6>
              <p className="card-text">{msg.content}</p>

              <button
                onClick={() => handleDelete(msg._id)}
                className="btn btn-danger position-absolute"
                style={{ top: '15px', right: '15px' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
