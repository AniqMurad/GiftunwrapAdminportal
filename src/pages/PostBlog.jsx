import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchBlogById,
  createBlog,
  updateBlog,
} from '../api';
import {
  PageHeader,
  Card,
  Input,
  Textarea,
  Field,
  ImageDropzone,
  Button,
  useToast,
} from '../components/ui';

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
  const toast = useToast();

  const [formData, setFormData] = useState(emptyFormData);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);

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
        toast.error('Failed to load blog');
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    if (!editingBlog && !formData.mainImageFile) {
      toast.error('Please select a main image file.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildMultipartFormData();

      if (editingBlog) {
        await updateBlog(editingBlog.id, payload);
        toast.success('Blog updated successfully!');
      } else {
        await createBlog(payload);
        toast.success('Blog created successfully!');
      }

      navigate('/blogs');
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error('Failed to save blog');
    } finally {
      setSubmitting(false);
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
    return (
      <div className="page-loader">
        <span className="spinner spinner-dark" style={{ width: 28, height: 28, borderWidth: 3 }} />
        Loading blog...
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        title={editingBlog ? 'Edit Blog' : 'Add New Blog'}
        description="Write and publish storefront blog content."
        actions={
          <Button variant="secondary" onClick={() => navigate('/blogs')}>
            Back to Blogs
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSubmit}>
          <Input label="Title" required name="title" value={formData.title} onChange={handleInputChange} />
          <Input label="Sub Heading" required name="subHeading" value={formData.subHeading} onChange={handleInputChange} />

          <div className="field-row">
            <Input
              label="Category"
              required
              name="category"
              placeholder="e.g., General Gifting Guide"
              value={formData.category}
              onChange={handleInputChange}
            />
            <Input label="Author" required name="author" value={formData.author} onChange={handleInputChange} />
          </div>

          <Field label="Content" required>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem', padding: '0.4rem', background: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <Button type="button" variant="secondary" size="sm" onClick={() => applyLineFormat('h2')} title="Heading (select line(s) first)">
                H2
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => applyLineFormat('h3')} title="Sub-heading (select line(s) first)">
                H3
              </Button>
              <span style={{ width: 1, height: 20, background: 'var(--color-border-strong)' }} />
              <Button type="button" variant="secondary" size="sm" onClick={() => applyLineFormat('bullet')} title="Bullet list (select line(s) first)">
                • List
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => applyLineFormat('number')} title="Numbered list (select line(s) first)">
                1. List
              </Button>
              <span style={{ width: 1, height: 20, background: 'var(--color-border-strong)' }} />
              <Button type="button" variant="secondary" size="sm" onClick={openLinkPopup} icon={<i className="bi bi-link-45deg" aria-hidden="true" />} title="Insert hyperlink (select text first, then click)">
                Insert Link
              </Button>
            </div>

            {showLinkInput && (
              <div
                style={{ marginBottom: '0.6rem', padding: 'var(--space-3)', background: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                onKeyDown={e => e.key === 'Escape' && closeLinkPopup()}
              >
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Link text (optional)"
                    value={linkData.text}
                    onChange={e => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                    className="input"
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  <input
                    ref={linkUrlRef}
                    type="url"
                    placeholder="https://example.com"
                    value={linkData.url}
                    onChange={e => setLinkData(prev => ({ ...prev, url: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleInsertLink()}
                    className="input"
                    style={{ flex: 1, minWidth: 140 }}
                  />
                  <Button type="button" size="sm" onClick={handleInsertLink}>
                    Insert
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={closeLinkPopup}>
                    Cancel
                  </Button>
                </div>
                {linkError ? (
                  <p className="field-error" style={{ marginTop: '0.4rem' }}>
                    <i className="bi bi-exclamation-circle" aria-hidden="true" /> {linkError}
                  </p>
                ) : (
                  <p className="field-help" style={{ marginTop: '0.4rem' }}>
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
              className="textarea"
              style={{ minHeight: 420, fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
            <p className="field-help">
              Use <code>## </code> for a heading, <code>### </code> for a sub-heading, <code>- </code> for a bullet list, <code>1. </code> for a numbered list, and <code>[link text](https://url.com)</code> for links — one item per line. The toolbar buttons above insert these for the selected line(s).
            </p>
          </Field>

          <div className="field-row">
            <Input
              label="Meta Title"
              name="metaTitle"
              placeholder="Defaults to the blog title if left blank"
              value={formData.metaTitle}
              onChange={handleInputChange}
            />
            <Textarea
              label="Meta Description"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleInputChange}
              maxLength="160"
              rows="2"
              placeholder="Defaults to the sub heading if left blank"
            />
          </div>

          <ImageDropzone
            label="Main Image"
            required={!editingBlog}
            accept="image/*"
            files={formData.mainImageFile ? [formData.mainImageFile] : []}
            onFilesChange={(files) => setFormData(prev => ({ ...prev, mainImageFile: files[0] || null }))}
            existingImages={!formData.mainImageFile && editingBlog?.mainImage ? [editingBlog.mainImage] : []}
            help={editingBlog ? 'Upload a new image to replace the current one, or leave as-is to keep it.' : undefined}
          />

          <ImageDropzone
            label="Content Images (optional, max 10)"
            multiple
            maxFiles={10}
            accept="image/*"
            files={formData.contentImageFiles}
            onFilesChange={(files) => setFormData(prev => ({ ...prev, contentImageFiles: files }))}
            existingImages={editingBlog?.contentImages || []}
            help={editingBlog?.contentImages?.length ? 'New uploads are added alongside the current content images.' : undefined}
          />

          <div className="form-actions">
            <Button type="submit" loading={submitting}>
              {editingBlog ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/blogs')} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PostBlog;
