import React, { useState, useEffect } from 'react';
import {
  fetchBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogPublished,
} from '../api';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subHeading: '',
    category: '',
    content: '',
    author: 'Admin',
    mainImageFile: null,
    contentImageFiles: []
  });

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

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    
    if (name === 'mainImageFile') {
      setFormData(prev => ({
        ...prev,
        mainImageFile: files?.[0] || null
      }));
    } else if (name === 'contentImageFiles') {
      setFormData(prev => ({
        ...prev,
        contentImageFiles: Array.from(files || [])
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const buildMultipartFormData = () => {
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('subHeading', formData.subHeading);
    payload.append('category', formData.category);
    payload.append('content', formData.content);
    payload.append('author', formData.author);

    if (formData.mainImageFile) {
      payload.append('mainImage', formData.mainImageFile);
    }

    if (formData.contentImageFiles.length > 0) {
      formData.contentImageFiles.forEach((file) => {
        payload.append('contentImages', file);
      });
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = buildMultipartFormData();

      if (editingBlog) {
        await updateBlog(editingBlog.id, payload);
        alert('Blog updated successfully!');
      } else {
        if (!formData.mainImageFile) {
          alert('Please select a main image file.');
          return;
        }

        await createBlog(payload);
        alert('Blog created successfully!');
      }

      resetForm();
      fetchAllBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      subHeading: blog.subHeading,
      category: blog.category,
      content: blog.content,
      author: blog.author,
      mainImageFile: null,
      contentImageFiles: []
    });
    setShowForm(true);
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

  const resetForm = () => {
    setFormData({
      title: '',
      subHeading: '',
      category: '',
      content: '',
      author: 'Admin',
      mainImageFile: null,
      contentImageFiles: []
    });
    setEditingBlog(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          {showForm ? 'Cancel' : 'Add New Blog'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingBlog ? 'Edit Blog' : 'Add New Blog'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sub Heading *</label>
              <input
                type="text"
                name="subHeading"
                value={formData.subHeading}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., General Gifting Guide"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Content *</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows="8"
                placeholder="Write your blog content here..."
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Main Image {editingBlog ? '(optional)' : '*'}
              </label>
              <input
                type="file"
                name="mainImageFile"
                onChange={handleInputChange}
                required={!editingBlog}
                accept="image/*"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              {editingBlog && editingBlog.mainImage && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-gray-500">Current image:</span>
                  <img
                    src={editingBlog.mainImage}
                    alt={editingBlog.title}
                    className="h-16 w-16 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Content Images (optional, max 10)
              </label>
              <input
                type="file"
                name="contentImageFiles"
                onChange={handleInputChange}
                accept="image/*"
                multiple
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              {editingBlog && editingBlog.contentImages && editingBlog.contentImages.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500 block mb-2">Current content images:</span>
                  <div className="flex gap-2 flex-wrap">
                    {editingBlog.contentImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Content ${idx + 1}`}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
              >
                {editingBlog ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
                  <img src={blog.mainImage} alt={blog.title} style={{ height: '5rem', width: '15rem' }} className="object-cover rounded" />
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
                    onClick={() => handleEdit(blog)}
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
