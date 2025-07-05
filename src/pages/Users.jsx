import { useEffect, useState } from 'react';
import { fetchUsers, deleteUserById } from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUserById(userId);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      alert('User deleted successfully.');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>All Users</h2>

      {loading ? (
        <p style={{ textAlign: 'center', fontStyle: 'italic' }}>Loading users...</p>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : users.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No users found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            backgroundColor: '#fafafa',
          }}
        >
          <thead style={{ backgroundColor: '#f0f0f0' }}>
            <tr>
              <th style={{ textAlign: 'left' }}>Email</th>
              <th style={{ textAlign: 'left' }}>User ID</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{u.email}</td>
                <td>{u._id}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => handleDelete(u._id)}
                    style={{
                      backgroundColor: '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'background-color 0.3s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b71c1c')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#d32f2f')}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
