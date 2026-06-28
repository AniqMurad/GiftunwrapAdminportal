import { useEffect, useState } from 'react';
import { fetchMessages, deleteMessageById } from '../api';
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
} from '../components/UI';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMessages();
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError('Failed to load messages.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const { page, setPage, totalPages, pageItems } = usePagination(messages, 8);

  const handleDelete = async (messageId, name) => {
    const ok = await confirm({
      title: 'Delete message?',
      message: `This will permanently delete the message from ${name || 'this contact'}.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    setDeletingId(messageId);
    try {
      await deleteMessageById(messageId);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      toast.success('Message deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete message.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader title="All Messages" description="Submissions from the storefront contact form." />

      {error ? (
        <div className="alert-banner alert-banner-danger">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          {error}
        </div>
      ) : loading ? (
        <CardListSkeleton count={3} />
      ) : messages.length === 0 ? (
        <EmptyState icon="bi-chat-dots" title="No messages found" description="Contact form submissions will appear here." />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {pageItems.map((msg) => (
              <Card key={msg._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                  <div style={{ minWidth: 0 }}>
                    <p className="dt-row-title" style={{ marginBottom: '0.15rem' }}>{msg.name}</p>
                    <p className="dt-row-subtitle" style={{ marginBottom: '0.6rem' }}>{msg.email}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text)' }}>{msg.content}</p>
                  </div>
                  <Button
                    variant="danger-ghost"
                    size="sm"
                    loading={deletingId === msg._id}
                    onClick={() => handleDelete(msg._id, msg.name)}
                    icon={<i className="bi bi-trash3" aria-hidden="true" />}
                    iconOnly
                    aria-label="Delete message"
                  />
                </div>
              </Card>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={messages.length} pageSize={8} />
        </>
      )}
    </div>
  );
}
