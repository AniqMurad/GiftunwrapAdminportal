import { useEffect, useState } from 'react';
import { fetchUsers, deleteUserById } from '../api';
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  Pagination,
  usePagination,
  Button,
  useToast,
  useConfirm,
} from '../components/ui';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchUsers();
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const { page, setPage, totalPages, pageItems } = usePagination(users, 10);

  const handleDelete = async (userId, email) => {
    const ok = await confirm({
      title: 'Delete user?',
      message: `This will permanently remove ${email || 'this user'} from the system.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    setDeletingId(userId);
    try {
      await deleteUserById(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      toast.success('User deleted successfully.');
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error('Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader title="All Users" description="Customer accounts registered on the storefront." />

      {error ? (
        <div className="alert-banner alert-banner-danger">
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          {error}
        </div>
      ) : !loading && users.length === 0 ? (
        <EmptyState icon="bi-people" title="No users found" description="Registered customers will appear here." />
      ) : (
        <>
          <div className="dt-wrap">
            <div className="dt-scroll">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>User ID</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableSkeleton rows={6} columns={3} />
                  ) : (
                    pageItems.map((u) => (
                      <tr key={u._id}>
                        <td data-label="Email">{u.email}</td>
                        <td data-label="User ID">
                          <span className="dt-row-subtitle">{u._id}</span>
                        </td>
                        <td className="col-actions" data-label="Actions">
                          <Button
                            variant="danger-ghost"
                            size="sm"
                            loading={deletingId === u._id}
                            onClick={() => handleDelete(u._id, u.email)}
                            icon={<i className="bi bi-trash3" aria-hidden="true" />}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={users.length} pageSize={10} />
          )}
        </>
      )}
    </div>
  );
}
