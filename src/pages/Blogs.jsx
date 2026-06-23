import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchBlogsAdmin,
  deleteBlog,
  toggleBlogPublished,
} from '../api';

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllBlogs();
  }, []);

  const fetchAllBlogs = async () => {
    try {
      const response = await fetchBlogsAdmin();
      setBlogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await deleteBlog(id);
        alert('Blog deleted successfully!');
        fetchAllBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete blog');
      }
    }
  };

  const togglePublished = async (id) => {
    try {
      await toggleBlogPublished(id);
      fetchAllBlogs();
    } catch (error) {
      console.error('Error toggling published status:', error);
      alert('Failed to toggle published status');
    }
  };

  if (loading) {
    return <div className="tw-scope p-8">Loading...</div>;
  }

  return (
    <div className="tw-scope p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <button
          onClick={() => navigate('/post-blog')}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          Add New Blog
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={blog.mainImage} alt={blog.title} style={{ height: '3.5rem', width: '5.5rem' }} className="object-cover rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                    {blog.title}
                  </div>
                  <div className="text-xs text-gray-500">{blog.authorDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{blog.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{blog.author}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => togglePublished(blog.id)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      blog.published
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {blog.published ? 'Published' : 'Unpublished'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => navigate(`/post-blog/${blog.id}`)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {blogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No blogs found. Create your first blog!
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
