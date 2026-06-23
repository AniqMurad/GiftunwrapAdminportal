import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchBlogById,
  createBlog,
  updateBlog,
} from '../api';

const emptyFormData = {
  title: '',
  subHeading: '',
  category: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
  author: 'Admin',
  mainImageFile: null,
  contentImageFiles: []
};

const PostBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyFormData);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });
  const [linkError, setLinkError] = useState('');
  const contentRef = useRef(null);
  const linkUrlRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const loadBlog = async () => {
      try {
        const response = await fetchBlogById(id);
        const blog = response.data;
        setEditingBlog(blog);
        setFormData({
          title: blog.title,
          subHeading: blog.subHeading,
          category: blog.category,
          content: blog.content,
          metaTitle: blog.metaTitle || '',
          metaDescription: blog.metaDescription || '',
          author: blog.author,
          mainImageFile: null,
          contentImageFiles: []
        });
      } catch (error) {
        console.error('Error fetching blog:', error);
        alert('Failed to load blog');
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

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
    payload.append('metaTitle', formData.metaTitle);
    payload.append('metaDescription', formData.metaDescription);
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

      navigate('/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog');
    }
  };

  const openLinkPopup = () => {
    const textarea = contentRef.current;
    if (textarea) {
      const selectedText = formData.content.substring(textarea.selectionStart, textarea.selectionEnd);
      setLinkData({ text: selectedText, url: '' });
    }
    setLinkError('');
    setShowLinkInput(true);
    setTimeout(() => linkUrlRef.current?.focus(), 0);
  };

  const closeLinkPopup = () => {
    setShowLinkInput(false);
    setLinkError('');
    contentRef.current?.focus();
  };

  const handleInsertLink = () => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const url = linkData.url.trim();
    const text = linkData.text.trim() || url;

    if (!url) {
      setLinkError('Please enter a URL.');
      return;
    }

    // Basic URL validation
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch {
      setLinkError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    const linkMarkdown = `[${text}](${url})`;
    const currentContent = formData.content;
    const newContent =
      currentContent.substring(0, start) + linkMarkdown + currentContent.substring(end);

    setFormData(prev => ({ ...prev, content: newContent }));
    setLinkData({ text: '', url: '' });
    setLinkError('');
    setShowLinkInput(false);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + linkMarkdown.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Applies heading/list markdown syntax to the selected line(s) in the content textarea
  const applyLineFormat = (type) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    let lineEnd = value.indexOf('\n', selectionEnd > selectionStart ? selectionEnd - 1 : selectionEnd);
    if (lineEnd === -1) lineEnd = value.length;

    const selectedLines = value.substring(lineStart, lineEnd).split('\n');
    let counter = 1;

    const formattedLines = selectedLines.map((line) => {
      const trimmed = line.replace(/^(\s*)([-*]\s+|\d+\.\s+|##\s+|###\s+)/, '$1');
      const indentMatch = trimmed.match(/^\s*/);
      const indent = indentMatch ? indentMatch[0] : '';
      const text = trimmed.slice(indent.length);
      if (!text) return line;

      switch (type) {
        case 'bullet':
          return `${indent}- ${text}`;
        case 'number':
          return `${indent}${counter++}. ${text}`;
        case 'h2':
          return `## ${text}`;
        case 'h3':
          return `### ${text}`;
        default:
          return line;
      }
    });

    const newSegment = formattedLines.join('\n');
    const newContent = value.substring(0, lineStart) + newSegment + value.substring(lineEnd);
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + newSegment.length);
    }, 0);
  };

  if (loading) {
    return <div className="tw-scope p-8">Loading...</div>;
  }

  return (
    <div className="tw-scope p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{editingBlog ? 'Edit Blog' : 'Add New Blog'}</h1>
        <button
          type="button"
          onClick={() => navigate('/blogs')}
          className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400"
        >
          Back to Blogs
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Content *</label>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap mb-2 p-1.5 bg-gray-50 border border-gray-200 rounded-md">
              <button
                type="button"
                onClick={() => applyLineFormat('h2')}
                className="text-xs bg-white hover:bg-gray-100 border border-gray-300 px-2.5 py-1 rounded-md font-semibold"
                title="Heading (select line(s) first)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => applyLineFormat('h3')}
                className="text-xs bg-white hover:bg-gray-100 border border-gray-300 px-2.5 py-1 rounded-md font-semibold"
                title="Sub-heading (select line(s) first)"
              >
                H3
              </button>
              <span className="w-px h-5 bg-gray-300 mx-0.5" />
              <button
                type="button"
                onClick={() => applyLineFormat('bullet')}
                className="flex items-center gap-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 px-2.5 py-1 rounded-md font-medium"
                title="Bullet list (select line(s) first)"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => applyLineFormat('number')}
                className="flex items-center gap-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 px-2.5 py-1 rounded-md font-medium"
                title="Numbered list (select line(s) first)"
              >
                1. List
              </button>
              <span className="w-px h-5 bg-gray-300 mx-0.5" />
              <button
                type="button"
                onClick={openLinkPopup}
                className="flex items-center gap-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 px-2.5 py-1 rounded-md font-medium"
                title="Insert hyperlink (select text first, then click)"
              >
                <span>🔗</span> Insert Link
              </button>
            </div>

            {showLinkInput && (
              <div
                className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                onKeyDown={e => e.key === 'Escape' && closeLinkPopup()}
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Link text (optional)"
                    value={linkData.text}
                    onChange={e => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                    className="flex-1 border border-gray-300 px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    ref={linkUrlRef}
                    type="url"
                    placeholder="https://example.com"
                    value={linkData.url}
                    onChange={e => setLinkData(prev => ({ ...prev, url: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleInsertLink()}
                    className="flex-1 border border-gray-300 px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={handleInsertLink}
                    className="bg-black text-white px-4 py-1.5 rounded-md text-sm hover:bg-gray-800 whitespace-nowrap"
                  >
                    Insert
                  </button>
                  <button
                    type="button"
                    onClick={closeLinkPopup}
                    className="bg-gray-300 text-black px-3 py-1.5 rounded-md text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
                {linkError ? (
                  <p className="text-xs text-red-600 mt-1.5">{linkError}</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {linkData.text ? 'Selected text will become the link.' : 'No text selected — the URL itself will be used as the link text.'}
                  </p>
                )}
              </div>
            )}

            <textarea
              ref={contentRef}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows="18"
              placeholder="Write your blog content here...&#10;Tip: Select a line and click H2/H3/List to format it, or select text and click 'Insert Link'."
              className="w-full min-h-[420px] border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use <code>## </code> for a heading, <code>### </code> for a sub-heading, <code>- </code> for a bullet list, <code>1. </code> for a numbered list, and <code>[link text](https://url.com)</code> for links — one item per line. The toolbar buttons above insert these for the selected line(s).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meta Title (SEO, optional)</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                placeholder="Defaults to the blog title if left blank"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meta Description (SEO, optional, max 160 chars)</label>
              <textarea
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                maxLength="160"
                rows="2"
                placeholder="Defaults to the sub heading if left blank"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
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
              onClick={() => navigate('/blogs')}
              className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostBlog;
