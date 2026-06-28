import { useState, useEffect } from 'react';
import {
  fetchGiftBoxItems,
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

const categories = [
  'chocolates-snacks',
  'flowers',
  'customised-items',
  'jewellery-accessories',
  'fragrances',
  'clothing',
  'shoes',
  'beauty-personal-care'
];

const categoryLabels = {
  'chocolates-snacks': 'Chocolates & Snacks',
  'flowers': 'Flowers',
  'customised-items': 'Customised Items',
  'jewellery-accessories': 'Jewellery & Accessories',
  'fragrances': 'Fragrances',
  'clothing': 'Clothing',
  'shoes': 'Shoes',
  'beauty-personal-care': 'Beauty & Personal Care'
};

const GiftBoxItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'chocolates-snacks',
    imageFile: null,
    description: '',
    colorVariants: []
  });
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetchItems();
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
    payload.append('description', formData.description || '');

    if (formData.imageFile) {
      payload.append('image', formData.imageFile);
    }

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

    if (!editingItem && !formData.imageFile) {
      toast.error('Please select an image file.');
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
      imageFile: null,
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
      imageFile: null,
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
        description="Items customers can choose from when building a gift box."
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
              <Select label="Category" required name="category" value={formData.category} onChange={handleInputChange}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                ))}
              </Select>
              <Textarea label="Description" name="description" rows="3" value={formData.description} onChange={handleInputChange} />
            </div>

            <ImageDropzone
              label="Item Image"
              required={!editingItem}
              files={formData.imageFile ? [formData.imageFile] : []}
              onFilesChange={(files) => setFormData(prev => ({ ...prev, imageFile: files[0] || null }))}
              existingImages={!formData.imageFile && editingItem?.image ? [editingItem.image] : []}
              help={editingItem ? 'Upload a new image to replace the current one.' : undefined}
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
                <TableSkeleton rows={6} columns={6} />
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
                      <td data-label="Category">{categoryLabels[item.category] || item.category}</td>
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
