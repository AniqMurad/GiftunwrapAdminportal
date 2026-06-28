import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchBlogsAdmin,
  deleteBlog,
  toggleBlogPublished,
} from '../api';
import {
  PageHeader,
  EmptyState,
  TableSkeleton,
  Pagination,
  usePagination,
  Button,
  Badge,
  useToast,
  useConfirm,
} from '../components/ui';

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchAllBlogs();
  }, []);

  const fetchAllBlogs = async () => {
    try {
      const response = await fetchBlogsAdmin();
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const { page, setPage, totalPages, pageItems } = usePagination(blogs, 8);

  const handleDelete = async (id, title) => {
    const ok = await confirm({
      title: 'Delete blog?',
      message: `This will permanently delete "${title}".`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    setDeletingId(id);
    try {
      await deleteBlog(id);
      toast.success('Blog deleted successfully!');
      await fetchAllBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublished = async (id) => {
    setTogglingId(id);
    try {
      await toggleBlogPublished(id);
      await fetchAllBlogs();
    } catch (error) {
      console.error('Error toggling published status:', error);
      toast.error('Failed to toggle published status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Blog Management"
        description="Manage storefront blog posts."
        actions={
          <Button onClick={() => navigate('/post-blog')} icon={<i className="bi bi-plus-lg" aria-hidden="true" />}>
            Add New Blog
          </Button>
        }
      />

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
      ) : blogs.length === 0 ? (
        <EmptyState
          icon="bi-journal-text"
          title="No blogs found"
          description="Create your first blog post to see it listed here."
          action={<Button onClick={() => navigate('/post-blog')}>Add New Blog</Button>}
        />
      ) : (
        <>
          <div className="dt-wrap">
            <div className="dt-scroll">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((blog) => (
                    <tr key={blog.id}>
                      <td data-label="Image">
                        <img src={blog.mainImage} alt={blog.title} className="dt-thumb" />
                      </td>
                      <td data-label="Title">
                        <div className="dt-row-title" style={{ maxWidth: 260 }}>{blog.title}</div>
                        <div className="dt-row-subtitle">{blog.authorDate}</div>
                      </td>
                      <td data-label="Category">{blog.category}</td>
                      <td data-label="Author">{blog.author}</td>
                      <td data-label="Status">
                        <button
                          type="button"
                          onClick={() => togglePublished(blog.id)}
                          disabled={togglingId === blog.id}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                          aria-label={`Toggle published status for ${blog.title}`}
                        >
                          <Badge variant={blog.published ? 'success' : 'danger'}>
                            {togglingId === blog.id ? <span className="spinner spinner-dark" style={{ width: 10, height: 10 }} /> : null}
                            {blog.published ? 'Published' : 'Unpublished'}
                          </Badge>
                        </button>
                      </td>
                      <td className="col-actions" data-label="Actions">
                        <div className="dt-action-group">
                          <Button variant="secondary" size="sm" onClick={() => navigate(`/post-blog/${blog.id}`)}>
                            Edit
                          </Button>
                          <Button
                            variant="danger-ghost"
                            size="sm"
                            loading={deletingId === blog.id}
                            onClick={() => handleDelete(blog.id, blog.title)}
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

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={blogs.length} pageSize={8} />
        </>
      )}
    </div>
  );
};

export default Blogs;
