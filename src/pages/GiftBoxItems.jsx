import { useState, useEffect } from 'react';
import {
  fetchGiftBoxItems,
  fetchGiftBoxCategories,
  createGiftBoxCategory,
  createGiftBoxItem,
  updateGiftBoxItem,
  deleteGiftBoxItem,
  toggleGiftBoxItemStock,
} from '../api';
import {
  PageHeader,
  Card,
  Input,
  Textarea,
  Select,
  Field,
  ImageDropzone,
  Button,
  Badge,
  EmptyState,
  TableSkeleton,
  Pagination,
  usePagination,
  useToast,
  useConfirm,
} from '../components/UI';

const defaultCategories = [
  { slug: 'chocolates-snacks', name: 'Chocolates & Snacks' },
  { slug: 'customised-items', name: 'Customised Items' },
  { slug: 'jewellery-accessories', name: 'Jewellery & Accessories' },
  { slug: 'fragrances', name: 'Fragrances' },
  { slug: 'clothing', name: 'Clothing' },
  { slug: 'beauty-personal-care', name: 'Beauty & Personal Care' },
];

const humanizeCategory = (value = '') => value
  .split('-')
  .filter(Boolean)
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const profileLabels = {
  'for-him': 'For Him',
  'for-her': 'For Her',
  'unisex': 'Unisex / Both'
};

const GiftBoxItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState(defaultCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'chocolates-snacks',
    profile: 'unisex',
    imageFiles: [],
    retainedImages: [],
    description: '',
    colorVariants: []
  });
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchItems();
    loadCategories();
  }, []);

  const { page, setPage, totalPages, pageItems } = usePagination(items, 8);

  const fetchItems = async () => {
    try {
      const response = await fetchGiftBoxItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load gift box items');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetchGiftBoxCategories();
      if (Array.isArray(response.data) && response.data.length) {
        setCategoryOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching gift box categories:', error);
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCreatingCategory(true);
    try {
      const response = await createGiftBoxCategory({ name });
      const created = response.data;
      setCategoryOptions(prev => [...prev.filter(category => category.slug !== created.slug), created]
        .sort((a, b) => a.name.localeCompare(b.name)));
      setFormData(prev => ({ ...prev, category: created.slug }));
      setNewCategoryName('');
      toast.success('Category created successfully!');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const getCategoryLabel = (slug) => categoryOptions.find(category => category.slug === slug)?.name || humanizeCategory(slug);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addColorVariant = () => {
    setFormData(prev => ({
      ...prev,
      colorVariants: [...prev.colorVariants, { color: '', imageFile: null }]
    }));
  };

  const removeColorVariant = (idx) => {
    setFormData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== idx)
    }));
  };

  const handleColorVariantChange = (idx, field, value) => {
    setFormData(prev => {
      const variants = [...prev.colorVariants];
      variants[idx] = { ...variants[idx], [field]: value };
      return { ...prev, colorVariants: variants };
    });
  };

  const buildMultipartFormData = () => {
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('price', formData.price);
    payload.append('category', formData.category);
    payload.append('profile', formData.profile);
    payload.append('description', formData.description || '');

    formData.imageFiles.forEach(file => payload.append('images', file));
    payload.append('retainedImages', JSON.stringify(formData.retainedImages));

    const colorVariantsMeta = formData.colorVariants.map(v => ({ color: v.color }));
    payload.append('colorVariants', JSON.stringify(colorVariantsMeta));

    formData.colorVariants.forEach((variant, idx) => {
      if (variant.imageFile) {
        payload.append(`colorImage_${idx}`, variant.imageFile);
      }
    });

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.imageFiles.length + formData.retainedImages.length === 0) {
      toast.error('Please select at least one image file.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildMultipartFormData();

      if (editingItem) {
        await updateGiftBoxItem(editingItem.id, payload);
        toast.success('Item updated successfully!');
      } else {
        await createGiftBoxItem(payload);
        toast.success('Item created successfully!');
      }

      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      profile: item.profile || 'unisex',
      imageFiles: [],
      retainedImages: item.images?.length ? item.images : (item.image ? [item.image] : []),
      description: item.description || '',
      colorVariants: (item.colorVariants || []).map(v => ({
        color: v.color,
        existingImage: v.image,
        imageFile: null
      }))
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm({
      title: 'Delete item?',
      message: `This will permanently remove "${name}" from gift box items.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    setDeletingId(id);
    try {
      await deleteGiftBoxItem(id);
      toast.success('Item deleted successfully!');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStock = async (id) => {
    setTogglingId(id);
    try {
      await toggleGiftBoxItemStock(id);
      await fetchItems();
    } catch (error) {
      console.error('Error toggling stock:', error);
      toast.error('Failed to toggle stock status');
    } finally {
      setTogglingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'chocolates-snacks',
      profile: 'unisex',
      imageFiles: [],
      retainedImages: [],
      description: '',
      colorVariants: []
    });
    setEditingItem(null);
    setShowForm(false);
  };

  return (
    <div className="page-shell">
      <PageHeader
        title="Gift Box Items"
        description="Reusable catalogue items for Build a Gift Box and product What’s Inside sections."
        actions={
          <Button variant={showForm ? 'secondary' : 'primary'} onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? 'Cancel' : 'Add New Item'}
          </Button>
        }
      />

      {showForm && (
        <Card className="form-section" bodyClassName="">
          <h2 style={{ margin: '0 0 var(--space-4)', fontSize: '1.1rem', fontWeight: 700 }}>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <Input label="Name" required name="name" value={formData.name} onChange={handleInputChange} />
              <Input label="Price" type="number" required step="0.01" name="price" value={formData.price} onChange={handleInputChange} />
            </div>
            <div className="field-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <Select label="Category" required name="category" value={formData.category} onChange={handleInputChange}>
                  {categoryOptions.map(category => (
                    <option key={category.slug} value={category.slug}>{category.name}</option>
                  ))}
                </Select>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Input
                      label="Create a new category"
                      placeholder="e.g. Books & Journals"
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleCreateCategory();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCreateCategory}
                    loading={creatingCategory}
                    disabled={!newCategoryName.trim()}
                  >
                    Add Category
                  </Button>
                </div>
              </div>
              <Select label="Profile" required name="profile" value={formData.profile} onChange={handleInputChange}>
                <option value="unisex">Unisex / Both</option>
                <option value="for-him">For Him</option>
                <option value="for-her">For Her</option>
              </Select>
            </div>

            <Textarea label="Description" name="description" rows="3" value={formData.description} onChange={handleInputChange} />

            <ImageDropzone
              label="Item Images"
              required={!editingItem}
              multiple
              maxFiles={10}
              files={formData.imageFiles}
              onFilesChange={(files) => setFormData(prev => ({ ...prev, imageFiles: files }))}
              existingImages={formData.retainedImages}
              onRemoveExisting={(url) => setFormData(prev => ({
                ...prev,
                retainedImages: prev.retainedImages.filter(imageUrl => imageUrl !== url),
              }))}
              countExistingTowardLimit
              help="The first image is used on the catalogue card. All images appear in the quick-view gallery. Up to 10 images total."
            />

            <Field label="Color Variants (optional)">
              <Button type="button" variant="secondary" size="sm" onClick={addColorVariant} style={{ marginBottom: 'var(--space-3)' }}>
                + Add Color
              </Button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {formData.colorVariants.map((variant, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', background: 'var(--color-surface-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-subtle)' }}>Color {idx + 1}</span>
                      <Button type="button" variant="danger-ghost" size="sm" onClick={() => removeColorVariant(idx)}>
                        Remove
                      </Button>
                    </div>
                    <div className="field-row">
                      <Input
                        label="Color Name"
                        required
                        placeholder="e.g. Red, Blue, Black…"
                        value={variant.color}
                        onChange={(e) => handleColorVariantChange(idx, 'color', e.target.value)}
                      />
                      <ImageDropzone
                        label={variant.existingImage ? 'Image (upload to replace)' : 'Image'}
                        required={!variant.existingImage}
                        compact
                        files={variant.imageFile ? [variant.imageFile] : []}
                        onFilesChange={(files) => handleColorVariantChange(idx, 'imageFile', files[0] || null)}
                        existingImages={!variant.imageFile && variant.existingImage ? [variant.existingImage] : []}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Field>

            <div className="form-actions">
              <Button type="submit" loading={submitting}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="dt-wrap">
          <div className="dt-scroll">
            <table className="dt-table">
              <tbody>
                <TableSkeleton rows={6} columns={7} />
              </tbody>
            </table>
          </div>
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon="bi-box-seam" title="No gift box items found" description="Items you add will appear here." />
      ) : (
        <>
          <div className="dt-wrap">
            <div className="dt-scroll">
              <table className="dt-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Profile</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Image">
                        <img src={item.image} alt={item.name} className="dt-thumb" />
                        {item.colorVariants?.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                            {item.colorVariants.map((v, i) => (
                              <img key={i} src={v.image} alt={v.color} title={v.color} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border-strong)' }} />
                            ))}
                          </div>
                        )}
                      </td>
                      <td data-label="Name">{item.name}</td>
                      <td data-label="Category">{getCategoryLabel(item.category)}</td>
                      <td data-label="Profile">{profileLabels[item.profile] || profileLabels.unisex}</td>
                      <td data-label="Price">PKR {item.price.toFixed(2)}</td>
                      <td data-label="Status">
                        <Badge variant={item.inStock ? 'success' : 'danger'}>{item.inStock ? 'In Stock' : 'Out of Stock'}</Badge>
                      </td>
                      <td className="col-actions" data-label="Actions">
                        <div className="dt-action-group">
                          <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                          <Button variant="secondary" size="sm" loading={togglingId === item.id} onClick={() => toggleStock(item.id)}>
                            Toggle Stock
                          </Button>
                          <Button variant="danger-ghost" size="sm" loading={deletingId === item.id} onClick={() => handleDelete(item.id, item.name)}>
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

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={items.length} pageSize={8} />
        </>
      )}
    </div>
  );
};

export default GiftBoxItems;
